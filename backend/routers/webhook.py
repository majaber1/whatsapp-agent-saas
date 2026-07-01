"""
Webhook Router - Handles WhatsApp messages (real and simulated)
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import os
import httpx

from database import get_db, Conversation, Message, KnowledgeItem, Lead

router = APIRouter()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:7b-instruct")
BUSINESS_NAME = os.getenv("BUSINESS_NAME", "My Business")
EVOLUTION_API_URL = os.getenv("EVOLUTION_API_URL", "http://evolution-api:8080")
EVOLUTION_API_KEY = os.getenv("EVOLUTION_API_KEY", "")
EVOLUTION_INSTANCE = os.getenv("EVOLUTION_INSTANCE_NAME", "my-business")


class SimulatorMessage(BaseModel):
    phone_number: str
    message: str
    customer_name: Optional[str] = "Customer"


class WebhookPayload(BaseModel):
    event: str
    instance: Optional[str] = None
    data: Optional[dict] = None


async def get_knowledge_base(db: AsyncSession) -> str:
    """Get all active knowledge base items"""
    result = await db.execute(
        select(KnowledgeItem).where(KnowledgeItem.is_active == True)
    )
    items = result.scalars().all()
    if not items:
        return "No specific FAQ available."
    
    kb_text = "Business FAQ:\n"
    for item in items:
        kb_text += f"Q: {item.question}\nA: {item.answer}\n\n"
    return kb_text


async def generate_ai_reply(message: str, knowledge_base: str, conversation_history: list) -> str:
    """Generate AI reply using Ollama"""
    history_text = ""
    for msg in conversation_history[-5:]:  # Last 5 messages for context
        role = "Customer" if msg.direction == "inbound" else "Agent"
        history_text += f"{role}: {msg.content}\n"
    
    # Check for escalation keywords
    escalation_keywords = ["human", "person", "agent", "manager", "help me", "urgent", "emergency"]
    needs_escalation = any(kw in message.lower() for kw in escalation_keywords)
    
    if needs_escalation:
        return f"I understand you need more help. Let me connect you with a human agent right away. \n\nA team member will contact you shortly at your number. Thank you for your patience! 🙏\n\n[ESCALATION_NEEDED]"
    
    prompt = f"""You are a helpful WhatsApp customer service agent for {BUSINESS_NAME}.

KNOWLEDGE BASE:
{knowledge_base}

CONVERSATION HISTORY:
{history_text}

CUSTOMER MESSAGE: {message}

Reply as a friendly, professional WhatsApp agent. Keep response brief (1-3 sentences max).
If you don't know the answer, say you'll check and get back to them.
Use emojis occasionally to be friendly.
DO NOT make up information not in the knowledge base."""

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
            )
            result = response.json()
            return result.get("response", "Thank you for your message! Our team will assist you shortly. 😊")
    except Exception as e:
        return "Thank you for your message! Our team will assist you shortly. 😊"


async def process_message(phone_number: str, customer_message: str, customer_name: str, db: AsyncSession):
    """Process an incoming message and generate AI reply"""
    # Get or create conversation
    result = await db.execute(
        select(Conversation).where(
            Conversation.phone_number == phone_number,
            Conversation.status == "active"
        )
    )
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        conversation = Conversation(
            phone_number=phone_number,
            customer_name=customer_name,
            status="active"
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
    
    # Save inbound message
    inbound_msg = Message(
        conversation_id=conversation.id,
        direction="inbound",
        content=customer_message,
        is_ai=False
    )
    db.add(inbound_msg)
    
    # Get conversation history
    history_result = await db.execute(
        select(Message).where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc()).limit(10)
    )
    history = list(reversed(history_result.scalars().all()))
    
    # Get knowledge base
    knowledge_base = await get_knowledge_base(db)
    
    # Generate AI reply
    ai_reply = await generate_ai_reply(customer_message, knowledge_base, history)
    
    # Check for escalation
    needs_takeover = "[ESCALATION_NEEDED]" in ai_reply
    ai_reply = ai_reply.replace("[ESCALATION_NEEDED]", "").strip()
    
    # Save outbound message
    outbound_msg = Message(
        conversation_id=conversation.id,
        direction="outbound",
        content=ai_reply,
        is_ai=True
    )
    db.add(outbound_msg)
    
    # Update conversation
    conversation.message_count += 2
    conversation.needs_takeover = needs_takeover
    if needs_takeover:
        conversation.status = "takeover"
    
    # Check for lead capture
    lead_keywords = ["interested", "price", "cost", "buy", "order", "book", "reserve", "appointment"]
    if any(kw in customer_message.lower() for kw in lead_keywords):
        existing_lead = await db.execute(
            select(Lead).where(Lead.phone_number == phone_number)
        )
        if not existing_lead.scalar_one_or_none():
            lead = Lead(
                phone_number=phone_number,
                name=customer_name,
                interest=customer_message[:200],
                conversation_id=conversation.id
            )
            db.add(lead)
    
    await db.commit()
    
    return {
        "reply": ai_reply,
        "needs_takeover": needs_takeover,
        "conversation_id": conversation.id
    }


@router.post("/simulate")
async def simulate_message(
    payload: SimulatorMessage,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Mock WhatsApp simulator - test without real WhatsApp"""
    result = await process_message(
        phone_number=payload.phone_number,
        customer_message=payload.message,
        customer_name=payload.customer_name,
        db=db
    )
    return result


@router.post("/evolution")
async def evolution_webhook(payload: dict, db: AsyncSession = Depends(get_db)):
    """Handle Evolution API webhook (real WhatsApp)"""
    event = payload.get("event", "")
    
    if event != "messages.upsert":
        return {"status": "ignored"}
    
    data = payload.get("data", {})
    message_data = data.get("messages", [{}])[0]
    
    if message_data.get("key", {}).get("fromMe", True):
        return {"status": "own_message"}
    
    phone = message_data.get("key", {}).get("remoteJid", "").replace("@s.whatsapp.net", "")
    message_content = message_data.get("message", {}).get("conversation", "")
    
    if not phone or not message_content:
        return {"status": "no_content"}
    
    result = await process_message(phone, message_content, "Customer", db)
    
    # Send reply via Evolution API
    if os.getenv("ENABLE_REAL_WHATSAPP", "false").lower() == "true" and EVOLUTION_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                await client.post(
                    f"{EVOLUTION_API_URL}/message/sendText/{EVOLUTION_INSTANCE}",
                    json={"number": phone, "text": result["reply"]},
                    headers={"apikey": EVOLUTION_API_KEY}
                )
        except Exception as e:
            print(f"Failed to send reply: {e}")
    
    return {"status": "ok", "replied": result["reply"][:100]}

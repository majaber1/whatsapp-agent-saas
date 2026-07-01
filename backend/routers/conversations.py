"""
Conversations Router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from database import get_db, Conversation, Message

router = APIRouter()


@router.get("/")
async def list_conversations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Conversation).order_by(Conversation.updated_at.desc())
    )
    conversations = result.scalars().all()
    return [
        {
            "id": c.id,
            "phone_number": c.phone_number,
            "customer_name": c.customer_name,
            "status": c.status,
            "needs_takeover": c.needs_takeover,
            "message_count": c.message_count,
            "created_at": c.created_at,
            "updated_at": c.updated_at
        }
        for c in conversations
    ]


@router.get("/{conversation_id}/messages")
async def get_messages(conversation_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Message).where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()
    return [
        {
            "id": m.id,
            "direction": m.direction,
            "content": m.content,
            "is_ai": m.is_ai,
            "created_at": m.created_at
        }
        for m in messages
    ]


@router.post("/{conversation_id}/takeover")
async def flag_for_takeover(conversation_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(Conversation)
        .where(Conversation.id == conversation_id)
        .values(needs_takeover=True, status="takeover")
    )
    await db.commit()
    return {"message": "Conversation flagged for manual takeover"}


@router.post("/{conversation_id}/resolve")
async def resolve_conversation(conversation_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(
        update(Conversation)
        .where(Conversation.id == conversation_id)
        .values(status="resolved", needs_takeover=False)
    )
    await db.commit()
    return {"message": "Conversation resolved"}


@router.get("/stats/summary")
async def get_stats(db: AsyncSession = Depends(get_db)):
    total_result = await db.execute(select(Conversation))
    all_convos = total_result.scalars().all()
    return {
        "total_conversations": len(all_convos),
        "active": sum(1 for c in all_convos if c.status == "active"),
        "needs_takeover": sum(1 for c in all_convos if c.needs_takeover),
        "resolved": sum(1 for c in all_convos if c.status == "resolved"),
        "total_messages": sum(c.message_count for c in all_convos)
    }

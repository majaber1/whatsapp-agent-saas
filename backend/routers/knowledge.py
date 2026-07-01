"""
Knowledge Base Router - Manage FAQ entries
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from database import get_db, KnowledgeItem

router = APIRouter()


class KnowledgeCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = "general"


@router.get("/")
async def list_knowledge(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(KnowledgeItem).order_by(KnowledgeItem.category))
    items = result.scalars().all()
    return items


@router.post("/")
async def create_knowledge(item: KnowledgeCreate, db: AsyncSession = Depends(get_db)):
    kb_item = KnowledgeItem(
        question=item.question,
        answer=item.answer,
        category=item.category
    )
    db.add(kb_item)
    await db.commit()
    await db.refresh(kb_item)
    return kb_item


@router.put("/{item_id}")
async def update_knowledge(item_id: int, item: KnowledgeCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(KnowledgeItem).where(KnowledgeItem.id == item_id))
    kb_item = result.scalar_one_or_none()
    if not kb_item:
        raise HTTPException(status_code=404, detail="Item not found")
    kb_item.question = item.question
    kb_item.answer = item.answer
    kb_item.category = item.category
    await db.commit()
    return kb_item


@router.delete("/{item_id}")
async def delete_knowledge(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(KnowledgeItem).where(KnowledgeItem.id == item_id))
    kb_item = result.scalar_one_or_none()
    if not kb_item:
        raise HTTPException(status_code=404, detail="Item not found")
    await db.delete(kb_item)
    await db.commit()
    return {"message": "Deleted successfully"}


@router.post("/seed")
async def seed_demo_knowledge(db: AsyncSession = Depends(get_db)):
    """Seed demo FAQ data"""
    demo_items = [
        {"q": "What are your working hours?", "a": "We are open Sunday to Thursday, 9 AM to 6 PM AST.", "cat": "general"},
        {"q": "How can I place an order?", "a": "You can place an order by WhatsApp, our website, or visiting our store.", "cat": "orders"},
        {"q": "What is your return policy?", "a": "We accept returns within 14 days with original receipt and packaging.", "cat": "policy"},
        {"q": "Do you offer delivery?", "a": "Yes, we offer delivery within 24-48 hours. Delivery fee depends on location.", "cat": "delivery"},
        {"q": "How can I track my order?", "a": "Send your order number to us on WhatsApp and we will check immediately.", "cat": "orders"},
        {"q": "What payment methods do you accept?", "a": "We accept cash, credit cards, mada, Apple Pay, and bank transfer.", "cat": "payment"},
        {"q": "Do you have a physical store?", "a": "Yes! Visit us at our main branch. Address details available on our website.", "cat": "general"},
    ]
    
    for item in demo_items:
        kb_item = KnowledgeItem(question=item["q"], answer=item["a"], category=item["cat"])
        db.add(kb_item)
    
    await db.commit()
    return {"message": f"Seeded {len(demo_items)} demo FAQ items"}

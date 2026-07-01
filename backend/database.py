"""
Database models for WhatsApp Agent SaaS
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Float, ForeignKey
from sqlalchemy.sql import func
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://whatsapp:whatsapp123@postgres:5432/whatsappdb"
).replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, index=True, nullable=False)
    customer_name = Column(String)
    status = Column(String, default="active")  # active, resolved, takeover
    needs_takeover = Column(Boolean, default=False)
    message_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    direction = Column(String)  # inbound / outbound
    message_type = Column(String, default="text")
    content = Column(Text, nullable=False)
    is_ai = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String, default="general")
    is_active = Column(Boolean, default=True)
    times_used = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, nullable=False)
    name = Column(String)
    email = Column(String)
    interest = Column(Text)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    status = Column(String, default="new")  # new, contacted, converted, lost
    created_at = Column(DateTime, server_default=func.now())


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created")

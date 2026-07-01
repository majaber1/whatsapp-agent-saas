"""
WhatsApp Agent SaaS - FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from routers import auth, conversations, knowledge, leads, webhook
from database import create_tables

app = FastAPI(
    title="WhatsApp Agent SaaS API",
    description="AI-powered WhatsApp assistant for small businesses",
    version="1.0.0"
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["Conversations"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["Knowledge Base"])
app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(webhook.router, prefix="/api/webhook", tags=["WhatsApp Webhook"])


@app.on_event("startup")
async def startup_event():
    await create_tables()
    print(f"WhatsApp Agent SaaS started!")
    print(f"AI Model: {os.getenv('OLLAMA_MODEL', 'qwen2.5:7b-instruct')}")
    print(f"Real WhatsApp: {os.getenv('ENABLE_REAL_WHATSAPP', 'false')}")


@app.get("/")
async def root():
    return {
        "app": "WhatsApp Agent SaaS",
        "version": "1.0.0",
        "status": "running",
        "real_whatsapp": os.getenv("ENABLE_REAL_WHATSAPP", "false"),
        "mock_simulator": os.getenv("ENABLE_MOCK_SIMULATOR", "true"),
        "model": os.getenv("OLLAMA_MODEL", "qwen2.5:7b-instruct")
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

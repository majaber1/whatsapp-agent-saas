"""
Auth Router - Simple JWT authentication
"""
from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@demo.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "demo123")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
HASHED_ADMIN_PASSWORD = pwd_context.hash(ADMIN_PASSWORD)


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(request: LoginRequest):
    if request.email != ADMIN_EMAIL or not pwd_context.verify(request.password, HASHED_ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode(
        {"sub": request.email, "exp": datetime.utcnow() + timedelta(hours=24)},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"email": request.email, "role": "admin"}
    }


@router.get("/demo-credentials")
async def demo_creds():
    return {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD, "note": "Demo mode only"}

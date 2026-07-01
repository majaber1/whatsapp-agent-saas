"""
Leads Router - Capture and export leads
"""
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import csv
import io
from database import get_db, Lead

router = APIRouter()


class LeadUpdate(BaseModel):
    status: str
    notes: Optional[str] = None


@router.get("/")
async def list_leads(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).order_by(Lead.created_at.desc()))
    leads = result.scalars().all()
    return [
        {
            "id": l.id,
            "phone_number": l.phone_number,
            "name": l.name,
            "email": l.email,
            "interest": l.interest,
            "status": l.status,
            "created_at": l.created_at
        }
        for l in leads
    ]


@router.get("/export/csv")
async def export_leads_csv(db: AsyncSession = Depends(get_db)):
    """Export all leads as CSV"""
    result = await db.execute(select(Lead).order_by(Lead.created_at.desc()))
    leads = result.scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Phone", "Name", "Email", "Interest", "Status", "Created At"])
    
    for lead in leads:
        writer.writerow([
            lead.id, lead.phone_number, lead.name or "",
            lead.email or "", lead.interest or "", lead.status,
            lead.created_at.strftime("%Y-%m-%d %H:%M") if lead.created_at else ""
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=leads_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@router.get("/stats")
async def get_lead_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead))
    leads = result.scalars().all()
    return {
        "total": len(leads),
        "new": sum(1 for l in leads if l.status == "new"),
        "contacted": sum(1 for l in leads if l.status == "contacted"),
        "converted": sum(1 for l in leads if l.status == "converted"),
        "lost": sum(1 for l in leads if l.status == "lost")
    }


@router.put("/{lead_id}/status")
async def update_lead_status(lead_id: int, update: LeadUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if lead:
        lead.status = update.status
        await db.commit()
    return {"message": "Updated"}


# Stub for unused imports in main.py
class AuthRouter:
    pass

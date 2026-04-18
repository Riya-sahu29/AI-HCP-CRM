from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Interaction
from schemas import InteractionCreate, InteractionUpdate, InteractionResponse
from typing import List

router = APIRouter(prefix="/interactions", tags=["Interactions"])

# Valid types MySQL accepts
VALID_TYPES = ["visit", "call", "email", "conference", "meeting"]

def sanitize_type(value: str) -> str:
    """Make sure interaction_type is always a valid ENUM value"""
    if not value:
        return "visit"
    cleaned = value.strip().lower()
    return cleaned if cleaned in VALID_TYPES else "visit"

@router.post("/", response_model=InteractionResponse)
def create_interaction(payload: InteractionCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["interaction_type"] = sanitize_type(data.get("interaction_type", "visit"))
    interaction = Interaction(**data)
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction

@router.get("/", response_model=List[InteractionResponse])
def get_all_interactions(db: Session = Depends(get_db)):
    return db.query(Interaction).order_by(Interaction.created_at.desc()).all()

@router.get("/{interaction_id}", response_model=InteractionResponse)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(
        Interaction.id == interaction_id
    ).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction

@router.put("/{interaction_id}", response_model=InteractionResponse)
def update_interaction(
    interaction_id: int,
    payload: InteractionUpdate,
    db: Session = Depends(get_db)
):
    interaction = db.query(Interaction).filter(
        Interaction.id == interaction_id
    ).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "interaction_type" in update_data:
        update_data["interaction_type"] = sanitize_type(update_data["interaction_type"])

    for key, value in update_data.items():
        setattr(interaction, key, value)

    db.commit()
    db.refresh(interaction)
    return interaction

@router.delete("/{interaction_id}")
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(
        Interaction.id == interaction_id
    ).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    db.delete(interaction)
    db.commit()
    return {"message": "Interaction deleted successfully"}
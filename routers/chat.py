from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import ChatMessage
from agent import run_agent, set_db_session

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/")
def chat_with_agent(payload: ChatMessage, db: Session = Depends(get_db)):
    try:                                                                       
        set_db_session(db)
        response = run_agent(
            user_message=payload.message,
            conversation_history=payload.conversation_history or []
        )
        # Always return plain string
        if isinstance(response, dict):
            response = response.get("reply") or response.get("content") or str(response)
        return {"status": "success", "response": str(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

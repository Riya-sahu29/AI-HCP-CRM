

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

#  Create Interaction

class InteractionCreate(BaseModel):
    hcp_name:         str                    
    hcp_specialty:    Optional[str] = None   
    interaction_type: Optional[str] = "visit"
    product_discussed:Optional[str] = None   
    notes:            Optional[str] = None  
    follow_up_date:   Optional[str] = None   
    follow_up_notes:  Optional[str] = None   
    interaction_date: Optional[str] = None   

#  Update Interaction 


class InteractionUpdate(BaseModel):
    hcp_name:         Optional[str] = None
    hcp_specialty:    Optional[str] = None
    interaction_type: Optional[str] = None
    product_discussed:Optional[str] = None
    notes:            Optional[str] = None
    follow_up_date:   Optional[str] = None
    follow_up_notes:  Optional[str] = None
    interaction_date: Optional[str] = None

#  Interaction Response 

class InteractionResponse(BaseModel):
    id:               int
    hcp_name:         str
    hcp_specialty:    Optional[str]
    interaction_type: str
    product_discussed:Optional[str]
    notes:            Optional[str]
    ai_summary:       Optional[str]   
    follow_up_date:   Optional[str]
    follow_up_notes:  Optional[str]
    interaction_date: Optional[str]
    created_at:       Optional[datetime]
    updated_at:       Optional[datetime]

    class Config:
        from_attributes = True  

#  Chat Message 

class ChatMessage(BaseModel):
    message:              str            
    conversation_history: Optional[list] = [] 
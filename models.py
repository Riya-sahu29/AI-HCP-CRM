
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.sql import func
from database import Base
import enum

#  Enum for Interaction Types 
class InteractionType(str, enum.Enum):
    visit      = "visit"       
    call       = "call"        
    email      = "email"       
    conference = "conference"  
    meeting    = "meeting"     

# Interactions Table 
class Interaction(Base):
    __tablename__ = "interactions"  # MySQL table name

    # Primary key - auto increments
    id = Column(Integer, primary_key=True, index=True)

    # Doctor / HCP details
    hcp_name      = Column(String(255), nullable=False)
    hcp_specialty = Column(String(255), nullable=True)

    # Interaction details
    interaction_type  = Column(
        Enum(InteractionType),
        default=InteractionType.visit,
        nullable=False
    )
    product_discussed = Column(String(255), nullable=True)
    notes             = Column(Text, nullable=True)
    ai_summary        = Column(Text, nullable=True)
    interaction_date  = Column(String(100), nullable=True)

    # Follow-up details
    follow_up_date  = Column(String(100), nullable=True)
    follow_up_notes = Column(Text, nullable=True)

    # Auto timestamps
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now()
    )
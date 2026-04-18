
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import TypedDict, Annotated, List
import operator
from dotenv import load_dotenv
from sqlalchemy.orm import Session
import os
import json

load_dotenv()

#  Initialize Groq LLM 
llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",   
    temperature=0.1,         
)

# Database Session 
# This gets set from chat.py before agent runs
_db_session: Session = None

def set_db_session(db: Session):
    """Injects the database session into agent at runtime"""
    global _db_session
    _db_session = db



# TOOL 1 — LOG INTERACTION
# Saves a new HCP interaction to database
# AI also generates a smart summary of the interaction

@tool
def log_interaction(
    hcp_name:         str,
    notes:            str,
    product_discussed:str = "",
    interaction_type: str = "visit",
    hcp_specialty:    str = "",
    follow_up_date:   str = "",
    interaction_date: str = "",
) -> str:
    """
    Log a new interaction with an HCP (Healthcare Professional / Doctor).
    Use this tool when user wants to record or log a new meeting,
    call, email or any interaction with a doctor or HCP.
    The AI will auto-generate a professional summary of the interaction.
    """
    try:
        from models import Interaction

        # Use LLM to generate a clean professional summary
        summary_prompt = f"""
        You are a pharma CRM assistant.
        Write a professional 2-3 sentence summary of this HCP interaction for CRM records:
        Doctor Name   : {hcp_name}
        Specialty     : {hcp_specialty}
        Type          : {interaction_type}
        Product       : {product_discussed}
        Meeting Notes : {notes}
        Keep it concise and professional.
        """
        summary_response = llm.invoke([HumanMessage(content=summary_prompt)])
        ai_summary = summary_response.content

        # Save to MySQL database
        interaction = Interaction(
            hcp_name         = hcp_name,
            hcp_specialty    = hcp_specialty,
            interaction_type = interaction_type,
            product_discussed= product_discussed,
            notes            = notes,
            ai_summary       = ai_summary,
            follow_up_date   = follow_up_date,
            interaction_date = interaction_date,
        )
        _db_session.add(interaction)
        _db_session.commit()
        _db_session.refresh(interaction)

        return json.dumps({
            "status"        : "success",
            "message"       : f"Interaction with {hcp_name} logged successfully!",
            "interaction_id": interaction.id,
            "ai_summary"    : ai_summary,
        })
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})



# TOOL 2 — EDIT INTERACTION
# Updates an existing interaction in the database by ID
# AI regenerates the summary after update

@tool
def edit_interaction(
    interaction_id:       int,
    updated_notes:        str = "",
    updated_product:      str = "",
    updated_follow_up_date: str = "",
) -> str:
    """
    Edit or update an existing HCP interaction by its ID.
    Use this when user wants to modify, update or correct
    a previously logged interaction. Requires the interaction ID.
    """
    try:
        from models import Interaction

        # Find the interaction in database
        interaction = _db_session.query(Interaction).filter(
            Interaction.id == interaction_id
        ).first()

        if not interaction:
            return json.dumps({
                "status" : "error",
                "message": f"No interaction found with ID {interaction_id}."
            })

        # Update only fields that were provided
        if updated_notes:
            interaction.notes = updated_notes
        if updated_product:
            interaction.product_discussed = updated_product
        if updated_follow_up_date:
            interaction.follow_up_date = updated_follow_up_date

        # Regenerate AI summary with updated info
        summary_prompt = f"""
        Write a professional 2-3 sentence CRM summary for this updated interaction:
        Doctor : {interaction.hcp_name}
        Notes  : {interaction.notes}
        Product: {interaction.product_discussed}
        """
        summary_response     = llm.invoke([HumanMessage(content=summary_prompt)])
        interaction.ai_summary = summary_response.content

        _db_session.commit()

        return json.dumps({
            "status"    : "success",
            "message"   : f"Interaction {interaction_id} updated successfully!",
            "ai_summary": interaction.ai_summary,
        })
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})



# TOOL 3 — SUMMARIZE INTERACTIONS
# Fetches all past interactions with an HCP
# AI generates a smart summary with insights

@tool
def summarize_interactions(hcp_name: str) -> str:
    """
    Summarize all past interactions with a specific HCP or doctor.
    Use this when user asks for history, summary or overview
    of all meetings with a particular doctor or HCP.
    """
    try:
        from models import Interaction

        # Get all interactions for this HCP
        interactions = _db_session.query(Interaction).filter(
            Interaction.hcp_name.ilike(f"%{hcp_name}%")
        ).all()

        if not interactions:
            return json.dumps({
                "status" : "not_found",
                "message": f"No interactions found for {hcp_name}."
            })

        # Build a text summary of all interactions
        all_notes = "\n".join([
            f"- [{i.interaction_date or 'N/A'}] {i.interaction_type}: {i.notes}"
            for i in interactions
        ])

        # Ask AI to summarize all interactions
        summary_prompt = f"""
        You are a pharma CRM assistant.
        Summarize all interactions with Dr. {hcp_name} below.
        Provide key insights, products discussed, and recommended follow-up actions.
        Use bullet points. Be concise and professional.

        Interactions:
        {all_notes}
        """
        summary_response = llm.invoke([HumanMessage(content=summary_prompt)])

        return json.dumps({
            "status"            : "success",
            "hcp_name"          : hcp_name,
            "total_interactions": len(interactions),
            "summary"           : summary_response.content,
        })
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})



# TOOL 4 — FETCH HCP PROFILE
# Returns complete profile of an HCP
# Includes interaction count, products discussed, last visit

@tool
def fetch_hcp_profile(hcp_name: str) -> str:
    """
    Fetch the complete profile and interaction history of an HCP or doctor.
    Use this when user wants to know details, full history or profile
    of a specific doctor or healthcare professional.
    """
    try:
        from models import Interaction

        # Get all interactions ordered by newest first
        interactions = _db_session.query(Interaction).filter(
            Interaction.hcp_name.ilike(f"%{hcp_name}%")
        ).order_by(Interaction.created_at.desc()).all()

        if not interactions:
            return json.dumps({
                "status" : "not_found",
                "message": f"No profile found for {hcp_name}."
            })

        # Extract unique products and specialties
        products    = list(set([
            i.product_discussed for i in interactions
            if i.product_discussed
        ]))
        specialties = list(set([
            i.hcp_specialty for i in interactions
            if i.hcp_specialty
        ]))

        profile = {
            "hcp_name"          : hcp_name,
            "specialty"         : specialties[0] if specialties else "Unknown",
            "total_interactions": len(interactions),
            "products_discussed": products,
            "last_interaction"  : interactions[0].interaction_date,
            "last_notes"        : interactions[0].notes,
            "upcoming_followup" : interactions[0].follow_up_date,
        }

        return json.dumps({"status": "success", "profile": profile})
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})



# TOOL 5 — SCHEDULE FOLLOW-UP
# Saves a follow-up date and notes to the latest interaction

@tool
def schedule_followup(
    hcp_name:       str,
    follow_up_date: str,
    follow_up_notes:str = "",
) -> str:
    """
    Schedule or update a follow-up meeting with an HCP or doctor.
    Use this when user wants to set a reminder, plan a next visit,
    schedule a follow-up call or meeting with a doctor.
    """
    try:
        from models import Interaction

        # Find most recent interaction with this HCP
        interaction = _db_session.query(Interaction).filter(
            Interaction.hcp_name.ilike(f"%{hcp_name}%")
        ).order_by(Interaction.created_at.desc()).first()

        if not interaction:
            return json.dumps({
                "status" : "not_found",
                "message": f"No interaction found for {hcp_name}."
            })

        # Save follow-up details
        interaction.follow_up_date  = follow_up_date
        interaction.follow_up_notes = follow_up_notes
        _db_session.commit()

        return json.dumps({
            "status"         : "success",
            "message"        : f"Follow-up with {hcp_name} scheduled on {follow_up_date}.",
            "follow_up_notes": follow_up_notes,
        })
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})



# LANGGRAPH AGENT SETUP
# Builds the graph: START → agent → tools → agent → END


# All 5 tools registered here
tools = [
    log_interaction,
    edit_interaction,
    summarize_interactions,
    fetch_hcp_profile,
    schedule_followup,
]

# Bind tools to LLM so it knows what tools are available
llm_with_tools = llm.bind_tools(tools)

# Agent State 
class AgentState(TypedDict):
    messages: Annotated[List, operator.add]

#  Agent Node 
def agent_node(state: AgentState):
    """
    Main agent node - reads user message and decides
    which tool to call or responds directly
    """
    system_message = SystemMessage(content="""
    You are an AI assistant for a Pharma CRM system.
    You help field sales representatives log and manage
    their interactions with Healthcare Professionals (HCPs/Doctors).

    You have access to these 5 tools:
    1. log_interaction       - Log a new HCP interaction
    2. edit_interaction      - Edit an existing interaction by ID
    3. summarize_interactions- Summarize all interactions with an HCP
    4. fetch_hcp_profile     - Get full profile of an HCP
    5. schedule_followup     - Schedule a follow-up with an HCP

    Always extract relevant details from the user message.
    Be professional, helpful and concise in your responses.
    """)

    messages = [system_message] + state["messages"]
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

# Router 
def should_continue(state: AgentState):
    """
    Decides whether to call a tool or end the conversation.
    If AI wants to use a tool → go to tools node
    If AI has final answer → END
    """
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END

#  Build the Graph 
tool_node     = ToolNode(tools)         
graph_builder = StateGraph(AgentState)   

graph_builder.add_node("agent", agent_node)  
graph_builder.add_node("tools", tool_node)   
graph_builder.set_entry_point("agent")       

# agent → check if tool needed → tools → back to agent → END
graph_builder.add_conditional_edges("agent", should_continue)
graph_builder.add_edge("tools", "agent")

# Compile the graph
graph = graph_builder.compile()


#  Run Agent 
def run_agent(user_message: str, conversation_history: list = []) -> str:
    """
    Main function called from chat.py
    Takes user message + history, runs through graph, returns AI response
    """
    messages = []

    # Rebuild conversation history as LangChain messages
    for msg in conversation_history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    # Add the new user message
    messages.append(HumanMessage(content=user_message))

    # Run through LangGraph
    result       = graph.invoke({"messages": messages})
    last_message = result["messages"][-1]

    return last_message.content
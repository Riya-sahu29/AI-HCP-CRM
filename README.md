# AI-First CRM HCP Module (Healthcare Professional CRM)

## Overview
This project is an AI-first Customer Relationship Management (CRM) system focused on Healthcare Professional (HCP) interaction management for Life Sciences field representatives.

It supports logging HCP interactions through:

- Structured Form-based Interaction Logging
- Conversational AI Chat Interface
- LangGraph-based AI Agent with Groq LLM (gemma2-9b-it)
- FastAPI Backend
- React + Redux Frontend
- MySQL Database

---

## Tech Stack

### Frontend
- React
- Redux Toolkit
- Tailwind CSS
- Axios
- Vite

### Backend
- Python
- FastAPI
- LangGraph
- Groq LLM (gemma2-9b-it)
- SQLAlchemy
- MySQL

---

## Core Features

### Log Interaction (Tool 1)
Captures HCP interaction details through:
- Manual form entry
- AI conversational logging
- AI-assisted summarization
- Entity extraction
- Interaction persistence in database

---

### Edit Interaction (Tool 2)
Allows updating previously logged interactions.

---

### HCP Profile Retrieval (Tool 3)
Retrieves HCP profile details and interaction history.

---

### AI Follow-up Suggestions (Tool 4)
Suggests next best actions such as:
- Schedule follow-up
- Share product brochure
- Advisory board invite suggestion

---

### Interaction Summary (Tool 5)
Summarizes prior interactions for quick review.

---

## Project Structure

```plaintext
frontend/
 ├── src/
 ├── public/
 └── package.json

routers/
 ├── chat.py
 └── interaction.py

main.py
database.py
models.py
schemas.py
agent.py
requirements.txt
```

---

## Installation

## Backend Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs on:

```plaintext
http://localhost:8000
```

Swagger docs:

```plaintext
http://localhost:8000/docs
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```plaintext
http://localhost:5173
```

---

## Environment Variables

Create .env

```env
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=your_mysql_connection_string
```

---

## Example AI Interaction

User Input:

```plaintext
Met Dr. Sharma today, discussed Metformin 500mg, shared brochure, positive sentiment.
```

AI Agent:
- Extracts interaction details
- Suggests follow-up
- Can auto-populate structured form fields

---

## Architecture Flow

```plaintext
React UI
↓
Redux State
↓
FastAPI API
↓
LangGraph Agent
↓
Groq LLM + Tools
↓
MySQL Database
```

---

## Assignment Deliverables Covered

- React frontend URL walkthrough
- 5 LangGraph tools demonstrated
- Code flow explanation
- AI-first CRM architecture
- HCP interaction logging via form + chat

---

## Author
Riya Priyadarsani Sahu

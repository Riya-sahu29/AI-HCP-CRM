from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import routers.interaction as interactions
import routers.chat as chat

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HCP CRM API",
    version="1.0.0",
    redirect_slashes=True
)                                        

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],         
)

app.include_router(interactions.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "HCP CRM API is running!"}                 

@app.get("/health")
def health():
    return {"status": "healthy"}


from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load .env file so we can read DATABASE_URL
load_dotenv()

# Read database connection string from .env
DATABASE_URL = os.getenv("DATABASE_URL")
                                                    
# Create the MySQL engine (connection pool)
engine = create_engine(
    DATABASE_URL,
    echo=True  
)

# SessionLocal is used to create database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)                                      

# Base class for all our database models
Base = declarative_base()

#  Dependency 
def get_db():
    """
    Creates a new database session for each request
    and closes it automatically when request is done
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

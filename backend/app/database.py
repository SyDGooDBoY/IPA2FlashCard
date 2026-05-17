from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os

load_dotenv()
# Database setup 
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing in .env")

engine = create_engine(DATABASE_URL, echo=True)

# Database setup and session management for the flashcard application, using SQLModel and SQLAlchemy.
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# Dependency to get a database session for request handling
def get_session():
    with Session(engine) as session:
        yield session
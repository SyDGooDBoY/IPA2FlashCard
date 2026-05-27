import os

from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() == "true"

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required. Configure MySQL in backend/.env")

engine = create_engine(DATABASE_URL, echo=SQL_ECHO)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

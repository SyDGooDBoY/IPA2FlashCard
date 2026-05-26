import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from app.database import create_db_and_tables, engine
from app.routers import auth_routes, decks, flashcards, history
from app.seed import ensure_default_admin

app = FastAPI(title="Flashcard Learning App API")

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    with Session(engine) as session:
        ensure_default_admin(session)


@app.get("/")
def root():
    return {"message": "Flashcard Learning App API is running"}


app.include_router(auth_routes.router)
app.include_router(decks.router)
app.include_router(flashcards.router)
app.include_router(history.router)

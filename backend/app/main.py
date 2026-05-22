from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_db_and_tables
from app.routers import auth_routes, decks, flashcards, history

app = FastAPI(title="Flashcard Learning App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def root():
    return {"message": "Flashcard Learning App API is running"}


app.include_router(auth_routes.router)
app.include_router(decks.router)
app.include_router(flashcards.router)
app.include_router(history.router)
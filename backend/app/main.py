from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_db_and_tables
from app.routers import auth_routes, decks, flashcards, history


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables() # Initialize the database and create tables on application startup
    yield


app = FastAPI(
    title="Flashcard Learning App API",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Flashcard Learning App API is running"}


app.include_router(auth_routes.router)
app.include_router(decks.router)
app.include_router(flashcards.router)
app.include_router(history.router)
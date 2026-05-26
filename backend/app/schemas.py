from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel

# Pydantic models for request validation and response formatting in the flashcard application
# including user creation, deck management, flashcard management, and view history tracking.

class Token(SQLModel):
    access_token: str
    token_type: str


class UserCreate(SQLModel):
    username: str
    email: str
    password: str


class UserRead(SQLModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime


class UserUpdate(SQLModel):
    email: Optional[str] = None


class PasswordChange(SQLModel):
    current_password: str
    new_password: str


class DeckCreate(SQLModel):
    title: str
    description: Optional[str] = None


class DeckUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None


class DeckRead(SQLModel):
    id: int
    title: str
    description: Optional[str]
    owner_id: int
    created_at: datetime


class FlashcardCreate(SQLModel):
    question: str
    answer: str
    deck_id: int


class FlashcardUpdate(SQLModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    deck_id: Optional[int] = None


class FlashcardRead(SQLModel):
    id: int
    question: str
    answer: str
    deck_id: int
    owner_id: int
    created_at: datetime


class HistoryCreate(SQLModel):
    flashcard_id: int
    is_correct: bool = False


class HistoryRead(SQLModel):
    id: int
    user_id: int
    flashcard_id: int
    is_correct: bool
    viewed_at: datetime


class HistoryDetailRead(HistoryRead):
    username: str
    user_email: str
    question: str
    answer: str
    deck_id: int
    deck_title: str


class LearningSummary(SQLModel):
    total_cards: int
    studied_cards: int
    unused_cards: int
    history_records: int
    correct_records: int
    accuracy: float

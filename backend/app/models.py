from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text

# Database models for the flashcard application, including User, Deck, Flashcard, and ViewHistory.
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, max_length=50)
    email: str = Field(index=True, max_length=120)
    hashed_password: str
    role: str = Field(default="user", max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Deck and Flashcard models with relationships to User and each other, along with a ViewHistory model to track user interactions with flashcards.
class Deck(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True, max_length=100)
    description: Optional[str] = Field(default=None, max_length=255)
    owner_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Flashcard model with text fields for question and answer, and foreign keys to Deck and User.
class Flashcard(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    question: str = Field(sa_column=Column(Text))
    answer: str = Field(sa_column=Column(Text))
    deck_id: int = Field(foreign_key="deck.id")
    owner_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Model to track when a user views a flashcard and whether they answered correctly, with foreign keys to User and Flashcard.
class ViewHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    flashcard_id: int = Field(foreign_key="flashcard.id")
    is_correct: bool = Field(default=False)
    viewed_at: datetime = Field(default_factory=datetime.utcnow)
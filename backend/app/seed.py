import os

from sqlmodel import Session, select

from app.auth import hash_password
from app.models import Deck, Flashcard, User


DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_EMAIL = "admin@example.com"
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")

STARTER_CARDS = [
    {
        "question": "What is React?",
        "answer": "React is a JavaScript library for building interactive user interfaces.",
    },
    {
        "question": "What is useState?",
        "answer": "useState is a React Hook used to manage local component state.",
    },
    {
        "question": "What is FastAPI?",
        "answer": "FastAPI is a Python framework for building APIs quickly.",
    },
    {
        "question": "What is SQL?",
        "answer": "SQL is a language used to manage and query relational databases.",
    },
    {
        "question": "What is JWT?",
        "answer": "JWT is a signed token used to authenticate users after login.",
    },
]


def ensure_default_admin(session: Session):
    admin = session.exec(
        select(User).where(User.username == DEFAULT_ADMIN_USERNAME)
    ).first()

    if admin:
        admin.email = admin.email or DEFAULT_ADMIN_EMAIL
        admin.role = "admin"
    else:
        admin = User(
            username=DEFAULT_ADMIN_USERNAME,
            email=DEFAULT_ADMIN_EMAIL,
            hashed_password=hash_password(DEFAULT_ADMIN_PASSWORD),
            role="admin",
        )

    session.add(admin)
    session.commit()


def create_starter_cards_for_user(session: Session, user: User):
    existing_deck = session.exec(
        select(Deck).where(
            Deck.owner_id == user.id,
            Deck.title == "Starter Deck"
        )
    ).first()

    if existing_deck:
        return

    starter_deck = Deck(
        title="Starter Deck",
        description="Built-in flashcards for new users.",
        owner_id=user.id,
    )

    session.add(starter_deck)
    session.commit()
    session.refresh(starter_deck)

    for card in STARTER_CARDS:
        flashcard = Flashcard(
            question=card["question"],
            answer=card["answer"],
            deck_id=starter_deck.id,
            owner_id=user.id,
        )
        session.add(flashcard)

    session.commit()

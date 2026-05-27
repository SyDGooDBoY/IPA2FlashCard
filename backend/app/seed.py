import os

from sqlmodel import Session, select

from app.auth import hash_password
from app.models import Deck, Flashcard, User


DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_EMAIL = "admin@example.com"
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")

DEFAULT_DECKS = [
    {
        "title": "Starter Deck",
        "description": "Built-in flashcards for new users.",
        "cards": [
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
        ],
    },
    {
        "title": "Math",
        "description": "Quick arithmetic and math concept practice.",
        "cards": [
            {
                "question": "What is 7 x 8?",
                "answer": "56.",
            },
            {
                "question": "What is the square root of 81?",
                "answer": "9.",
            },
            {
                "question": "What is 15% of 200?",
                "answer": "30.",
            },
            {
                "question": "What is the formula for the area of a triangle?",
                "answer": "Area = 1/2 x base x height.",
            },
            {
                "question": "What is a prime number?",
                "answer": "A number greater than 1 that has exactly two factors: 1 and itself.",
            },
        ],
    },
    {
        "title": "Food",
        "description": "Food vocabulary and nutrition basics.",
        "cards": [
            {
                "question": "Which food group is rice mainly part of?",
                "answer": "Grains or carbohydrates.",
            },
            {
                "question": "What vitamin is oranges famous for?",
                "answer": "Vitamin C.",
            },
            {
                "question": "What is tofu commonly made from?",
                "answer": "Soybeans.",
            },
            {
                "question": "What does vegetarian mean?",
                "answer": "A diet that does not include meat.",
            },
            {
                "question": "Which nutrient is commonly associated with eggs, fish, and beans?",
                "answer": "Protein.",
            },
        ],
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
    for deck_data in DEFAULT_DECKS:
        existing_deck = session.exec(
            select(Deck).where(
                Deck.owner_id == user.id,
                Deck.title == deck_data["title"]
            )
        ).first()

        if existing_deck:
            continue

        deck = Deck(
            title=deck_data["title"],
            description=deck_data["description"],
            owner_id=user.id,
        )

        session.add(deck)
        session.commit()
        session.refresh(deck)

        for card in deck_data["cards"]:
            flashcard = Flashcard(
                question=card["question"],
                answer=card["answer"],
                deck_id=deck.id,
                owner_id=user.id,
            )
            session.add(flashcard)

    session.commit()

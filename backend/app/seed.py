from sqlmodel import Session, select

from app.models import Deck, Flashcard, User


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
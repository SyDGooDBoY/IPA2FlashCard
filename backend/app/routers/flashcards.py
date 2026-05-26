from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Deck, Flashcard, User, ViewHistory
from app.schemas import FlashcardCreate, FlashcardUpdate, FlashcardRead
from app.auth import get_current_user

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])

# Access check functions
def check_card_access(card: Flashcard, user: User):
    if user.role != "admin" and card.owner_id != user.id:
        raise HTTPException(status_code=403, detail="No permission")

# Deck access check function (used for both deck and flashcard operations)
def check_deck_access(deck: Deck, user: User):
    if user.role != "admin" and deck.owner_id != user.id:
        raise HTTPException(status_code=403, detail="No permission")

# Flashcard management routes
@router.get("/", response_model=list[FlashcardRead])
def get_flashcards(
    deck_id: Optional[int] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(Flashcard)

    if current_user.role != "admin":
        statement = statement.where(Flashcard.owner_id == current_user.id)

    if deck_id:
        statement = statement.where(Flashcard.deck_id == deck_id)

    cards = session.exec(statement).all()

    if search:
        keyword = search.lower()
        cards = [
            card for card in cards
            if keyword in card.question.lower() or keyword in card.answer.lower()
        ]

    return cards

# Flashcard creation route with deck access check
@router.post("/", response_model=FlashcardRead)
def create_flashcard(
    card_data: FlashcardCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    question = card_data.question.strip()
    answer = card_data.answer.strip()

    if not question or not answer:
        raise HTTPException(status_code=400, detail="Question and answer are required")

    deck = session.get(Deck, card_data.deck_id)

    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    check_deck_access(deck, current_user)

    card = Flashcard(
        question=question,
        answer=answer,
        deck_id=card_data.deck_id,
        owner_id=deck.owner_id
    )

    session.add(card)
    session.commit()
    session.refresh(card)

    return card

# Flashcard update route with access check
@router.put("/{card_id}", response_model=FlashcardRead)
def update_flashcard(
    card_id: int,
    card_data: FlashcardUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    card = session.get(Flashcard, card_id)

    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    check_card_access(card, current_user)

    update_data = card_data.model_dump(exclude_unset=True)

    if "question" in update_data:
        update_data["question"] = update_data["question"].strip()
        if not update_data["question"]:
            raise HTTPException(status_code=400, detail="Question is required")

    if "answer" in update_data:
        update_data["answer"] = update_data["answer"].strip()
        if not update_data["answer"]:
            raise HTTPException(status_code=400, detail="Answer is required")

    if "deck_id" in update_data:
        deck = session.get(Deck, update_data["deck_id"])
        if not deck:
            raise HTTPException(status_code=404, detail="Deck not found")
        check_deck_access(deck, current_user)
        update_data["owner_id"] = deck.owner_id

    for key, value in update_data.items():
        setattr(card, key, value)

    session.add(card)
    session.commit()
    session.refresh(card)

    return card

# Flashcard deletion route with access check
@router.delete("/{card_id}")
def delete_flashcard(
    card_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    card = session.get(Flashcard, card_id)

    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    check_card_access(card, current_user)

    histories = session.exec(
        select(ViewHistory).where(ViewHistory.flashcard_id == card_id)
    ).all()

    for history in histories:
        session.delete(history)

    session.delete(card)
    session.commit()

    return {"message": "Flashcard deleted"}

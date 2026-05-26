from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Deck, Flashcard, User, ViewHistory
from app.schemas import DeckCreate, DeckUpdate, DeckRead
from app.auth import get_current_user

router = APIRouter(prefix="/decks", tags=["Decks"])

# Permission check functions
def check_deck_access(deck: Deck, user: User):
    if user.role != "admin" and deck.owner_id != user.id:
        raise HTTPException(status_code=403, detail="No permission")

# Deck management routes
@router.get("/", response_model=list[DeckRead])
def get_decks(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        return session.exec(select(Deck)).all()

    return session.exec(
        select(Deck).where(Deck.owner_id == current_user.id)
    ).all()

# Deck creation, update, and deletion routes
@router.post("/", response_model=DeckRead)
def create_deck(
    deck_data: DeckCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    title = deck_data.title.strip()
    description = deck_data.description.strip() if deck_data.description else None

    if not title:
        raise HTTPException(status_code=400, detail="Deck title is required")

    deck = Deck(
        title=title,
        description=description,
        owner_id=current_user.id
    )

    session.add(deck)
    session.commit()
    session.refresh(deck)

    return deck

# Deck update and delete routes with access checks
@router.put("/{deck_id}", response_model=DeckRead)
def update_deck(
    deck_id: int,
    deck_data: DeckUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    deck = session.get(Deck, deck_id)

    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    check_deck_access(deck, current_user)

    update_data = deck_data.model_dump(exclude_unset=True)

    if "title" in update_data:
        update_data["title"] = update_data["title"].strip()
        if not update_data["title"]:
            raise HTTPException(status_code=400, detail="Deck title is required")

    if "description" in update_data and update_data["description"] is not None:
        update_data["description"] = update_data["description"].strip()

    for key, value in update_data.items():
        setattr(deck, key, value)

    session.add(deck)
    session.commit()
    session.refresh(deck)

    return deck

# Deck deletion route with access check
@router.delete("/{deck_id}")
def delete_deck(
    deck_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    deck = session.get(Deck, deck_id)

    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    check_deck_access(deck, current_user)

    cards = session.exec(select(Flashcard).where(Flashcard.deck_id == deck_id)).all()
    card_ids = [card.id for card in cards if card.id is not None]

    if card_ids:
        histories = session.exec(
            select(ViewHistory).where(ViewHistory.flashcard_id.in_(card_ids))
        ).all()

        for history in histories:
            session.delete(history)

    for card in cards:
        session.delete(card)

    session.delete(deck)
    session.commit()

    return {"message": "Deck deleted"}

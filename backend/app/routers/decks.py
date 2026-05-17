from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Deck, User
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
    deck = Deck(
        title=deck_data.title,
        description=deck_data.description,
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

    update_data = deck_data.dict(exclude_unset=True)

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

    session.delete(deck)
    session.commit()

    return {"message": "Deck deleted"}
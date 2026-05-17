from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import ViewHistory, Flashcard, User
from app.schemas import HistoryCreate, HistoryRead
from app.auth import get_current_user, require_admin
# This router manages the learning history of users, allowing them to track their interactions with flashcards.
router = APIRouter(prefix="/history", tags=["Learning History"])

# Route to create a new history record when a user views a flashcard
@router.post("/", response_model=HistoryRead)
def create_history(
    history_data: HistoryCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    card = session.get(Flashcard, history_data.flashcard_id)

    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    if current_user.role != "admin" and card.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="No permission")

    history = ViewHistory(
        user_id=current_user.id,
        flashcard_id=history_data.flashcard_id,
        is_correct=history_data.is_correct
    )

    session.add(history)
    session.commit()
    session.refresh(history)

    return history

# Route to get current user's history records
@router.get("/me", response_model=list[HistoryRead])
def get_my_history(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return session.exec(
        select(ViewHistory).where(ViewHistory.user_id == current_user.id)
    ).all()

# Admin route to view all history records
@router.get("/all", response_model=list[HistoryRead])
def get_all_history(
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin)
):
    return session.exec(select(ViewHistory)).all()

# Admin route to delete a history record
@router.delete("/{history_id}")
def delete_history(
    history_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    history = session.get(ViewHistory, history_id)

    if not history:
        raise HTTPException(status_code=404, detail="History not found")

    if current_user.role != "admin" and history.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No permission")

    session.delete(history)
    session.commit()

    return {"message": "History deleted"}
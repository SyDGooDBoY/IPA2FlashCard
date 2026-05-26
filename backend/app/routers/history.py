from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.auth import get_current_user, require_admin
from app.database import get_session
from app.models import Deck, Flashcard, User, ViewHistory
from app.schemas import HistoryCreate, HistoryDetailRead, HistoryRead, LearningSummary

router = APIRouter(prefix="/history", tags=["Learning History"])


def build_history_detail(row) -> HistoryDetailRead:
    history, user, card, deck = row

    return HistoryDetailRead(
        id=history.id,
        user_id=history.user_id,
        flashcard_id=history.flashcard_id,
        is_correct=history.is_correct,
        viewed_at=history.viewed_at,
        username=user.username,
        user_email=user.email,
        question=card.question,
        answer=card.answer,
        deck_id=deck.id,
        deck_title=deck.title,
    )


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


@router.get("/me", response_model=list[HistoryRead])
def get_my_history(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return session.exec(
        select(ViewHistory)
        .where(ViewHistory.user_id == current_user.id)
        .order_by(ViewHistory.viewed_at.desc())
    ).all()


@router.get("/me/details", response_model=list[HistoryDetailRead])
def get_my_history_details(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    rows = session.exec(
        select(ViewHistory, User, Flashcard, Deck)
        .join(User, ViewHistory.user_id == User.id)
        .join(Flashcard, ViewHistory.flashcard_id == Flashcard.id)
        .join(Deck, Flashcard.deck_id == Deck.id)
        .where(ViewHistory.user_id == current_user.id)
        .order_by(ViewHistory.viewed_at.desc())
    ).all()

    return [build_history_detail(row) for row in rows]


@router.get("/summary", response_model=LearningSummary)
def get_learning_summary(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    cards_statement = select(Flashcard)

    if current_user.role != "admin":
        cards_statement = cards_statement.where(Flashcard.owner_id == current_user.id)

    cards = session.exec(cards_statement).all()
    card_ids = {card.id for card in cards}

    histories_statement = select(ViewHistory)

    if current_user.role != "admin":
        histories_statement = histories_statement.where(ViewHistory.user_id == current_user.id)

    histories = session.exec(histories_statement).all()
    studied_ids = {
        history.flashcard_id
        for history in histories
        if history.flashcard_id in card_ids
    }
    correct_records = sum(1 for history in histories if history.is_correct)

    return LearningSummary(
        total_cards=len(cards),
        studied_cards=len(studied_ids),
        unused_cards=max(len(cards) - len(studied_ids), 0),
        history_records=len(histories),
        correct_records=correct_records,
        accuracy=round((correct_records / len(histories)) * 100, 1) if histories else 0,
    )


@router.get("/all", response_model=list[HistoryRead])
def get_all_history(
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin)
):
    return session.exec(
        select(ViewHistory).order_by(ViewHistory.viewed_at.desc())
    ).all()


@router.get("/all/details", response_model=list[HistoryDetailRead])
def get_all_history_details(
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin)
):
    rows = session.exec(
        select(ViewHistory, User, Flashcard, Deck)
        .join(User, ViewHistory.user_id == User.id)
        .join(Flashcard, ViewHistory.flashcard_id == Flashcard.id)
        .join(Deck, Flashcard.deck_id == Deck.id)
        .order_by(ViewHistory.viewed_at.desc())
    ).all()

    return [build_history_detail(row) for row in rows]


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

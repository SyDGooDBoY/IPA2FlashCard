from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.database import get_session
from app.models import User
from app.schemas import PasswordChange, Token, UserCreate, UserRead, UserUpdate
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_admin,
)
from app.seed import create_starter_cards_for_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserRead)
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    username = user_data.username.strip()
    email = user_data.email.strip()

    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")

    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    if "@" not in email:
        raise HTTPException(status_code=400, detail="Email is invalid")

    existing_user = session.exec(
        select(User).where(User.username == username)
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    existing_email = session.exec(
        select(User).where(User.email == email)
    ).first()

    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        username=username,
        email=email,
        hashed_password=hash_password(user_data.password),
        role="user",
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    create_starter_cards_for_user(session, new_user)

    return new_user


def authenticate_with_role(
    form_data: OAuth2PasswordRequestForm,
    session: Session,
    required_role: str,
):
    user = session.exec(
        select(User).where(User.username == form_data.username)
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    if user.role != required_role:
        raise HTTPException(status_code=403, detail=f"{required_role.title()} login required")

    token = create_access_token(user.username)

    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    return authenticate_with_role(form_data, session, "user")


@router.post("/admin/login", response_model=Token)
def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    return authenticate_with_role(form_data, session, "admin")


@router.get("/me", response_model=UserRead)
def get_me(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    create_starter_cards_for_user(session, current_user)
    return current_user


@router.put("/me", response_model=UserRead)
def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if user_data.email is not None:
        email = user_data.email.strip()
        if not email:
            raise HTTPException(status_code=400, detail="Email cannot be empty")

        if "@" not in email:
            raise HTTPException(status_code=400, detail="Email is invalid")

        existing_email = session.exec(
            select(User).where(User.email == email, User.id != current_user.id)
        ).first()

        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")

        current_user.email = email

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return current_user


@router.put("/me/password")
def update_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(password_data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    current_user.hashed_password = hash_password(password_data.new_password)
    session.add(current_user)
    session.commit()

    return {"message": "Password updated"}


@router.get("/users", response_model=list[UserRead])
def get_all_users(
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    return session.exec(select(User)).all()

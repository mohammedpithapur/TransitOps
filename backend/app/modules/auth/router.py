from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.modules.auth.schemas import LoginRequest, TokenResponse
from app.modules.auth.service import authenticate_user
from app.db.session import get_db

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return authenticate_user(db, payload.email, payload.password)

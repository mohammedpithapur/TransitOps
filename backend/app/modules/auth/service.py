from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.users.models import User
from app.core.security import verify_password, create_access_token

def authenticate_user(db: Session, email: str, password: str) -> dict:
    user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")
    
    token = create_access_token(user.id, user.role, user.name, user.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    }

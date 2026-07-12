from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(user_id: int, role: str, name: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {
        "sub": str(user_id),
        "role": role,
        "name": name,
        "email": email,
        "exp": expire
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])

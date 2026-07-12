import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings

def hash_password(plain: str) -> str:
    pwd_bytes = plain.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    pwd_bytes = plain.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


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

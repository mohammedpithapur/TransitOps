from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    SECRET_KEY: str = "transitops-secret-key-change-in-production-2026"
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

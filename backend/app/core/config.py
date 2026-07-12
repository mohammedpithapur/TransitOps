from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union, Any

class Settings(BaseSettings):
    SECRET_KEY: str = "transitops-secret-key-change-in-production-2026"
    DEBUG: bool = True
    ALLOWED_ORIGINS: Union[str, List[str]] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            return [x.strip() for x in v.split(",") if x.strip()]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()


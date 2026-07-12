from pydantic import BaseModel, ConfigDict
from app.modules.users.models import Role

class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    role: Role
    is_active: bool

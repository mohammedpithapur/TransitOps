from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional

class ExpenseCreate(BaseModel):
    vehicle_id: Optional[int] = None
    trip_id: Optional[int] = None
    driver_id: Optional[int] = None
    category: str
    amount: float
    date: date
    description: Optional[str] = None

class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vehicle_id: Optional[int]
    trip_id: Optional[int]
    driver_id: Optional[int]
    category: str
    amount: float
    date: date
    description: Optional[str]
    created_at: datetime

from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional
from app.modules.drivers.models import DriverStatus

class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    safety_score: int = 100

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry_date: Optional[date] = None
    contact_number: Optional[str] = None
    safety_score: Optional[int] = None
    status: Optional[DriverStatus] = None

class DriverRead(DriverBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: DriverStatus
    total_trips_completed: int
    total_distance_driven_km: float
    created_at: datetime

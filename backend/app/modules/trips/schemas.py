from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.modules.trips.models import TripStatus

class TripBase(BaseModel):
    vehicle_id: int
    driver_id: int
    source: str
    destination: str
    cargo_weight_kg: float
    estimated_distance_km: float
    revenue: float = 0

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    source: Optional[str] = None
    destination: Optional[str] = None
    cargo_weight_kg: Optional[float] = None
    estimated_distance_km: Optional[float] = None
    revenue: Optional[float] = None

class TripComplete(BaseModel):
    actual_distance_km: float
    fuel_consumed_l: float

class TripCancel(BaseModel):
    reason: str

class TripRead(TripBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    trip_number: str
    status: TripStatus
    actual_distance_km: Optional[float]
    fuel_consumed_l: Optional[float]
    cancellation_reason: Optional[str]
    dispatched_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

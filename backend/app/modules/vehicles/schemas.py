from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional
from app.modules.vehicles.models import VehicleStatus

class VehicleBase(BaseModel):
    registration_number: str
    name: str
    type: str
    fuel_type: str = "Diesel"
    max_load_capacity_kg: float
    acquisition_cost: float
    current_odometer_km: float = 0
    region: Optional[str] = None
    insurance_expiry: Optional[date] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    fuel_type: Optional[str] = None
    max_load_capacity_kg: Optional[float] = None
    acquisition_cost: Optional[float] = None
    current_odometer_km: Optional[float] = None
    region: Optional[str] = None
    insurance_expiry: Optional[date] = None
    status: Optional[VehicleStatus] = None

class VehicleRead(VehicleBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: VehicleStatus
    created_at: datetime
    updated_at: datetime

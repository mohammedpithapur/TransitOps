from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional
from app.modules.maintenance.models import MaintenanceStatus

class MaintenanceCreate(BaseModel):
    vehicle_id: int
    type: str
    description: str = ""
    parts_cost: float = 0
    labour_cost: float = 0
    odometer_at_service: float = 0
    scheduled_date: date
    vendor_name: Optional[str] = None

class MaintenanceUpdate(BaseModel):
    type: Optional[str] = None
    description: Optional[str] = None
    parts_cost: Optional[float] = None
    labour_cost: Optional[float] = None
    vendor_name: Optional[str] = None

class MaintenanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vehicle_id: int
    type: str
    description: str
    status: MaintenanceStatus
    parts_cost: float
    labour_cost: float
    total_cost: float
    odometer_at_service: float
    scheduled_date: date
    completed_date: Optional[date]
    vendor_name: Optional[str]
    created_at: datetime

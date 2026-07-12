from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional

class FuelLogCreate(BaseModel):
    vehicle_id: int
    driver_id: Optional[int] = None
    trip_id: Optional[int] = None
    date: date
    quantity_l: float
    price_per_litre: float
    odometer_at_fuel: float = 0
    station_name: Optional[str] = None

class FuelLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vehicle_id: int
    driver_id: Optional[int]
    trip_id: Optional[int]
    date: date
    quantity_l: float
    price_per_litre: float
    total_cost: float
    odometer_at_fuel: float
    km_since_last_fuel: Optional[float]
    fuel_efficiency_kml: Optional[float]
    station_name: Optional[str]
    created_at: datetime

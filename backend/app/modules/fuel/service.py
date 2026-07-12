from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.modules.fuel.models import FuelLog
from app.modules.fuel.schemas import FuelLogCreate
from app.modules.vehicles.models import Vehicle

def create_fuel_log(db: Session, payload: FuelLogCreate) -> FuelLog:
    vehicle = db.get(Vehicle, payload.vehicle_id)
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
        
    total_cost = payload.quantity_l * payload.price_per_litre
    
    # Calculate efficiency if we have odometer data
    km_since = None
    efficiency = None
    if payload.odometer_at_fuel and vehicle.current_odometer_km:
        km_since = payload.odometer_at_fuel - vehicle.current_odometer_km
        if km_since > 0 and payload.quantity_l > 0:
            efficiency = km_since / payload.quantity_l
            
    log = FuelLog(
        **payload.model_dump(),
        total_cost=total_cost,
        km_since_last_fuel=km_since,
        fuel_efficiency_kml=efficiency
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.modules.vehicles.models import Vehicle, VehicleStatus
from app.modules.vehicles.schemas import VehicleCreate, VehicleUpdate, VehicleRead

router = APIRouter()

@router.get("/", response_model=list[VehicleRead])
def list_vehicles(
    status: Optional[str] = None,
    type: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    q = db.query(Vehicle).filter(Vehicle.is_deleted == False)
    if status: q = q.filter(Vehicle.status == status)
    if type: q = q.filter(Vehicle.type == type)
    if region: q = q.filter(Vehicle.region == region)
    return q.order_by(Vehicle.id).all()

@router.post("/", response_model=VehicleRead, status_code=201)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager"))
):
    existing = db.query(Vehicle).filter(Vehicle.registration_number == payload.registration_number).first()
    if existing:
        raise HTTPException(400, f"Registration number '{payload.registration_number}' is already registered.")
    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.get("/{vehicle_id}", response_model=VehicleRead)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle or vehicle.is_deleted:
        raise HTTPException(404, "Vehicle not found")
    return vehicle

@router.patch("/{vehicle_id}", response_model=VehicleRead)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager"))
):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle or vehicle.is_deleted:
        raise HTTPException(404, "Vehicle not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager"))
):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle or vehicle.is_deleted:
        raise HTTPException(404, "Vehicle not found")
    vehicle.is_deleted = True
    db.commit()
    return {"message": "Vehicle deleted successfully"}

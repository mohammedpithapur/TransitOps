from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.modules.trips.models import Trip, TripStatus
from app.modules.trips.schemas import TripCreate, TripUpdate, TripRead, TripComplete, TripCancel
from app.modules.trips import service

router = APIRouter()

@router.get("/", response_model=list[TripRead])
def list_trips(
    status: Optional[str] = None,
    vehicle_id: Optional[int] = None,
    driver_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    q = db.query(Trip).filter(Trip.is_deleted == False)
    if status: q = q.filter(Trip.status == status)
    if vehicle_id: q = q.filter(Trip.vehicle_id == vehicle_id)
    if driver_id: q = q.filter(Trip.driver_id == driver_id)
    return q.order_by(Trip.id.desc()).all()

@router.post("/", response_model=TripRead, status_code=201)
def create_trip(
    payload: TripCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager", "dispatcher"))
):
    return service.create_trip(db, payload)

@router.get("/{trip_id}", response_model=TripRead)
def get_trip(trip_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    trip = db.get(Trip, trip_id)
    if not trip or trip.is_deleted:
        raise HTTPException(404, "Trip not found")
    return trip

@router.patch("/{trip_id}", response_model=TripRead)
def update_trip(
    trip_id: int,
    payload: TripUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager", "dispatcher"))
):
    trip = db.get(Trip, trip_id)
    if not trip or trip.is_deleted:
        raise HTTPException(404, "Trip not found")
    if trip.status != TripStatus.DRAFT:
        raise HTTPException(400, "Only Draft trips can be edited.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    return trip

@router.post("/{trip_id}/dispatch", response_model=TripRead)
def dispatch_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager", "dispatcher"))
):
    return service.dispatch_trip(db, trip_id)

@router.post("/{trip_id}/complete", response_model=TripRead)
def complete_trip(
    trip_id: int,
    payload: TripComplete,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager", "dispatcher"))
):
    return service.complete_trip(db, trip_id, payload)

@router.post("/{trip_id}/cancel", response_model=TripRead)
def cancel_trip(
    trip_id: int,
    payload: TripCancel,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager", "dispatcher"))
):
    return service.cancel_trip(db, trip_id, payload)

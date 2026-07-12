from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from datetime import date, datetime
from app.modules.trips.models import Trip, TripStatus
from app.modules.trips.schemas import TripCreate, TripComplete, TripCancel
from app.modules.vehicles.models import Vehicle, VehicleStatus
from app.modules.drivers.models import Driver, DriverStatus

def generate_trip_number(db: Session) -> str:
    year = datetime.now().year
    count = db.query(func.count(Trip.id)).scalar() + 1
    return f"TRP-{year}-{count:04d}"

def create_trip(db: Session, payload: TripCreate) -> Trip:
    # Validate vehicle exists and is not retired/in-shop
    vehicle = db.get(Vehicle, payload.vehicle_id)
    if not vehicle or vehicle.is_deleted:
        raise HTTPException(404, "Vehicle not found")
    driver = db.get(Driver, payload.driver_id)
    if not driver or driver.is_deleted:
        raise HTTPException(404, "Driver not found")
    # Cargo weight validation
    if payload.cargo_weight_kg > vehicle.max_load_capacity_kg:
        raise HTTPException(400, f"Cargo ({payload.cargo_weight_kg}kg) exceeds vehicle capacity ({vehicle.max_load_capacity_kg}kg). Max allowed: {vehicle.max_load_capacity_kg}kg.")
    
    trip = Trip(**payload.model_dump(), trip_number=generate_trip_number(db))
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

def dispatch_trip(db: Session, trip_id: int) -> Trip:
    try:
        trip = db.get(Trip, trip_id)
        if not trip:
            raise HTTPException(404, "Trip not found")
        if trip.status != TripStatus.DRAFT:
            raise HTTPException(400, f"Only Draft trips can be dispatched. Current status: {trip.status}")
        
        vehicle = db.get(Vehicle, trip.vehicle_id)
        driver = db.get(Driver, trip.driver_id)
        
        # === MANDATORY BUSINESS RULES ===
        if vehicle.status == VehicleStatus.RETIRED:
            raise HTTPException(400, f"Vehicle {vehicle.registration_number} is Retired and cannot be dispatched.")
        if vehicle.status != VehicleStatus.AVAILABLE:
            raise HTTPException(400, f"Vehicle {vehicle.registration_number} is currently {vehicle.status} and cannot be dispatched.")
        if driver.status == DriverStatus.SUSPENDED:
            raise HTTPException(400, f"Driver {driver.name} is Suspended. Contact Fleet Manager to reinstate.")
        if driver.license_expiry_date < date.today():
            raise HTTPException(400, f"Driver {driver.name}'s license expired on {driver.license_expiry_date}. Cannot assign to trip.")
        if driver.status != DriverStatus.AVAILABLE:
            raise HTTPException(400, f"Driver {driver.name} is currently {driver.status} and cannot be assigned.")
        if trip.cargo_weight_kg > vehicle.max_load_capacity_kg:
            raise HTTPException(400, f"Cargo ({trip.cargo_weight_kg}kg) exceeds vehicle capacity ({vehicle.max_load_capacity_kg}kg).")
            
        # === ATOMIC STATUS TRANSITIONS ===
        trip.status = TripStatus.DISPATCHED
        trip.dispatched_at = datetime.utcnow()
        vehicle.status = VehicleStatus.ON_TRIP
        driver.status = DriverStatus.ON_TRIP
        
        db.commit()
        db.refresh(trip)
        return trip
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))

def complete_trip(db: Session, trip_id: int, payload: TripComplete) -> Trip:
    try:
        trip = db.get(Trip, trip_id)
        if not trip:
            raise HTTPException(404, "Trip not found")
        if trip.status != TripStatus.DISPATCHED:
            raise HTTPException(400, "Only Dispatched trips can be completed.")
        
        vehicle = db.get(Vehicle, trip.vehicle_id)
        driver = db.get(Driver, trip.driver_id)
        
        trip.status = TripStatus.COMPLETED
        trip.completed_at = datetime.utcnow()
        trip.actual_distance_km = payload.actual_distance_km
        trip.fuel_consumed_l = payload.fuel_consumed_l
        
        vehicle.status = VehicleStatus.AVAILABLE
        vehicle.current_odometer_km += payload.actual_distance_km
        
        driver.status = DriverStatus.AVAILABLE
        driver.total_trips_completed += 1
        driver.total_distance_driven_km += payload.actual_distance_km
        
        db.commit()
        db.refresh(trip)
        return trip
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))

def cancel_trip(db: Session, trip_id: int, payload: TripCancel) -> Trip:
    try:
        trip = db.get(Trip, trip_id)
        if not trip:
            raise HTTPException(404, "Trip not found")
        if trip.status not in [TripStatus.DRAFT, TripStatus.DISPATCHED]:
            raise HTTPException(400, f"Cannot cancel a {trip.status} trip.")
            
        was_dispatched = (trip.status == TripStatus.DISPATCHED)
        trip.status = TripStatus.CANCELLED
        trip.cancellation_reason = payload.reason
        
        if was_dispatched:
            vehicle = db.get(Vehicle, trip.vehicle_id)
            driver = db.get(Driver, trip.driver_id)
            if vehicle:
                vehicle.status = VehicleStatus.AVAILABLE
            if driver:
                driver.status = DriverStatus.AVAILABLE
                
        db.commit()
        db.refresh(trip)
        return trip
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))

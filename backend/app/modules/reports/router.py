from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.modules.vehicles.models import Vehicle, VehicleStatus
from app.modules.drivers.models import Driver, DriverStatus
from app.modules.trips.models import Trip, TripStatus
from app.modules.maintenance.models import MaintenanceLog
from app.modules.fuel.models import FuelLog
from app.modules.expenses.models import Expense
from datetime import date

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(
    region: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    q = db.query(Vehicle).filter(Vehicle.is_deleted == False)
    if region: q = q.filter(Vehicle.region == region)
    if vehicle_type: q = q.filter(Vehicle.type == vehicle_type)
    vehicles = q.all()
    
    non_retired = [v for v in vehicles if v.status != VehicleStatus.RETIRED]
    on_trip = [v for v in vehicles if v.status == VehicleStatus.ON_TRIP]
    
    drivers = db.query(Driver).filter(Driver.is_deleted == False).all()
    expiring_soon = [
        d for d in drivers 
        if d.license_expiry_date and 0 <= (d.license_expiry_date - date.today()).days <= 30
    ]
    
    return {
        "active_vehicles": len(on_trip),
        "available_vehicles": len([v for v in vehicles if v.status == VehicleStatus.AVAILABLE]),
        "vehicles_in_maintenance": len([v for v in vehicles if v.status == VehicleStatus.IN_SHOP]),
        "retired_vehicles": len([v for v in vehicles if v.status == VehicleStatus.RETIRED]),
        "total_vehicles": len(vehicles),
        "active_trips": db.query(Trip).filter(Trip.status == TripStatus.DISPATCHED, Trip.is_deleted == False).count(),
        "pending_trips": db.query(Trip).filter(Trip.status == TripStatus.DRAFT, Trip.is_deleted == False).count(),
        "drivers_on_duty": len([d for d in drivers if d.status == DriverStatus.ON_TRIP]),
        "available_drivers": len([d for d in drivers if d.status == DriverStatus.AVAILABLE]),
        "fleet_utilization_pct": round(len(on_trip) / len(non_retired) * 100, 1) if non_retired else 0,
        "expiring_licenses_count": len(expiring_soon),
        "expiring_licenses": [
            {
                "id": d.id, 
                "name": d.name, 
                "expiry": str(d.license_expiry_date), 
                "days_left": (d.license_expiry_date - date.today()).days
            } 
            for d in expiring_soon
        ],
    }

@router.get("/vehicle-roi")
def get_vehicle_roi(db: Session = Depends(get_db), _=Depends(get_current_user)):
    vehicles = db.query(Vehicle).filter(Vehicle.is_deleted == False).all()
    results = []
    for v in vehicles:
        revenue = db.query(func.sum(Trip.revenue)).filter(
            Trip.vehicle_id == v.id, 
            Trip.status == TripStatus.COMPLETED
        ).scalar() or 0
        
        fuel_cost = db.query(func.sum(FuelLog.total_cost)).filter(
            FuelLog.vehicle_id == v.id, 
            FuelLog.is_deleted == False
        ).scalar() or 0
        
        maint_cost = db.query(func.sum(MaintenanceLog.total_cost)).filter(
            MaintenanceLog.vehicle_id == v.id, 
            MaintenanceLog.is_deleted == False
        ).scalar() or 0
        
        # ROI formula (from spec): (Revenue - (Maintenance + Fuel)) / Acquisition Cost
        roi = (revenue - (maint_cost + fuel_cost)) / v.acquisition_cost if v.acquisition_cost else 0
        
        results.append({
            "vehicle_id": v.id,
            "registration_number": v.registration_number,
            "name": v.name,
            "status": v.status,
            "revenue": revenue,
            "fuel_cost": fuel_cost,
            "maintenance_cost": maint_cost,
            "acquisition_cost": v.acquisition_cost,
            "roi": round(roi, 4),
            "roi_pct": round(roi * 100, 2),
        })
    return results

@router.get("/fuel-efficiency")
def get_fuel_efficiency(db: Session = Depends(get_db), _=Depends(get_current_user)):
    vehicles = db.query(Vehicle).filter(Vehicle.is_deleted == False).all()
    results = []
    for v in vehicles:
        trips = db.query(Trip).filter(
            Trip.vehicle_id == v.id, 
            Trip.status == TripStatus.COMPLETED,
            Trip.actual_distance_km != None,
            Trip.fuel_consumed_l != None
        ).all()
        total_km = sum(t.actual_distance_km for t in trips)
        total_fuel = sum(t.fuel_consumed_l for t in trips if t.fuel_consumed_l)
        results.append({
            "vehicle_id": v.id,
            "registration_number": v.registration_number,
            "name": v.name,
            "total_km": total_km,
            "total_fuel_l": total_fuel,
            "efficiency_kml": round(total_km / total_fuel, 2) if total_fuel else None,
        })
    return results

@router.get("/operational-cost")
def get_operational_cost(db: Session = Depends(get_db), _=Depends(get_current_user)):
    vehicles = db.query(Vehicle).filter(Vehicle.is_deleted == False).all()
    results = []
    for v in vehicles:
        fuel = db.query(func.sum(FuelLog.total_cost)).filter(
            FuelLog.vehicle_id == v.id, 
            FuelLog.is_deleted == False
        ).scalar() or 0
        
        maint = db.query(func.sum(MaintenanceLog.total_cost)).filter(
            MaintenanceLog.vehicle_id == v.id, 
            MaintenanceLog.is_deleted == False
        ).scalar() or 0
        
        expenses = db.query(func.sum(Expense.amount)).filter(
            Expense.vehicle_id == v.id, 
            Expense.is_deleted == False
        ).scalar() or 0
        
        results.append({
            "vehicle_id": v.id,
            "registration_number": v.registration_number,
            "name": v.name,
            "fuel_cost": fuel,
            "maintenance_cost": maint,
            "other_expenses": expenses,
            "total_ops_cost": fuel + maint + expenses,
        })
    return results

@router.get("/fleet-utilization")
def get_fleet_utilization(db: Session = Depends(get_db), _=Depends(get_current_user)):
    vehicles = db.query(Vehicle).filter(Vehicle.is_deleted == False).all()
    non_retired = [v for v in vehicles if v.status != VehicleStatus.RETIRED]
    on_trip = [v for v in non_retired if v.status == VehicleStatus.ON_TRIP]
    available = [v for v in non_retired if v.status == VehicleStatus.AVAILABLE]
    in_shop = [v for v in non_retired if v.status == VehicleStatus.IN_SHOP]
    
    return {
        "total_non_retired": len(non_retired),
        "on_trip": len(on_trip),
        "available": len(available),
        "in_shop": len(in_shop),
        "utilization_pct": round(len(on_trip) / len(non_retired) * 100, 1) if non_retired else 0,
        "by_vehicle": [
            {"id": v.id, "registration_number": v.registration_number, "name": v.name, "status": v.status, "type": v.type}
            for v in non_retired
        ],
    }

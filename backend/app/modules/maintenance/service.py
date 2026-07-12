from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import date
from app.modules.maintenance.models import MaintenanceLog, MaintenanceStatus
from app.modules.maintenance.schemas import MaintenanceCreate
from app.modules.vehicles.models import Vehicle, VehicleStatus

def create_maintenance(db: Session, payload: MaintenanceCreate) -> MaintenanceLog:
    try:
        vehicle = db.get(Vehicle, payload.vehicle_id)
        if not vehicle or vehicle.is_deleted:
            raise HTTPException(404, "Vehicle not found")
        if vehicle.status == VehicleStatus.RETIRED:
            raise HTTPException(400, "Cannot log maintenance for a Retired vehicle.")
            
        total_cost = payload.parts_cost + payload.labour_cost
        log = MaintenanceLog(**payload.model_dump(), total_cost=total_cost, status=MaintenanceStatus.OPEN)
        db.add(log)
        vehicle.status = VehicleStatus.IN_SHOP  # auto-transition
        db.commit()
        db.refresh(log)
        return log
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))

def close_maintenance(db: Session, log_id: int) -> MaintenanceLog:
    try:
        log = db.get(MaintenanceLog, log_id)
        if not log:
            raise HTTPException(404, "Maintenance log not found")
        if log.status == MaintenanceStatus.CLOSED:
            raise HTTPException(400, "Maintenance log is already closed.")
            
        vehicle = db.get(Vehicle, log.vehicle_id)
        log.status = MaintenanceStatus.CLOSED
        log.completed_date = date.today()
        log.total_cost = log.parts_cost + log.labour_cost
        
        if vehicle and vehicle.status != VehicleStatus.RETIRED:
            vehicle.status = VehicleStatus.AVAILABLE  # auto-restore
            
        db.commit()
        db.refresh(log)
        return log
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e))

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.modules.maintenance.models import MaintenanceLog
from app.modules.maintenance.schemas import MaintenanceCreate, MaintenanceUpdate, MaintenanceRead
from app.modules.maintenance import service

router = APIRouter()

@router.get("/", response_model=list[MaintenanceRead])
def list_maintenance(
    vehicle_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    q = db.query(MaintenanceLog).filter(MaintenanceLog.is_deleted == False)
    if vehicle_id: q = q.filter(MaintenanceLog.vehicle_id == vehicle_id)
    if status: q = q.filter(MaintenanceLog.status == status)
    return q.order_by(MaintenanceLog.id.desc()).all()

@router.post("/", response_model=MaintenanceRead, status_code=201)
def create_maintenance(
    payload: MaintenanceCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager", "safety_officer"))
):
    return service.create_maintenance(db, payload)

@router.get("/{log_id}", response_model=MaintenanceRead)
def get_maintenance(log_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    log = db.get(MaintenanceLog, log_id)
    if not log or log.is_deleted:
        raise HTTPException(404, "Maintenance log not found")
    return log

@router.patch("/{log_id}", response_model=MaintenanceRead)
def update_maintenance(
    log_id: int,
    payload: MaintenanceUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager", "safety_officer"))
):
    log = db.get(MaintenanceLog, log_id)
    if not log or log.is_deleted:
        raise HTTPException(404, "Maintenance log not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(log, field, value)
    log.total_cost = log.parts_cost + log.labour_cost
    db.commit()
    db.refresh(log)
    return log

@router.post("/{log_id}/close", response_model=MaintenanceRead)
def close_maintenance(
    log_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager", "safety_officer"))
):
    return service.close_maintenance(db, log_id)

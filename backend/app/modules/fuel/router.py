from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.modules.fuel.models import FuelLog
from app.modules.fuel.schemas import FuelLogCreate, FuelLogRead
from app.modules.fuel import service

router = APIRouter()

@router.get("/", response_model=list[FuelLogRead])
def list_fuel_logs(
    vehicle_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    q = db.query(FuelLog).filter(FuelLog.is_deleted == False)
    if vehicle_id: q = q.filter(FuelLog.vehicle_id == vehicle_id)
    return q.order_by(FuelLog.id.desc()).all()

@router.post("/", response_model=FuelLogRead, status_code=201)
def create_fuel_log(
    payload: FuelLogCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager", "dispatcher"))
):
    return service.create_fuel_log(db, payload)

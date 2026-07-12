from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.modules.drivers.models import Driver
from app.modules.drivers.schemas import DriverCreate, DriverUpdate, DriverRead

router = APIRouter()

@router.get("/", response_model=list[DriverRead])
def list_drivers(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    q = db.query(Driver).filter(Driver.is_deleted == False)
    if status: q = q.filter(Driver.status == status)
    return q.order_by(Driver.id).all()

@router.post("/", response_model=DriverRead, status_code=201)
def create_driver(
    payload: DriverCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager"))
):
    existing = db.query(Driver).filter(Driver.license_number == payload.license_number).first()
    if existing:
        raise HTTPException(400, f"License number '{payload.license_number}' is already registered.")
    driver = Driver(**payload.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

@router.get("/{driver_id}", response_model=DriverRead)
def get_driver(driver_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    driver = db.get(Driver, driver_id)
    if not driver or driver.is_deleted:
        raise HTTPException(404, "Driver not found")
    return driver

@router.patch("/{driver_id}", response_model=DriverRead)
def update_driver(
    driver_id: int,
    payload: DriverUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager"))
):
    driver = db.get(Driver, driver_id)
    if not driver or driver.is_deleted:
        raise HTTPException(404, "Driver not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(driver, field, value)
    db.commit()
    db.refresh(driver)
    return driver

@router.delete("/{driver_id}")
def delete_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager"))
):
    driver = db.get(Driver, driver_id)
    if not driver or driver.is_deleted:
        raise HTTPException(404, "Driver not found")
    driver.is_deleted = True
    db.commit()
    return {"message": "Driver deleted successfully"}

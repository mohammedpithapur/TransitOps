from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.core.dependencies import get_current_user, require_role
from app.modules.expenses.models import Expense
from app.modules.expenses.schemas import ExpenseCreate, ExpenseRead

router = APIRouter()

@router.get("/", response_model=list[ExpenseRead])
def list_expenses(
    vehicle_id: Optional[int] = None,
    trip_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    q = db.query(Expense).filter(Expense.is_deleted == False)
    if vehicle_id: q = q.filter(Expense.vehicle_id == vehicle_id)
    if trip_id: q = q.filter(Expense.trip_id == trip_id)
    return q.order_by(Expense.id.desc()).all()

@router.post("/", response_model=ExpenseRead, status_code=201)
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("fleet_manager", "dispatcher"))
):
    expense = Expense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

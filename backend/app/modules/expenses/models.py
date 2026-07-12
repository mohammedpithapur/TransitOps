from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, Date, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.modules.vehicles.models import Vehicle
    from app.modules.trips.models import Trip

class Expense(Base):
    __tablename__ = "expenses"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[Optional[int]] = mapped_column(ForeignKey("vehicles.id"), nullable=True)
    trip_id: Mapped[Optional[int]] = mapped_column(ForeignKey("trips.id"), nullable=True)
    driver_id: Mapped[Optional[int]] = mapped_column(ForeignKey("drivers.id"), nullable=True)
    category: Mapped[str] = mapped_column(String(50))  # Toll/Parking/Driver Allowance/Food/Loading-Unloading/Repair/Fine/Other
    amount: Mapped[float] = mapped_column(Float)
    date: Mapped[date] = mapped_column(Date)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    vehicle: Mapped[Optional["Vehicle"]] = relationship(back_populates="expenses")
    trip: Mapped[Optional["Trip"]] = relationship(back_populates="expenses")

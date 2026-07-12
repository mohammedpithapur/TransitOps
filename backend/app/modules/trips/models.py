import enum
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, Enum as SAEnum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.modules.vehicles.models import Vehicle
    from app.modules.drivers.models import Driver
    from app.modules.fuel.models import FuelLog
    from app.modules.expenses.models import Expense

class TripStatus(str, enum.Enum):
    DRAFT = "Draft"
    DISPATCHED = "Dispatched"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class Trip(Base):
    __tablename__ = "trips"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trip_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), index=True)
    status: Mapped[TripStatus] = mapped_column(SAEnum(TripStatus), default=TripStatus.DRAFT)
    source: Mapped[str] = mapped_column(String(255))
    destination: Mapped[str] = mapped_column(String(255))
    cargo_weight_kg: Mapped[float] = mapped_column(Float)
    estimated_distance_km: Mapped[float] = mapped_column(Float)
    actual_distance_km: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fuel_consumed_l: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    revenue: Mapped[float] = mapped_column(Float, default=0)
    cancellation_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    dispatched_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    vehicle: Mapped["Vehicle"] = relationship(back_populates="trips")
    driver: Mapped["Driver"] = relationship(back_populates="trips")
    fuel_logs: Mapped[list["FuelLog"]] = relationship(back_populates="trip")
    expenses: Mapped[list["Expense"]] = relationship(back_populates="trip")

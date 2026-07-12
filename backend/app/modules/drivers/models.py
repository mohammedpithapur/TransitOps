import enum
from datetime import date, datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, Date, DateTime, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.modules.trips.models import Trip

class DriverStatus(str, enum.Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    OFF_DUTY = "Off Duty"
    SUSPENDED = "Suspended"

class Driver(Base):
    __tablename__ = "drivers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    license_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    license_category: Mapped[str] = mapped_column(String(100))
    license_expiry_date: Mapped[date] = mapped_column(Date)
    contact_number: Mapped[str] = mapped_column(String(20))
    safety_score: Mapped[int] = mapped_column(Integer, default=100)
    status: Mapped[DriverStatus] = mapped_column(SAEnum(DriverStatus), default=DriverStatus.AVAILABLE)
    total_trips_completed: Mapped[int] = mapped_column(Integer, default=0)
    total_distance_driven_km: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    trips: Mapped[list["Trip"]] = relationship(back_populates="driver")

import enum
from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Float, Integer, Boolean, Date, DateTime, Enum as SAEnum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.modules.trips.models import Trip
    from app.modules.maintenance.models import MaintenanceLog
    from app.modules.fuel.models import FuelLog
    from app.modules.expenses.models import Expense

class VehicleStatus(str, enum.Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    RETIRED = "Retired"

class Vehicle(Base):
    __tablename__ = "vehicles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    registration_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    type: Mapped[str] = mapped_column(String(50))  # Truck/Van/Bus/Tanker/Pickup/Motorcycle
    fuel_type: Mapped[str] = mapped_column(String(50), default="Diesel")  # Diesel/Petrol/CNG/Electric
    status: Mapped[VehicleStatus] = mapped_column(SAEnum(VehicleStatus), default=VehicleStatus.AVAILABLE)
    max_load_capacity_kg: Mapped[float] = mapped_column(Float)
    acquisition_cost: Mapped[float] = mapped_column(Float)
    current_odometer_km: Mapped[float] = mapped_column(Float, default=0)
    region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    insurance_expiry: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    trips: Mapped[list["Trip"]] = relationship(back_populates="vehicle")
    maintenance_logs: Mapped[list["MaintenanceLog"]] = relationship(back_populates="vehicle")
    fuel_logs: Mapped[list["FuelLog"]] = relationship(back_populates="vehicle")
    expenses: Mapped[list["Expense"]] = relationship(back_populates="vehicle")

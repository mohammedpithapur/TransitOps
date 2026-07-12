from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.modules.vehicles.models import Vehicle
    from app.modules.drivers.models import Driver
    from app.modules.trips.models import Trip

class FuelLog(Base):
    __tablename__ = "fuel_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    driver_id: Mapped[Optional[int]] = mapped_column(ForeignKey("drivers.id"), nullable=True)
    trip_id: Mapped[Optional[int]] = mapped_column(ForeignKey("trips.id"), nullable=True)
    date: Mapped[date] = mapped_column(Date)
    quantity_l: Mapped[float] = mapped_column(Float)
    price_per_litre: Mapped[float] = mapped_column(Float)
    total_cost: Mapped[float] = mapped_column(Float)
    odometer_at_fuel: Mapped[float] = mapped_column(Float, default=0)
    km_since_last_fuel: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    fuel_efficiency_kml: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    station_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    vehicle: Mapped["Vehicle"] = relationship(back_populates="fuel_logs")
    trip: Mapped[Optional["Trip"]] = relationship(back_populates="fuel_logs")

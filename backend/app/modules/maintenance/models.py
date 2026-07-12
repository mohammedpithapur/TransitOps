import enum
from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, Date, DateTime, Text, Enum as SAEnum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

if TYPE_CHECKING:
    from app.modules.vehicles.models import Vehicle

class MaintenanceStatus(str, enum.Enum):
    OPEN = "Open"
    CLOSED = "Closed"

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    type: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[MaintenanceStatus] = mapped_column(SAEnum(MaintenanceStatus), default=MaintenanceStatus.OPEN)
    parts_cost: Mapped[float] = mapped_column(Float, default=0)
    labour_cost: Mapped[float] = mapped_column(Float, default=0)
    total_cost: Mapped[float] = mapped_column(Float, default=0)
    odometer_at_service: Mapped[float] = mapped_column(Float, default=0)
    scheduled_date: Mapped[date] = mapped_column(Date)
    completed_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    vendor_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    vehicle: Mapped["Vehicle"] = relationship(back_populates="maintenance_logs")

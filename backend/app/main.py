from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.base import Base
from app.db.session import engine
from app.core.config import settings

# Import all models to ensure they are registered on Base metadata
from app.modules.users.models import User
from app.modules.vehicles.models import Vehicle
from app.modules.drivers.models import Driver
from app.modules.trips.models import Trip
from app.modules.maintenance.models import MaintenanceLog
from app.modules.fuel.models import FuelLog
from app.modules.expenses.models import Expense

# Auto-create SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TransitOps API",
    description="Smart Transport Operations Platform API",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from app.modules.auth.router import router as auth_router
from app.modules.vehicles.router import router as vehicles_router
from app.modules.drivers.router import router as drivers_router
from app.modules.trips.router import router as trips_router
from app.modules.maintenance.router import router as maintenance_router
from app.modules.fuel.router import router as fuel_router
from app.modules.expenses.router import router as expenses_router
from app.modules.reports.router import router as reports_router

PREFIX = "/api/v1"
app.include_router(auth_router, prefix=f"{PREFIX}/auth", tags=["Auth"])
app.include_router(vehicles_router, prefix=f"{PREFIX}/vehicles", tags=["Vehicles"])
app.include_router(drivers_router, prefix=f"{PREFIX}/drivers", tags=["Drivers"])
app.include_router(trips_router, prefix=f"{PREFIX}/trips", tags=["Trips"])
app.include_router(maintenance_router, prefix=f"{PREFIX}/maintenance", tags=["Maintenance"])
app.include_router(fuel_router, prefix=f"{PREFIX}/fuel", tags=["Fuel"])
app.include_router(expenses_router, prefix=f"{PREFIX}/expenses", tags=["Expenses"])
app.include_router(reports_router, prefix=f"{PREFIX}/reports", tags=["Reports"])

@app.get("/")
def read_root():
    return {"message": "TransitOps API is running", "docs": "/docs"}

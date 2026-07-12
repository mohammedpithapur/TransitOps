import sys
import os
from datetime import date, timedelta, datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.modules.users.models import User, Role
from app.modules.vehicles.models import Vehicle, VehicleStatus
from app.modules.drivers.models import Driver, DriverStatus
from app.modules.trips.models import Trip, TripStatus
from app.modules.maintenance.models import MaintenanceLog, MaintenanceStatus
from app.modules.fuel.models import FuelLog
from app.modules.expenses.models import Expense
from app.core.security import hash_password

# Recreate tables if they don't exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already seeded. Skipping seed.")
        sys.exit(0)

    print("Seeding database...")

    # USERS
    users = [
        User(name="Ahmed Al-Rashid", email="manager@transitops.com", password_hash=hash_password("demo123"), role=Role.FLEET_MANAGER),
        User(name="Omar Hassan", email="dispatch@transitops.com", password_hash=hash_password("demo123"), role=Role.DISPATCHER),
        User(name="Fatima Al-Zahra", email="safety@transitops.com", password_hash=hash_password("demo123"), role=Role.SAFETY_OFFICER),
        User(name="Layla Nasser", email="finance@transitops.com", password_hash=hash_password("demo123"), role=Role.FINANCIAL_ANALYST),
    ]
    for u in users:
        db.add(u)
    db.commit()
    print(f"  Created {len(users)} users")

    # VEHICLES
    vehicles_data = [
        dict(registration_number="REG-001", name="Toyota HiAce Van", type="Van", fuel_type="Petrol", status=VehicleStatus.AVAILABLE, max_load_capacity_kg=1500, acquisition_cost=850000, current_odometer_km=45200, region="North"),
        dict(registration_number="REG-002", name="Tata Prima Truck", type="Truck", fuel_type="Diesel", status=VehicleStatus.ON_TRIP, max_load_capacity_kg=10000, acquisition_cost=3200000, current_odometer_km=123500, region="South"),
        dict(registration_number="REG-003", name="Ashok Leyland Bus", type="Bus", fuel_type="Diesel", status=VehicleStatus.AVAILABLE, max_load_capacity_kg=5000, acquisition_cost=4500000, current_odometer_km=89000, region="East"),
        dict(registration_number="REG-004", name="Mahindra Bolero", type="Van", fuel_type="Diesel", status=VehicleStatus.IN_SHOP, max_load_capacity_kg=800, acquisition_cost=720000, current_odometer_km=22300, region="West"),
        dict(registration_number="REG-005", name="Volvo FH Truck", type="Truck", fuel_type="Diesel", status=VehicleStatus.AVAILABLE, max_load_capacity_kg=25000, acquisition_cost=9500000, current_odometer_km=210000, region="North"),
        dict(registration_number="REG-006", name="Force Traveller", type="Van", fuel_type="CNG", status=VehicleStatus.AVAILABLE, max_load_capacity_kg=2000, acquisition_cost=1100000, current_odometer_km=67400, region="South"),
        dict(registration_number="REG-007", name="BPCL Tanker", type="Tanker", fuel_type="Diesel", status=VehicleStatus.ON_TRIP, max_load_capacity_kg=15000, acquisition_cost=7500000, current_odometer_km=155000, region="East"),
        dict(registration_number="REG-008", name="Eicher Truck", type="Truck", fuel_type="Diesel", status=VehicleStatus.RETIRED, max_load_capacity_kg=8000, acquisition_cost=2800000, current_odometer_km=98700, region="West"),
    ]
    vehicles = [Vehicle(**v) for v in vehicles_data]
    for v in vehicles:
        db.add(v)
    db.commit()
    print(f"  Created {len(vehicles)} vehicles")

    # DRIVERS
    today = date.today()
    drivers_data = [
        dict(name="Rajesh Kumar", license_number="DL-HR-01-2019-8765", license_category="HMV,Transport", license_expiry_date=today + timedelta(days=610), contact_number="+919876543210", safety_score=88, status=DriverStatus.AVAILABLE),
        dict(name="Suresh Mehta", license_number="DL-MH-03-2016-7890", license_category="HMV", license_expiry_date=today + timedelta(days=20), contact_number="+919876543211", safety_score=72, status=DriverStatus.ON_TRIP),
        dict(name="Mohammed Rafi", license_number="DL-KA-04-1999-2345", license_category="HMV,HTV", license_expiry_date=today - timedelta(days=700), contact_number="+919876543212", safety_score=61, status=DriverStatus.SUSPENDED),
        dict(name="Priya Nair", license_number="DL-TN-06-2022-6789", license_category="LMV", license_expiry_date=today + timedelta(days=970), contact_number="+919876543213", safety_score=95, status=DriverStatus.AVAILABLE),
        dict(name="Deepak Patel", license_number="DL-GJ-04-2021-5678", license_category="HTV,HMV", license_expiry_date=today + timedelta(days=430), contact_number="+919876543214", safety_score=83, status=DriverStatus.AVAILABLE),
        dict(name="Lakshmi Devi", license_number="DL-AP-03-2019-4321", license_category="LMV", license_expiry_date=today + timedelta(days=120), contact_number="+919876543215", safety_score=78, status=DriverStatus.AVAILABLE),
    ]
    drivers = [Driver(**d) for d in drivers_data]
    for d in drivers:
        db.add(d)
    db.commit()
    print(f"  Created {len(drivers)} drivers")

    # TRIPS
    trips_data = [
        dict(trip_number="TRP-2026-0001", vehicle_id=3, driver_id=1, status=TripStatus.COMPLETED, source="Mumbai", destination="Pune", cargo_weight_kg=3200, estimated_distance_km=150, actual_distance_km=148, fuel_consumed_l=22, revenue=15000, dispatched_at=datetime.utcnow(), completed_at=datetime.utcnow()),
        dict(trip_number="TRP-2026-0002", vehicle_id=2, driver_id=2, status=TripStatus.DISPATCHED, source="Delhi", destination="Agra", cargo_weight_kg=8500, estimated_distance_km=210, revenue=28000, dispatched_at=datetime.utcnow()),
        dict(trip_number="TRP-2026-0003", vehicle_id=7, driver_id=5, status=TripStatus.DISPATCHED, source="Hyderabad", destination="Chennai", cargo_weight_kg=12000, estimated_distance_km=630, revenue=95000, dispatched_at=datetime.utcnow()),
        dict(trip_number="TRP-2026-0004", vehicle_id=1, driver_id=4, status=TripStatus.DRAFT, source="Jaipur", destination="Jodhpur", cargo_weight_kg=1100, estimated_distance_km=290, revenue=12000),
        dict(trip_number="TRP-2026-0005", vehicle_id=3, driver_id=6, status=TripStatus.CANCELLED, source="Bangalore", destination="Mysore", cargo_weight_kg=2800, estimated_distance_km=145, revenue=8000, cancellation_reason="Client cancelled order"),
    ]
    trips = [Trip(**t) for t in trips_data]
    for t in trips:
        db.add(t)
    db.commit()
    print(f"  Created {len(trips)} trips")

    # MAINTENANCE LOGS
    maintenance_data = [
        dict(vehicle_id=4, type="Engine Repair", description="Major engine overhaul due to overheating", status=MaintenanceStatus.OPEN, parts_cost=35000, labour_cost=10000, total_cost=45000, odometer_at_service=22300, scheduled_date=today - timedelta(days=5)),
        dict(vehicle_id=2, type="Tyre Replacement", description="All 6 tyres replaced", status=MaintenanceStatus.CLOSED, parts_cost=8000, labour_cost=4000, total_cost=12000, odometer_at_service=120000, scheduled_date=today - timedelta(days=20), completed_date=today - timedelta(days=15)),
        dict(vehicle_id=7, type="Oil Change", description="Full oil and filter change", status=MaintenanceStatus.CLOSED, parts_cost=2500, labour_cost=1000, total_cost=3500, odometer_at_service=150000, scheduled_date=today - timedelta(days=30), completed_date=today - timedelta(days=28)),
    ]
    for m in maintenance_data:
        db.add(MaintenanceLog(**m))
    db.commit()
    print(f"  Created {len(maintenance_data)} maintenance logs")

    # FUEL LOGS
    fuel_data = [
        dict(vehicle_id=3, driver_id=1, trip_id=1, date=today - timedelta(days=2), quantity_l=22, price_per_litre=92.5, total_cost=2035, odometer_at_fuel=89148, station_name="HP Petrol Bunk"),
        dict(vehicle_id=2, driver_id=2, trip_id=2, date=today, quantity_l=85, price_per_litre=89.0, total_cost=7565, odometer_at_fuel=123500, station_name="Indian Oil, NH-48"),
        dict(vehicle_id=7, driver_id=5, trip_id=3, date=today, quantity_l=120, price_per_litre=88.5, total_cost=10620, odometer_at_fuel=155000, station_name="BPCL, NH-65"),
        dict(vehicle_id=1, driver_id=4, date=today - timedelta(days=5), quantity_l=40, price_per_litre=95.0, total_cost=3800, odometer_at_fuel=45200, station_name="Shell, Ring Road"),
        dict(vehicle_id=5, driver_id=5, date=today - timedelta(days=10), quantity_l=150, price_per_litre=88.0, total_cost=13200, odometer_at_fuel=210000, station_name="Indian Oil, NH-44"),
    ]
    for f in fuel_data:
        db.add(FuelLog(**f))
    db.commit()
    print(f"  Created {len(fuel_data)} fuel logs")

    # EXPENSES
    expense_data = [
        dict(vehicle_id=2, trip_id=2, category="Toll", amount=450, date=today, description="Delhi-Agra expressway toll"),
        dict(vehicle_id=7, trip_id=3, category="Toll", amount=1200, date=today, description="Multiple toll plazas NH-65"),
        dict(vehicle_id=3, trip_id=1, category="Loading/Unloading", amount=800, date=today - timedelta(days=2), description="Loading charges at Mumbai warehouse"),
    ]
    for e in expense_data:
        db.add(Expense(**e))
    db.commit()
    print(f"  Created {len(expense_data)} expenses")

    print("\n✅ Database seeded successfully!")
    print("\nDemo Login Credentials:")
    print("  Fleet Manager:     manager@transitops.com  / demo123")
    print("  Dispatcher:        dispatch@transitops.com / demo123")
    print("  Safety Officer:    safety@transitops.com   / demo123")
    print("  Financial Analyst: finance@transitops.com  / demo123")

except Exception as e:
    db.rollback()
    print(f"Error seeding: {e}")
    raise
finally:
    db.close()

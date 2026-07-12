export type Role = 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
export type MaintenanceStatus = 'Open' | 'Closed';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Vehicle {
  id: number;
  registration_number: string;
  name: string;
  type: string;
  fuel_type: string;
  status: VehicleStatus;
  max_load_capacity_kg: number;
  acquisition_cost: number;
  current_odometer_km: number;
  region?: string;
  insurance_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: number;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  safety_score: number;
  status: DriverStatus;
  total_trips_completed: number;
  total_distance_driven_km: number;
  created_at: string;
}

export interface Trip {
  id: number;
  trip_number: string;
  vehicle_id: number;
  driver_id: number;
  status: TripStatus;
  source: string;
  destination: string;
  cargo_weight_kg: number;
  estimated_distance_km: number;
  actual_distance_km?: number;
  fuel_consumed_l?: number;
  revenue: number;
  cancellation_reason?: string;
  dispatched_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface MaintenanceLog {
  id: number;
  vehicle_id: number;
  type: string;
  description: string;
  status: MaintenanceStatus;
  parts_cost: number;
  labour_cost: number;
  total_cost: number;
  odometer_at_service: number;
  scheduled_date: string;
  completed_date?: string;
  vendor_name?: string;
  created_at: string;
}

export interface FuelLog {
  id: number;
  vehicle_id: number;
  driver_id?: number;
  trip_id?: number;
  date: string;
  quantity_l: number;
  price_per_litre: number;
  total_cost: number;
  odometer_at_fuel: number;
  km_since_last_fuel?: number;
  fuel_efficiency_kml?: number;
  station_name?: string;
  created_at: string;
}

export interface Expense {
  id: number;
  vehicle_id?: number;
  trip_id?: number;
  driver_id?: number;
  category: string;
  amount: number;
  date: string;
  description?: string;
  created_at: string;
}

export interface DashboardKPIs {
  active_vehicles: number;
  available_vehicles: number;
  vehicles_in_maintenance: number;
  retired_vehicles: number;
  total_vehicles: number;
  active_trips: number;
  pending_trips: number;
  drivers_on_duty: number;
  available_drivers: number;
  fleet_utilization_pct: number;
  expiring_licenses_count: number;
  expiring_licenses: Array<{id: number; name: string; expiry: string; days_left: number}>;
}

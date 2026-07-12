import { api } from './client';
import type { DashboardKPIs } from '../types';

export const reportsApi = {
  dashboard: (params?: { region?: string; vehicle_type?: string }) => {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) cleanParams[k] = String(v);
      });
    }
    const q = new URLSearchParams(cleanParams).toString();
    return api.get<DashboardKPIs>(`/reports/dashboard${q ? '?' + q : ''}`);
  },
  vehicleRoi: () => api.get<any[]>('/reports/vehicle-roi'),
  fuelEfficiency: () => api.get<any[]>('/reports/fuel-efficiency'),
  operationalCost: () => api.get<any[]>('/reports/operational-cost'),
  fleetUtilization: () => api.get<any>('/reports/fleet-utilization'),
};

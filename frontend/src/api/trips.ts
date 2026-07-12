import { api } from './client';
import type { Trip } from '../types';

export const tripsApi = {
  list: (params?: { status?: string; vehicle_id?: number; driver_id?: number }) => {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) cleanParams[k] = String(v);
      });
    }
    const q = new URLSearchParams(cleanParams).toString();
    return api.get<Trip[]>(`/trips${q ? '?' + q : ''}`);
  },
  get: (id: number) => api.get<Trip>(`/trips/${id}`),
  create: (data: Partial<Trip>) => api.post<Trip>('/trips', data),
  update: (id: number, data: Partial<Trip>) => api.patch<Trip>(`/trips/${id}`, data),
  dispatch: (id: number) => api.post<Trip>(`/trips/${id}/dispatch`),
  complete: (id: number, data: { actual_distance_km: number; fuel_consumed_l: number }) => api.post<Trip>(`/trips/${id}/complete`, data),
  cancel: (id: number, reason: string) => api.post<Trip>(`/trips/${id}/cancel`, { reason }),
};

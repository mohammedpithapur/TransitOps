import { api } from './client';
import type { Vehicle } from '../types';

export const vehiclesApi = {
  list: (params?: { status?: string; type?: string; region?: string }) => {
    const q = new URLSearchParams(params as Record<string, string> || {}).toString();
    return api.get<Vehicle[]>(`/vehicles${q ? '?' + q : ''}`);
  },
  get: (id: number) => api.get<Vehicle>(`/vehicles/${id}`),
  create: (data: Partial<Vehicle>) => api.post<Vehicle>('/vehicles', data),
  update: (id: number, data: Partial<Vehicle>) => api.patch<Vehicle>(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};

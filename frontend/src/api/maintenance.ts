import { api } from './client';
import type { MaintenanceLog } from '../types';

export const maintenanceApi = {
  list: (params?: { vehicle_id?: number; status?: string }) => {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) cleanParams[k] = String(v);
      });
    }
    const q = new URLSearchParams(cleanParams).toString();
    return api.get<MaintenanceLog[]>(`/maintenance${q ? '?' + q : ''}`);
  },
  get: (id: number) => api.get<MaintenanceLog>(`/maintenance/${id}`),
  create: (data: Partial<MaintenanceLog>) => api.post<MaintenanceLog>('/maintenance', data),
  update: (id: number, data: Partial<MaintenanceLog>) => api.patch<MaintenanceLog>(`/maintenance/${id}`, data),
  close: (id: number) => api.post<MaintenanceLog>(`/maintenance/${id}/close`),
};

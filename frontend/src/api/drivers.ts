import { api } from './client';
import type { Driver } from '../types';

export const driversApi = {
  list: (status?: string) => api.get<Driver[]>(`/drivers${status ? '?status=' + status : ''}`),
  get: (id: number) => api.get<Driver>(`/drivers/${id}`),
  create: (data: Partial<Driver>) => api.post<Driver>('/drivers', data),
  update: (id: number, data: Partial<Driver>) => api.patch<Driver>(`/drivers/${id}`, data),
  delete: (id: number) => api.delete(`/drivers/${id}`),
};

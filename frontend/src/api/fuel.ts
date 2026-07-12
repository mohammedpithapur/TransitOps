import { api } from './client';
import type { FuelLog } from '../types';

export const fuelApi = {
  list: (vehicle_id?: number) => api.get<FuelLog[]>(`/fuel${vehicle_id ? '?vehicle_id=' + vehicle_id : ''}`),
  create: (data: Partial<FuelLog>) => api.post<FuelLog>('/fuel', data),
};

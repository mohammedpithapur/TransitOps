import { api } from './client';
import type { Expense } from '../types';

export const expensesApi = {
  list: (params?: { vehicle_id?: number; trip_id?: number }) => {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) cleanParams[k] = String(v);
      });
    }
    const q = new URLSearchParams(cleanParams).toString();
    return api.get<Expense[]>(`/expenses${q ? '?' + q : ''}`);
  },
  create: (data: Partial<Expense>) => api.post<Expense>('/expenses', data),
};

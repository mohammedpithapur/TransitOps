import { api } from './client';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; token_type: string; user: { id: number; name: string; email: string; role: string } }>('/auth/login', { email, password }),
};

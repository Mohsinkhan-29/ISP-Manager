import api from './axios'

export const authApi = {
  registerTenant: (data) =>
    api.post('/api/auth/register-tenant', data),

  login: (data) =>
    api.post('/api/auth/login', data),

  me: () =>
    api.get('/api/auth/me'),

  logout: () =>
    api.get('/api/auth/logout'),
}
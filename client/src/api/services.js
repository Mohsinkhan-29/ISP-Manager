import api from './axios'

// ─── Customers ───────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: (params) => api.get('/api/users', { params }),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.patch(`/api/users/${id}`, data),
  activate: (id) => api.patch(`/api/users/${id}/activate`),
  deactivate: (id) => api.patch(`/api/users/${id}/deactivate`),
}

// ─── Plans ────────────────────────────────────────────────────────────────────
export const plansApi = {
  getAll: (params) => api.get('/api/plans', { params }),
  create: (data) => api.post('/api/plans', data),
  update: (id, data) => api.patch(`/api/plans/${id}`, data),
  activate: (id) => api.patch(`/api/plans/${id}/activate`),
  deactivate: (id) => api.patch(`/api/plans/${id}/deactivate`),
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptionsApi = {
  getAll: (params) => api.get('/api/subscriptions', { params }),
  create: (data) => api.post('/api/subscriptions', data),
  updateStatus: (id, status) =>
    api.patch(`/api/subscriptions/${id}/status`, { status }),
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const invoicesApi = {
  getAll: (params) => api.get('/api/invoices', { params }),
  getById: (id) => api.get(`/api/invoices/${id}`),
  create: (data) => api.post('/api/invoices', data),
  cancel: (id) => api.patch(`/api/invoices/${id}/cancel`),
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
  getAll: (params) => api.get('/api/payments', { params }),
  getById: (id) => api.get(`/api/payments/${id}`),
  create: (data) => api.post('/api/payments', data),
}

// ─── Ledger ───────────────────────────────────────────────────────────────────
export const ledgerApi = {
  getAll: (params) => api.get('/api/ledger', { params }),
  getById: (id) => api.get(`/api/ledger/${id}`),
  getByCustomer: (userId, params) =>
    api.get(`/api/ledger/customer/${userId}`, { params }),
}

// ─── Admins ───────────────────────────────────────────────────────────────────
export const adminsApi = {
  getAll: (params) => api.get('/api/admins', { params }),
  create: (data) => api.post('/api/admins', data),
  updateRole: (id, role) => api.patch(`/api/admins/${id}/role`, { role }),
  delete: (id) => api.delete(`/api/admins/${id}`),
}

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: (params) => api.get('/api/notifications', { params }),
  getById: (id) => api.get(`/api/notifications/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/api/notifications/${id}/status`, { status }),
}
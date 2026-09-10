import api from './api';

export const userService = {
  getUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res?.data || res;
  },

  getOfficers: async () => {
    const res = await api.get('/users/officers');
    return res?.data || res;
  },

  createUser: async (data) => {
    const res = await api.post('/users', data);
    return res?.data || res;
  },

  updateUser: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res?.data || res;
  },

  toggleUserStatus: async (id, status) => {
    const res = await api.patch(`/users/${id}/status?status=${status}`);
    return res?.data || res;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res?.data || res;
  },
};

export const auditLogService = {
  getAuditLogs: async (params = {}) => {
    const res = await api.get('/audit-logs', { params });
    return res?.data || res;
  },
};

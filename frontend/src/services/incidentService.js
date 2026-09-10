import api from './api';

export const incidentService = {
  createIncident: async (incidentData) => {
    const res = await api.post('/incidents', incidentData);
    return res?.data || res;
  },

  getIncidents: async (params = {}) => {
    const res = await api.get('/incidents', { params });
    return res?.data || res;
  },

  getActiveIncidents: async () => {
    const res = await api.get('/incidents/active');
    return res?.data || res;
  },

  getDashboardStats: async () => {
    const res = await api.get('/incidents/stats');
    return res?.data || res;
  },

  getIncidentById: async (id) => {
    const res = await api.get(`/incidents/${id}`);
    return res?.data || res;
  },

  getIncidentByNumber: async (incidentNumber) => {
    const res = await api.get(`/incidents/number/${incidentNumber}`);
    return res?.data || res;
  },

  updateStatus: async (id, statusData) => {
    const res = await api.patch(`/incidents/${id}/status`, statusData);
    return res?.data || res;
  },

  assignOfficer: async (id, assignmentData) => {
    const res = await api.patch(`/incidents/${id}/assign`, assignmentData);
    return res?.data || res;
  },

  cancelIncident: async (id) => {
    const res = await api.patch(`/incidents/${id}/cancel`);
    return res?.data || res;
  },

  getIncidentHistory: async (id) => {
    const res = await api.get(`/incidents/${id}/history`);
    return res?.data || res;
  },
};

import api from './api';

export const locationService = {
  getLocations: async () => {
    const res = await api.get('/locations');
    return res?.data || res;
  },

  createLocation: async (data) => {
    const res = await api.post('/locations', data);
    return res?.data || res;
  },

  updateLocation: async (id, data) => {
    const res = await api.put(`/locations/${id}`, data);
    return res?.data || res;
  },

  deleteLocation: async (id) => {
    const res = await api.delete(`/locations/${id}`);
    return res?.data || res;
  },
};

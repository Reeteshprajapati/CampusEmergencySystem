import api from './api';

export const aiService = {
  analyzeIncident: async (incidentData) => {
    const res = await api.post('/ai/analyze', incidentData);
    return res?.data || res;
  },

  chat: async (prompt) => {
    const res = await api.post('/ai/chat', { prompt });
    return res?.data || res;
  },
};

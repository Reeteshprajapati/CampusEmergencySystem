import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const loginData = res?.data || res;
    if (loginData?.token) {
      localStorage.setItem('cg_token', loginData.token);
      localStorage.setItem('cg_user', JSON.stringify(loginData.user));
    }
    return loginData;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res?.data || res;
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res?.data || res;
  },

  logout: () => {
    localStorage.removeItem('cg_token');
    localStorage.removeItem('cg_user');
  },
};

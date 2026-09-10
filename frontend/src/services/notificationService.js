import api from './api';

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res;
  },

  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return res;
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res;
  },
};

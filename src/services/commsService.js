import api from '../utils/api';

/**
 * Communications Service - Notifications and Contact Messages
 */
export const commsService = {
    // Notifications
    getNotifications: (params) => api.get('/comms/notifications', { params }),
    getNotificationById: (id) => api.get(`/comms/notifications/${id}`),
    createNotification: (data) => api.post('/comms/notifications', data),
    markNotificationRead: (id) => api.patch(`/comms/notifications/${id}/read`),
    markAllNotificationsRead: () => api.patch('/comms/notifications/mark-all-read'),
    deleteNotification: (id) => api.delete(`/comms/notifications/${id}`),

    // Contact Messages
    getContactMessages: (params) => api.get('/comms/contact-messages', { params }),
    getContactMessageById: (id) => api.get(`/comms/contact-messages/${id}`),
    createPublicMessage: (data) => api.post('/comms/contact-messages/public', data),
    assignMessage: (id, assignData) => api.patch(`/comms/contact-messages/${id}/assign`, assignData),
    updateMessageStatus: (id, statusData) => api.patch(`/comms/contact-messages/${id}/status`, statusData),
    getMessageStats: () => api.get('/comms/contact-messages/stats/overview'),
};

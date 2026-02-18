import api from '../utils/api';

/**
 * Email Service - Send documents via email
 * Supports types: 'invoices', 'paystubs', 'statements'
 */
export const emailService = {
    sendWithAttachment: (type, id, data) => api.post(`/email/${type}/${id}/send`, data),
    sendWithLink: (type, id, data) => api.post(`/email/${type}/${id}/send-link`, data),
};

import api from '../utils/api';

/**
 * Document Service - Document Center management
 */
export const documentService = {
    getAll: (params) => api.get('/documents', { params }),
    getById: (id) => api.get(`/documents/${id}`),
    create: (data) => api.post('/documents', data),
    update: (id, data) => api.put(`/documents/${id}`, data),
    delete: (id) => api.delete(`/documents/${id}`),
    getStats: () => api.get('/documents/stats/types'),
};

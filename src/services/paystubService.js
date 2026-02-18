import api from '../utils/api';

/**
 * PayStub Service - PayStub CRUD operations
 */
export const paystubService = {
    getAll: (params) => api.get('/paystubs', { params }),
    getById: (id) => api.get(`/paystubs/${id}`),
    create: (data) => api.post('/paystubs', data),
    update: (id, data) => api.put(`/paystubs/${id}`, data),
    delete: (id) => api.delete(`/paystubs/${id}`),
};

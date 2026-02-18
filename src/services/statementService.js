import api from '../utils/api';

/**
 * Statement Service - Statement CRUD and generation
 */
export const statementService = {
    getAll: (params) => api.get('/statements', { params }),
    getById: (id) => api.get(`/statements/${id}`),
    generate: (data) => api.post('/statements/generate', data),
    delete: (id) => api.delete(`/statements/${id}`),
};

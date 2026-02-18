import api from '../utils/api';

/**
 * Operations Service - Assignments, Service Types, Stats
 */
export const operationsService = {
    // Operational Statistics
    getStats: () => api.get('/operations/stats'),

    // Assignments (Missions)
    getAssignments: (params) => api.get('/operations/assignments', { params }),
    getAssignmentById: (id) => api.get(`/operations/assignments/${id}`),
    createAssignment: (data) => api.post('/operations/assignments', data),
    updateAssignment: (id, data) => api.put(`/operations/assignments/${id}`, data),
    deleteAssignment: (id) => api.delete(`/operations/assignments/${id}`),
    updateAssignmentStatus: (id, statusData) => api.patch(`/operations/assignments/${id}/status`, statusData),
    markAssignmentPaid: (id) => api.patch(`/operations/assignments/${id}/paid`),

    // Service Types
    getServiceTypes: (params) => api.get('/operations/service-types', { params }),
    createServiceType: (data) => api.post('/operations/service-types', data),
    updateServiceType: (id, data) => api.put(`/operations/service-types/${id}`, data),
    deleteServiceType: (id) => api.delete(`/operations/service-types/${id}`),
};

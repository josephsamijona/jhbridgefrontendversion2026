import api from '../utils/api';

/**
 * People Service - Interpreters, Clients, Languages
 */
export const peopleService = {
    // Interpreters
    getInterpreters: (params) => api.get('/people/interpreters', { params }),
    getInterpreterById: (id) => api.get(`/people/interpreters/${id}`),
    createInterpreter: (data) => api.post('/people/interpreters', data),
    updateInterpreter: (id, data) => api.put(`/people/interpreters/${id}`, data),
    blockInterpreter: (id, blockData) => api.patch(`/people/interpreters/${id}/block`, blockData),

    // Clients
    getClients: (params) => api.get('/people/clients', { params }),
    getClientById: (id) => api.get(`/people/clients/${id}`),
    createClient: (data) => api.post('/people/clients', data),
    updateClient: (id, data) => api.put(`/people/clients/${id}`, data),

    // Languages (Helper)
    getLanguages: () => api.get('/people/languages'),
};

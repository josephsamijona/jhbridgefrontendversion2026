import api from '../utils/api';

/**
 * Finance Service - Client Payments, Interpreter Payments, Expenses, Payroll
 */
export const financeService = {
    // Financial Overview & Dashboard
    getOverview: (params) => api.get('/finance/overview', { params }),
    getTransactions: (params) => api.get('/finance/transactions', { params }),

    // Client Payments
    getClientPayments: (params) => api.get('/finance/client-payments', { params }),
    getClientPaymentById: (id) => api.get(`/finance/client-payments/${id}`),
    createClientPayment: (data) => api.post('/finance/client-payments', data),
    processClientPayment: (id) => api.patch(`/finance/client-payments/${id}/process`),

    // Interpreter Payments
    getInterpreterPayments: (params) => api.get('/finance/interpreter-payments', { params }),
    getInterpreterPaymentById: (id) => api.get(`/finance/interpreter-payments/${id}`),
    createInterpreterPayment: (data) => api.post('/finance/interpreter-payments', data),
    processInterpreterPayment: (id, proofData) => api.patch(`/finance/interpreter-payments/${id}/process`, proofData),

    // Expenses
    getExpenses: (params) => api.get('/finance/expenses', { params }),
    createExpense: (data) => api.post('/finance/expenses', data),
    approveExpense: (id, approvalData) => api.patch(`/finance/expenses/${id}/approve`, approvalData),

    // Payroll Documents
    getPayrollDocuments: (params) => api.get('/finance/payroll', { params }),
    getPayrollDocumentById: (id) => api.get(`/finance/payroll/${id}`),
};

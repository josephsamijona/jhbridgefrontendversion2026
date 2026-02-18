import api from '../utils/api';

/**
 * PDF Service - PDF generation and download
 * Supports types: 'invoices', 'paystubs', 'statements'
 */
export const pdfService = {
    generatePDF: (type, id) => api.post(`/pdf/${type}/${id}/generate-pdf`),
    getDownloadUrl: (type, id) => api.get(`/pdf/${type}/${id}/download`),
    deletePDF: (type, id) => api.delete(`/pdf/${type}/${id}`),
};

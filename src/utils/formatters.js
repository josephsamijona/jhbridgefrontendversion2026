import { format } from 'date-fns';

/**
 * Formats a number as USD currency
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount || 0);
};

/**
 * Formats a date string to a human-readable format
 * @param {string|Date} date 
 * @param {string} formatStr 
 * @returns {string}
 */
export const formatDate = (date, formatStr = 'PPP') => {
    if (!date) return 'N/A';
    return format(new Date(date), formatStr);
};

import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('jh_auth_token'),
    isAuthenticated: !!localStorage.getItem('jh_auth_token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('jh_auth_token', token);
            set({ token, user, isAuthenticated: true, isLoading: false });
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.error || 'Login failed',
                isLoading: false
            });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('jh_auth_token');
        set({ token: null, user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        if (!localStorage.getItem('jh_auth_token')) {
            set({ isAuthenticated: false, user: null });
            return;
        }

        try {
            const response = await api.get('/auth/me');
            set({ user: response.data.user, isAuthenticated: true });
        } catch (error) {
            localStorage.removeItem('jh_auth_token');
            set({ token: null, user: null, isAuthenticated: false });
        }
    },
}));

export default useAuthStore;

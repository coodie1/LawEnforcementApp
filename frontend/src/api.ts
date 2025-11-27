import axios from 'axios';
import type { AuthResponse, StatsData, Case, Arrest, Officer, Department } from './types';

// Create axios instance with base URL
const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add auth token to requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        const { data } = await API.post('/auth/login', { username, password });
        return data;
    },
    register: async (userData: {
        username: string;
        password: string;
        email?: string;
        firstName?: string;
        lastName?: string;
    }): Promise<AuthResponse> => {
        const { data } = await API.post('/auth/register', userData);
        return data;
    },
};

// Stats API
export const statsAPI = {
    getDashboard: async (): Promise<StatsData> => {
        const { data } = await API.get('/stats/dashboard');
        return data;
    },
};

// Cases API
export const casesAPI = {
    getAll: async (): Promise<Case[]> => {
        const { data } = await API.get('/cases');
        return data;
    },
    getById: async (id: string): Promise<Case> => {
        const { data } = await API.get(`/cases/${id}`);
        return data;
    },
    create: async (caseData: Partial<Case>): Promise<Case> => {
        const { data } = await API.post('/cases', caseData);
        return data;
    },
    update: async (id: string, caseData: Partial<Case>): Promise<Case> => {
        const { data } = await API.put(`/cases/${id}`, caseData);
        return data;
    },
    delete: async (id: string): Promise<void> => {
        await API.delete(`/cases/${id}`);
    },
};

// Arrests API
export const arrestsAPI = {
    getAll: async (): Promise<Arrest[]> => {
        const { data } = await API.get('/arrests');
        return data;
    },
    getById: async (id: number): Promise<Arrest> => {
        const { data } = await API.get(`/arrests/${id}`);
        return data;
    },
    create: async (arrestData: Partial<Arrest>): Promise<Arrest> => {
        const { data } = await API.post('/arrests', arrestData);
        return data;
    },
    update: async (id: number, arrestData: Partial<Arrest>): Promise<Arrest> => {
        const { data } = await API.put(`/arrests/${id}`, arrestData);
        return data;
    },
    delete: async (id: number): Promise<void> => {
        await API.delete(`/arrests/${id}`);
    },
};

// Officers API
export const officersAPI = {
    getAll: async (): Promise<Officer[]> => {
        const { data } = await API.get('/officers');
        return data;
    },
    getById: async (id: number): Promise<Officer> => {
        const { data } = await API.get(`/officers/${id}`);
        return data;
    },
    create: async (officerData: Partial<Officer>): Promise<Officer> => {
        const { data } = await API.post('/officers', officerData);
        return data;
    },
    update: async (id: number, officerData: Partial<Officer>): Promise<Officer> => {
        const { data } = await API.put(`/officers/${id}`, officerData);
        return data;
    },
    delete: async (id: number): Promise<void> => {
        await API.delete(`/officers/${id}`);
    },
};

// Departments API
export const departmentsAPI = {
    getAll: async (): Promise<Department[]> => {
        const { data } = await API.get('/departments');
        return data;
    },
    getById: async (id: number): Promise<Department> => {
        const { data } = await API.get(`/departments/${id}`);
        return data;
    },
    create: async (deptData: Partial<Department>): Promise<Department> => {
        const { data } = await API.post('/departments', deptData);
        return data;
    },
    update: async (id: number, deptData: Partial<Department>): Promise<Department> => {
        const { data } = await API.put(`/departments/${id}`, deptData);
        return data;
    },
    delete: async (id: number): Promise<void> => {
        await API.delete(`/departments/${id}`);
    },
};

export default API;

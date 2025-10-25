import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const tokenString = localStorage.getItem('sb-uoepkraejlhcbtrynsfl-auth-token');
  if (tokenString) {
    const token = JSON.parse(tokenString);
    config.headers.Authorization = `Bearer ${token.access_token}`;
  }
  return config;
});

export const experimentApi = {
  getAll: () => api.get('/experiments'),
  submit: (id: string, data: any) => api.post(`/experiments/${id}/submit`, data),
  getExperimentBySlug: (slug: string) => api.get(`/experiments/slug/${slug}`),
};

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getProgress: () => api.get('/users/progress'),
};

export const courseApi = {
  getAll: () => api.get('/courses'),
  getCourseById: (id: string) => api.get(`/courses/${id}`),
  getCourseByInstructor: (instructorId: string) => api.get(`/courses/instructor/${instructorId}`),
  getEnrolled: () => api.get('/courses/enrolled'),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`),
  getProgress: (id: string) => api.get(`/courses/${id}/progress`),
  getSubmissions: (courseId: string, experimentId: string) => api.get(`/courses/${courseId}/experiment/${experimentId}/submissions`),
};

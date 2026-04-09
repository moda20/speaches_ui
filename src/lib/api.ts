import axios from 'axios';
import env from './env';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);

  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const workspaceStore = useWorkspaceStore.getState();
  const workspaceUrl = workspaceStore.getCurrentApiUrl();
  config.baseURL = workspaceUrl;

  const currentWorkspaceId = workspaceStore.currentWorkspaceId;
  if (currentWorkspaceId) {
    config.headers['X-Workspace-ID'] = currentWorkspaceId;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

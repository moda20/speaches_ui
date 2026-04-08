import api from '@/lib/api';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  version?: string;
  uptime?: number;
  [key: string]: unknown;
}

export interface HealthService {
  getHealthStatus: () => Promise<HealthStatus>;
}

export const healthService: HealthService = {
  async getHealthStatus() {
    const response = await api.get<HealthStatus>('/health');
    return response.data;
  },
};

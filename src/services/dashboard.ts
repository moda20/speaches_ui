import api from "@/lib/api";

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  growth: number;
}

export const dashboardService = {
  async getMetrics() {
    const response = await api.get<DashboardMetrics>("/metrics");
    return response.data;
  },

  async getRecentActivity() {
    const response = await api.get("/activity/recent");
    return response.data;
  },
};

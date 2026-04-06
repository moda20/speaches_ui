import api from "@/lib/api";

export interface AnalyticsData {
  visitors: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export const analyticsService = {
  async getAnalytics(filters?: { startDate: string; endDate: string }) {
    const response = await api.get<AnalyticsData>("/analytics", {
      params: filters,
    });
    return response.data;
  },

  async getTrends() {
    const response = await api.get("/analytics/trends");
    return response.data;
  },
};

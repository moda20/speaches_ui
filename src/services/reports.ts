import api from "@/lib/api";

export interface Report {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  status: "completed" | "pending" | "failed";
}

export const reportsService = {
  async getReports() {
    const response = await api.get<Report[]>("/reports");
    return response.data;
  },

  async generateReport(data: {
    type: string;
    parameters: Record<string, unknown>;
  }) {
    const response = await api.post<Report>("/reports", data);
    return response.data;
  },

  async downloadReport(id: string, format: "pdf" | "csv") {
    const response = await api.get(`/reports/${id}/download`, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },
};

import { api } from '@/lib/api';

export interface SubmitReportData {
  reportedUserId: string;
  reason: string;
  description: string;
}

class ReportService {
  /**
   * Submit a report against another user
   */
  async submitReport(data: SubmitReportData): Promise<void> {
    await api.post('/reports', data);
  }
}

export const reportService = new ReportService();

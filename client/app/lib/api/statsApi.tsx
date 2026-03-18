const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class StatsApi {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getDoctorStats(period: string = 'month'): Promise<{
    success: boolean;
    stats?: any;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/stats/doctor?period=${period}`, {
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching doctor stats:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  async getPatientStats(): Promise<{
    success: boolean;
    stats?: any;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/stats/patient`, {
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching patient stats:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  async exportAppointments(): Promise<{
    success: boolean;
    csv?: string;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/stats/export`, {
        headers: this.getHeaders(),
      });
      
      if (response.ok) {
        const csv = await response.text();
        return { success: true, csv };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('❌ Error exporting appointments:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }
}

export const statsApi = new StatsApi();
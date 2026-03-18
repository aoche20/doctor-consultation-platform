import { Appointment } from '@/app/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class AppointmentApi {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }
  

  async createAppointment(data: {
    doctorId: string;
    date: string;
    timeSlot: { start: string; end: string };
    type: string;
    symptoms?: string;
  }): Promise<{ success: boolean; appointment?: Appointment; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }
  
   // ✅ CORRECTION: Cette ligne doit être un commentaire, pas commencer par /
  async getAppointmentById(appointmentId: string): Promise<{
    success: boolean;
    appointment?: Appointment;
    message?: string;
  }> {
    try {
      console.log('📡 Récupération du rendez-vous:', appointmentId);
      
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}`, {
        headers: this.getHeaders(),
      });
      
      const data = await response.json();
      console.log('📡 Réponse API:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching appointment:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }
  
  async getPatientAppointments(page: number = 1, status?: string): Promise<{
    success: boolean;
    appointments?: Appointment[];
    pagination?: any;
  }> {
    try {
      let url = `${API_URL}/api/appointments/patient?page=${page}`;
      if (status) url += `&status=${status}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching patient appointments:', error);
      return { success: false };
    }
  }

  async getDoctorAppointments(page: number = 1, status?: string, date?: string): Promise<{
    success: boolean;
    appointments?: Appointment[];
    pagination?: any;
  }> {
    try {
      let url = `${API_URL}/api/appointments/doctor?page=${page}`;
      if (status) url += `&status=${status}`;
      if (date) url += `&date=${date}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching doctor appointments:', error);
      return { success: false };
    }
  }

  async getAvailableSlots(doctorId: string, date: string): Promise<{
    success: boolean;
    date?: string;
    day?: string;
    availableSlots?: Array<{ start: string; end: string; available: boolean }>;
  }> {
    try {
      const response = await fetch(
        `${API_URL}/api/appointments/available-slots/${doctorId}?date=${date}`
      );
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching available slots:', error);
      return { success: false };
    }
  }

  
  async updateAppointmentStatus(appointmentId: string, status: string, reason?: string): Promise<{
    success: boolean;
    appointment?: Appointment;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ status, reason }),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }
  async addPrescription(appointmentId: number, data: {
  medicines: Array<{
    name: string;
    dosage: string;
    duration?: string;
    instructions?: string;
  }>;
  additionalNotes?: string;
  followUpDate?: string;
}): Promise<{
  success: boolean;
  message?: string;
  prescription?: any;
}> {
  try {
    const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/prescription`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('❌ Error adding prescription:', error);
    return { success: false, message: 'Erreur de connexion' };
  }
}

async getPrescription(appointmentId: number): Promise<{
  success: boolean;
  prescription?: any;
  appointment?: any;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/prescription`, {
      headers: this.getHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error('❌ Error getting prescription:', error);
    return { success: false, message: 'Erreur de connexion' };
  }
}
}

export const appointmentApi = new AppointmentApi();
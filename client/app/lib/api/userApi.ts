import { User, UpdateProfileData, AvailableSlot } from '@/app/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class UserApi {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async getProfile(userId: string): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/users/profile/${userId}`, {
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getHeaders(),
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  async uploadProfilePhoto(file: File): Promise<{ success: boolean; profilePicture?: string; user?: User; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${API_URL}/api/users/profile/photo`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('Error uploading photo:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  async updateAvailability(slots: AvailableSlot[]): Promise<{ success: boolean; availableSlots?: AvailableSlot[]; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/users/doctor/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getHeaders(),
        },
        body: JSON.stringify({ availableSlots: slots }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating availability:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }
}

export const userApi = new UserApi();
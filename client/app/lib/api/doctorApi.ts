import { DoctorFilters, SearchResponse, User, Review } from '@/app/types';
import { slugify } from '@/app/lib/utils/slugify';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class DoctorApi {
  async searchDoctors(filters: DoctorFilters = {}, page: number = 1): Promise<SearchResponse> {
    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      params.append('page', page.toString());
      params.append('limit', '10');

      const response = await fetch(`${API_URL}/api/doctors/search?${params.toString()}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error searching doctors:', error);
      return {
        success: false,
        doctors: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      };
    }
  }

  async getDoctorDetails(doctorId: string): Promise<{ success: boolean; doctor?: User; reviews?: Review[]; ratingStats?: any }> {
    try {
      const response = await fetch(`${API_URL}/api/doctors/${doctorId}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching doctor details:', error);
      return { success: false };
    }
  }
 async getDoctorByName(name: string): Promise<{ success: boolean; doctor?: User; reviews?: Review[]; ratingStats?: any }> {
    try {
      console.log('Recherche médecin par nom:', name);
      
      if (!name) {
        console.error('Nom non fourni');
        return { success: false };
      }
      
      const response = await fetch(`${API_URL}/api/doctors/by-name/${encodeURIComponent(name)}`);
      const data = await response.json();
      console.log('Résultat:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching doctor by name:', error);
      return { success: false };
    }
  }
    // Pour générer le lien vers la page du médecin
  getDoctorUrl(doctor: User): string {
    return `/doctors/${slugify(doctor.name)}`;
  }
  async getDoctorAvailability(doctorId: string): Promise<{ success: boolean; availableSlots?: any[]; consultationFee?: number }> {
    try {
      const response = await fetch(`${API_URL}/api/doctors/${doctorId}/availability`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching availability:', error);
      return { success: false };
    }
  }
}

export const doctorApi = new DoctorApi();
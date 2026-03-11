import { Review } from '@/app/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ReviewApi {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getDoctorReviews(doctorId: string, page: number = 1, sort: string = 'recent'): Promise<{
    success: boolean;
    reviews?: Review[];
    pagination?: any;
  }> {
    try {
      const response = await fetch(
        `${API_URL}/api/reviews/doctor/${doctorId}?page=${page}&sort=${sort}`
      );
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      return { success: false };
    }
  }

  async createReview(data: {
    doctorId: string;
    appointmentId: string;
    rating: number;
    comment: string;
    tags: string[];
    isAnonymous: boolean;
  }): Promise<{ success: boolean; review?: Review; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error creating review:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  async replyToReview(reviewId: string, message: string): Promise<{ success: boolean; replies?: any[]; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ message }),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error replying to review:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }
}

export const reviewApi = new ReviewApi();
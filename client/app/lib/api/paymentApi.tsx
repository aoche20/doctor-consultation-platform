const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class PaymentApi {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async createPaymentIntent(appointmentId: string): Promise<{
    success: boolean;
    clientSecret?: string;
    paymentIntentId?: string;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ appointmentId }),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error creating payment intent:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  async getPaymentDetails(appointmentId: string): Promise<{
    success: boolean;
    payment?: any;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/payments/${appointmentId}`, {
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching payment details:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  async refundPayment(appointmentId: string): Promise<{
    success: boolean;
    refund?: any;
    message?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/payments/refund`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ appointmentId }),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error refunding payment:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }
}

export const paymentApi = new PaymentApi();
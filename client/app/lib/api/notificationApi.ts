const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

class NotificationApi {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getNotifications(): Promise<{
    success: boolean;
    notifications?: Notification[];
  }> {
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return { success: false };
    }
  }

  async markAsRead(notificationId: number): Promise<{
    success: boolean;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return { success: false };
    }
  }

  async markAllAsRead(): Promise<{
    success: boolean;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return { success: false };
    }
  }
}

export const notificationApi = new NotificationApi();
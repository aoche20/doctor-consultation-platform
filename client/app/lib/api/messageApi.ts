import { User } from '@/app/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  sender: {
    id: number;
    name: string;
    role: string;
    profilePicture?: string;
  };
  receiver: {
    id: number;
    name: string;
    role: string;
    profilePicture?: string;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  appointmentId?: number;
}

export interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

class MessageApi {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async sendMessage(receiverId: number, content: string, appointmentId?: number): Promise<{
    success: boolean;
    message?: Message;
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ receiverId, content, appointmentId }),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  }

  async getConversations(): Promise<{
    success: boolean;
    conversations?: Conversation[];
  }> {
    try {
      const response = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      return { success: false };
    }
  }

  async getConversation(userId: number, page: number = 1): Promise<{
    success: boolean;
    messages?: Message[];
    pagination?: any;
  }> {
    try {
      const response = await fetch(
        `${API_URL}/api/messages/conversation/${userId}?page=${page}`,
        { headers: this.getHeaders() }
      );
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching conversation:', error);
      return { success: false };
    }
  }

  async markAsRead(senderId: number): Promise<{
    success: boolean;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/messages/read/${senderId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error marking as read:', error);
      return { success: false };
    }
  }
}

export const messageApi = new MessageApi();
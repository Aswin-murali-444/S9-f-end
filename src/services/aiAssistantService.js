const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class AIAssistantService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/ai-assistant`;
  }

  async sendMessage(message, conversationHistory = [], imageData = null) {
    try {
      const requestBody = {
        message,
        conversationHistory
      };

      if (imageData) {
        requestBody.imageData = imageData;
      }

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      return data;
    } catch (error) {
      console.error('AI Assistant Service Error:', error);
      throw error;
    }
  }

  async checkStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Service unavailable');
      }

      return data;
    } catch (error) {
      console.error('Status Check Error:', error);
      throw error;
    }
  }
}

export default new AIAssistantService();

import { OpenAISessionResponse } from '../types';

export class SessionService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async getEphemeralKey(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Session request failed: ${response.status}`);
      }

      const data: OpenAISessionResponse = await response.json();
      
      if (!data.client_secret?.value) {
        throw new Error('No ephemeral key provided by the server');
      }

      return data.client_secret.value;
    } catch (error) {
      console.error('Failed to get ephemeral key:', error);
      throw error;
    }
  }
}
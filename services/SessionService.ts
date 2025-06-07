import { OpenAISessionResponse } from '../types';

export class SessionService {
  private baseUrl: string;

  constructor(baseUrl: string = 'YOUR_BACKEND_URL') {
    this.baseUrl = baseUrl;
  }

  async getEphemeralKey(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/session`, {
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

// Example backend implementation you'll need to create
export const createSessionEndpoint = () => {
  /*
  // Express.js example for your backend:
  app.get('/api/session', async (req, res) => {
    try {
      const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-preview-2024-12-17',
        }),
      });
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  */
}; 
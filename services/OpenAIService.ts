// OpenAI API Service for medication assistant
export class OpenAIService {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(messages: Array<{role: string, content: string}>): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Fast and cost-effective
          messages: [
            {
              role: 'system',
              content: `You are a helpful medication assistant. Your primary role is to:
              
              - Help users track and manage their medications
              - Provide medication reminders and adherence support
              - Answer questions about medication schedules
              - Offer health and wellness advice related to medication management
              - Be encouraging and supportive about medication compliance
              
              Keep responses concise, helpful, and focused on medication management. 
              If asked about serious medical conditions, always recommend consulting a healthcare provider.
              
              The user is Linda, and she takes medications including Lexapro and Opill.`
            },
            ...messages
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sorry, I couldn\'t process that request.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async transcribeAudio(audioUri: string): Promise<string> {
    try {
      // Create form data for audio transcription
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch(`${this.baseURL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription error: ${response.status}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }
} 
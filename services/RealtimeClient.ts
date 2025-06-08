import Constants from 'expo-constants';
import { SessionStatus, RealtimeClientOptions } from '../types';
import { OpenAIService } from './OpenAIService';

export class RealtimeClient {
  private options: RealtimeClientOptions;
  private status: SessionStatus = 'DISCONNECTED';
  private openAIService: OpenAIService | null = null;
  private conversationHistory: Array<{role: string, content: string}> = [];

  constructor(options: RealtimeClientOptions) {
    this.options = options;
  }

  async connect(): Promise<void> {
    try {
      this.updateStatus('CONNECTING');
      
      // Get OpenAI API key from environment variables
      const apiKey = await this.getAPIKey();
      
      if (!apiKey) {
        throw new Error('No OpenAI API key provided. Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file');
      }

      this.openAIService = new OpenAIService(apiKey);
      
      // Test the connection with a simple request
      await this.openAIService.sendMessage([
        { role: 'user', content: 'Hello' }
      ]);

      this.updateStatus('CONNECTED');
      console.log('🤖 AI Text Assistant connected to OpenAI!');
      
      // Send a welcome message
      this.sendWelcomeMessage();

    } catch (error) {
      console.error('Connection failed:', error);
      this.updateStatus('DISCONNECTED');
      throw error;
    }
  }

  private async getAPIKey(): Promise<string> {
    // Get API key from environment variables
    const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY || 
                   process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      throw new Error(`
Please set your OpenAI API key:

1. Create a .env file in the project root
2. Add: EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-key-here
3. Get your API key from: https://platform.openai.com/api-keys
4. Restart the Expo server: npm start
      `);
    }
    
    return apiKey;
  }

  private sendWelcomeMessage(): void {
    this.options.onMessage?.({
      itemId: `ai-welcome-${Date.now()}`,
      type: 'MESSAGE',
      role: 'assistant',
      text: "Hi Linda! I'm your AI medication assistant. I can help you track your medications, answer questions about your schedule, provide health guidance, or just chat about your wellness journey. What would you like to know?",
      timestamp: new Date().toLocaleTimeString(),
      createdAtMs: Date.now(),
      status: 'DONE',
    });
  }

  async sendTextMessage(text: string): Promise<void> {
    console.log('📝 Processing message:', text);
    await this.processUserMessage(text);
  }

  private async processUserMessage(message: string): Promise<void> {
    if (!this.openAIService) {
      throw new Error('AI service not connected');
    }

    try {
      // Add user message to conversation history
      this.conversationHistory.push({ role: 'user', content: message });

      // Keep conversation history manageable (last 20 messages for better context)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      console.log('🤖 Getting AI response...');
      
      // Show typing indicator
      const typingId = `ai-typing-${Date.now()}`;
      this.options.onMessage?.({
        itemId: typingId,
        type: 'MESSAGE',
        role: 'assistant',
        text: '💭 Thinking...',
        timestamp: new Date().toLocaleTimeString(),
        createdAtMs: Date.now(),
        status: 'IN_PROGRESS',
      });

      // Add system message for medication assistant context
      const systemMessage = {
        role: 'system',
        content: `You are Linda's personal medication assistant. You help with medication tracking, schedule reminders, health questions, and provide supportive guidance. Be friendly, helpful, and focus on medication management and health topics. Keep responses concise but informative.`
      };

      const messagesWithSystem = [systemMessage, ...this.conversationHistory];
      const response = await this.openAIService.sendMessage(messagesWithSystem);
      
      // Add AI response to conversation history
      this.conversationHistory.push({ role: 'assistant', content: response });

      // Send the actual response
      this.options.onMessage?.({
        itemId: `ai-${Date.now()}`,
        type: 'MESSAGE',
        role: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString(),
        createdAtMs: Date.now(),
        status: 'DONE',
      });

    } catch (error) {
      console.error('Failed to process message:', error);
      this.options.onMessage?.({
        itemId: `error-${Date.now()}`,
        type: 'MESSAGE',
        role: 'assistant',
        text: 'Sorry, I encountered an error processing your request. Please check your internet connection and try again.',
        timestamp: new Date().toLocaleTimeString(),
        createdAtMs: Date.now(),
        status: 'DONE',
      });
    }
  }

  disconnect(): void {
    this.openAIService = null;
    this.conversationHistory = [];
    this.updateStatus('DISCONNECTED');
    console.log('👋 AI Text Assistant disconnected');
  }

  private updateStatus(status: SessionStatus): void {
    this.status = status;
    this.options.onStatusChange?.(status);
  }

  getStatus(): SessionStatus {
    return this.status;
  }

  // Legacy methods for compatibility - no-op in text-only mode
  async startRecording(): Promise<void> {
    console.log('📝 Voice recording disabled in text-only mode');
  }

  async stopRecording(): Promise<void> {
    console.log('📝 Voice recording disabled in text-only mode');
  }
} 
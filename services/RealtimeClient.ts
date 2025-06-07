import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { SessionStatus, RealtimeClientOptions } from '../types';
import { OpenAIService } from './OpenAIService';

export class RealtimeClient {
  private options: RealtimeClientOptions;
  private status: SessionStatus = 'DISCONNECTED';
  private openAIService: OpenAIService | null = null;
  private recording: Audio.Recording | null = null;
  private conversationHistory: Array<{role: string, content: string}> = [];

  constructor(options: RealtimeClientOptions) {
    this.options = options;
  }

  async connect(): Promise<void> {
    try {
      this.updateStatus('CONNECTING');
      
      // Get OpenAI API key - for testing, we'll use a hardcoded one
      // In production, this should come from your backend
      const apiKey = await this.getAPIKey();
      
      if (!apiKey) {
        throw new Error('No OpenAI API key provided');
      }

      this.openAIService = new OpenAIService(apiKey);
      
      // Test the connection with a simple request
      await this.openAIService.sendMessage([
        { role: 'user', content: 'Hello' }
      ]);

      // Request audio permissions
      if (Platform.OS !== 'web') {
        const { granted } = await Audio.requestPermissionsAsync();
        if (!granted) {
          throw new Error('Audio permissions not granted');
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      this.updateStatus('CONNECTED');
      console.log('🤖 AI Assistant connected to OpenAI!');
      
      // Send a welcome message
      this.sendWelcomeMessage();

    } catch (error) {
      console.error('Connection failed:', error);
      this.updateStatus('DISCONNECTED');
      throw error;
    }
  }

  private async getAPIKey(): Promise<string> {
    // TODO: Replace with your OpenAI API key
    // For security, this should come from a backend service
    const API_KEY = 'YOUR_OPENAI_API_KEY_HERE';
    
    if (API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
      throw new Error('Please set your OpenAI API key in services/RealtimeClient.ts');
    }
    
    return API_KEY;
  }

  private sendWelcomeMessage(): void {
    this.options.onMessage?.({
      itemId: `ai-welcome-${Date.now()}`,
      type: 'MESSAGE',
      role: 'assistant',
      text: "Hi Linda! I'm your medication assistant. I can help you track your medications, answer questions about your schedule, or just chat about your health journey. How can I help you today?",
      timestamp: new Date().toLocaleTimeString(),
      createdAtMs: Date.now(),
      status: 'DONE',
    });
  }

  async startRecording(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        console.log('🎤 Voice recording not supported on web - use text input');
        return;
      }

      console.log('🎤 Starting recording...');
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      this.recording = recording;
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }

  async stopRecording(): Promise<void> {
    try {
      if (!this.recording) {
        console.log('No recording to stop');
        return;
      }

      console.log('🛑 Stopping recording...');
      await this.recording.stopAndUnloadAsync();
      
      const uri = this.recording.getURI();
      this.recording = null;

      if (uri && this.openAIService) {
        console.log('📝 Transcribing audio...');
        
        // Show user that we're processing
        this.options.onMessage?.({
          itemId: `user-processing-${Date.now()}`,
          type: 'MESSAGE',
          role: 'user',
          text: '🎤 Transcribing...',
          timestamp: new Date().toLocaleTimeString(),
          createdAtMs: Date.now(),
          status: 'IN_PROGRESS',
        });

        try {
          const transcription = await this.openAIService.transcribeAudio(uri);
          
          if (transcription.trim()) {
            // Update the processing message with actual transcription
            this.options.onMessage?.({
              itemId: `user-${Date.now()}`,
              type: 'MESSAGE',
              role: 'user',
              text: transcription,
              timestamp: new Date().toLocaleTimeString(),
              createdAtMs: Date.now(),
              status: 'DONE',
            });

            // Send to AI for response
            await this.processUserMessage(transcription);
          }
        } catch (error) {
          console.error('Transcription failed:', error);
          this.options.onMessage?.({
            itemId: `error-${Date.now()}`,
            type: 'MESSAGE',
            role: 'assistant',
            text: 'Sorry, I couldn\'t understand the audio. Please try again or use text input.',
            timestamp: new Date().toLocaleTimeString(),
            createdAtMs: Date.now(),
            status: 'DONE',
          });
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }

  async sendTextMessage(text: string): Promise<void> {
    console.log('📝 Sending text:', text);
    await this.processUserMessage(text);
  }

  private async processUserMessage(message: string): Promise<void> {
    if (!this.openAIService) {
      throw new Error('AI service not connected');
    }

    try {
      // Add user message to conversation history
      this.conversationHistory.push({ role: 'user', content: message });

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
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

      const response = await this.openAIService.sendMessage(this.conversationHistory);
      
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

      // Speak the response on mobile
      if (Platform.OS !== 'web') {
        Speech.speak(response, {
          language: 'en',
          pitch: 1.0,
          rate: 0.9,
        });
      }

    } catch (error) {
      console.error('Failed to process message:', error);
      this.options.onMessage?.({
        itemId: `error-${Date.now()}`,
        type: 'MESSAGE',
        role: 'assistant',
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
        createdAtMs: Date.now(),
        status: 'DONE',
      });
    }
  }

  disconnect(): void {
    if (this.recording) {
      this.recording.stopAndUnloadAsync();
      this.recording = null;
    }
    
    this.openAIService = null;
    this.conversationHistory = [];
    this.updateStatus('DISCONNECTED');
    console.log('👋 AI Assistant disconnected');
  }

  private updateStatus(status: SessionStatus): void {
    this.status = status;
    this.options.onStatusChange?.(status);
  }

  getStatus(): SessionStatus {
    return this.status;
  }
} 
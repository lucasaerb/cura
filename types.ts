export type SessionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';

export interface TranscriptItem {
  itemId: string;
  type: 'MESSAGE';
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  createdAtMs: number;
  status: 'IN_PROGRESS' | 'DONE';
}

export interface RealtimeItem {
  itemId: string;
  status: string;
  role?: string;
  content?: any;
}

export interface RealtimeClientOptions {
  getEphemeralKey: () => Promise<string>;
  onMessage?: (item: TranscriptItem) => void;
  onStatusChange?: (status: SessionStatus) => void;
}

export interface OpenAISessionResponse {
  id: string;
  object: string;
  model: string;
  expires_at: number;
  modalities: string[];
  instructions: string;
  voice: string;
  turn_detection: object;
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription: object;
  tools: any[];
  tool_choice: string;
  temperature: number;
  max_response_output_tokens: string | number;
  client_secret: {
    value: string;
    expires_at: number;
  };
} 
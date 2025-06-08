export type SessionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export interface Message {
  itemId: string;
  type: 'MESSAGE';
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  createdAtMs: number;
  status: 'IN_PROGRESS' | 'DONE';
}

export interface RealtimeClientOptions {
  getEphemeralKey: () => Promise<string>;
  onMessage?: (message: Message) => void;
  onStatusChange?: (status: SessionStatus) => void;
} 
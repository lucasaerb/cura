import {
  mediaDevices,
  RTCPeerConnection,
  MediaStream,
  RTCView,
} from 'react-native-webrtc-web-shim';
import InCallManager from 'react-native-incall-manager';
import { SessionStatus, RealtimeClientOptions } from '../types';

export class RealtimeClient {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: any = null;
  private options: RealtimeClientOptions;
  private status: SessionStatus = 'DISCONNECTED';
  private isRecording = false;
  private localMediaStream: MediaStream | null = null;

  constructor(options: RealtimeClientOptions) {
    this.options = options;
  }

  async connect(): Promise<void> {
    try {
      this.updateStatus('CONNECTING');
      
      // Get ephemeral key from your backend
      const ephemeralKey = await this.options.getEphemeralKey();
      
      // Enable audio and force speaker
      await InCallManager.start({ media: 'audio' });
      InCallManager.setForceSpeakerphoneOn(true);
      
      // Setup WebRTC peer connection
      this.peerConnection = new RTCPeerConnection();

      // Create data channel for OpenAI events
      this.dataChannel = this.peerConnection.createDataChannel('oai-events', {
        ordered: true,
      });

      // Setup data channel event handlers
      this.dataChannel.onopen = () => {
        console.log('Data channel opened');
        this.updateStatus('CONNECTED');
        this.initializeSession();
      };

      this.dataChannel.onmessage = (event: any) => {
        this.handleMessage(JSON.parse(event.data));
      };

      // Get user media (microphone)
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      this.localMediaStream = stream;
      
      // Add audio track to peer connection
      stream.getTracks().forEach((track: any) => {
        this.peerConnection?.addTrack(track, stream);
      });

      // Create and send offer to OpenAI
      const offer = await this.peerConnection.createOffer({});
      await this.peerConnection.setLocalDescription(offer);

      // Send offer to OpenAI Realtime API
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      const response = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      const answerSdp = await response.text();
      const answer = {
        type: 'answer',
        sdp: answerSdp,
      };

      await this.peerConnection.setRemoteDescription(answer);

    } catch (error) {
      console.error('Connection failed:', error);
      this.updateStatus('DISCONNECTED');
      throw error;
    }
  }

  private initializeSession(): void {
    if (!this.dataChannel) return;

    // Initialize OpenAI session
    this.sendEvent({
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions: `
You are an AI assistant that helps answers questions about a user's medications. The medications you're going to help with are the following:            
                {
                    id: 1,
                    name: 'Lexapro',
                    genericName: 'escitalopram',
                    category: 'Antidepressant',
                    dosage: '10mg',
                    dueTime: '12:00',
                    frequency: 'daily',
                    instructions: 'Take with food',
                    taken: false,
                    nextIntake: null,
                    brandColor: '#2E5BFF',
                    streak: 5,
                    totalDoses: 30,
                    missedDoses: 2,
                    lastTaken: null,
                    refillDate: '2024-12-20',
                    prescribedBy: 'Dr. Smith'
                },
                {
                    id: 2,
                    name: 'Opill',
                    genericName: '',
                    category: 'Birth control',
                    dosage: '0.075mg',
                    dueTime: '09:00',
                    frequency: 'daily',
                    instructions: 'Take at same time daily',
                    taken: false,
                    nextIntake: null,
                    brandColor: '#2E5BFF',
                    streak: 12,
                    totalDoses: 21,
                    missedDoses: 0,
                    lastTaken: null,
                    refillDate: '2024-12-15',
                    prescribedBy: 'Dr. Johnson'
                },
                {
                    id: 3,
                    name: 'Metformin',
                    genericName: 'metformin HCl',
                    category: 'Diabetes',
                    dosage: '500mg',
                    dueTime: '18:00',
                    frequency: 'twice daily',
                    instructions: 'Take with dinner',
                    taken: false,
                    nextIntake: null,
                    brandColor: '#2E5BFF',
                    streak: 7,
                    totalDoses: 42,
                    missedDoses: 3,
                    lastTaken: null,
                    refillDate: '2024-12-25',
                    prescribedBy: 'Dr. Davis'
                }
        `,
        voice: 'sage',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1',
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.3,
          prefix_padding_ms: 500,
          silence_duration_ms: 1000,
        },
        tools: [],
        tool_choice: 'none',
        temperature: 0.8,
      },
    });
  }

  private handleMessage(event: any): void {
    console.log('Received event:', event);

    switch (event.type) {
      case 'conversation.item.created':
        if (event.item.role) {
          console.log('New conversation item created:', event.item);
          this.options.onMessage?.({
            itemId: event.item.id,
            type: 'MESSAGE',
            role: event.item.role,
            text: '',
            timestamp: new Date().toLocaleTimeString(),
            createdAtMs: Date.now(),
            status: 'IN_PROGRESS',
          });
        }
        break;

      case 'response.text.delta':
        if (event.delta && event.item_id) {
          console.log('Received text delta:', event.delta);
          // Update text with delta
          this.options.onMessage?.({
            itemId: event.item_id,
            type: 'MESSAGE',
            role: 'assistant',
            text: event.delta,
            timestamp: new Date().toLocaleTimeString(),
            createdAtMs: Date.now(),
            status: 'IN_PROGRESS',
          });
        }
        break;

      case 'response.audio_transcript.delta':
        if (event.delta && event.item_id) {
          console.log('Received audio transcript delta:', event.delta);
          // Update transcript with delta
          this.options.onMessage?.({
            itemId: event.item_id,
            type: 'MESSAGE',
            role: 'assistant',
            text: event.delta,
            timestamp: new Date().toLocaleTimeString(),
            createdAtMs: Date.now(),
            status: 'IN_PROGRESS',
          });
        }
        break;

      case 'response.done':
        if (event.item_id) {
          console.log('Response completed for item:', event.item_id);
          // Mark response as complete
          this.options.onMessage?.({
            itemId: event.item_id,
            type: 'MESSAGE',
            role: 'assistant',
            text: '',
            timestamp: new Date().toLocaleTimeString(),
            createdAtMs: Date.now(),
            status: 'DONE',
          });
        }
        break;

      case 'error':
        console.error('OpenAI error:', event);
        break;
    }
  }

  private sendEvent(event: any): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(event));
    }
  }

  startRecording(): void {
    if (!this.isRecording) {
      console.log('Starting recording...');
      this.isRecording = true;
      this.sendEvent({ type: 'input_audio_buffer.clear' });
    }
  }

  stopRecording(): void {
    if (this.isRecording) {
      console.log('Stopping recording...');
      this.isRecording = false;
      this.sendEvent({ type: 'input_audio_buffer.commit' });
      this.sendEvent({ type: 'response.create' });
    }
  }

  sendTextMessage(text: string): void {
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text,
          },
        ],
      },
    });
    this.sendEvent({ type: 'response.create' });
  }

  disconnect(): void {
    // Stop InCallManager
    InCallManager.stop();
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.localMediaStream) {
      this.localMediaStream.getTracks().forEach(track => track.stop());
      this.localMediaStream = null;
    }
    this.updateStatus('DISCONNECTED');
  }

  private updateStatus(status: SessionStatus): void {
    this.status = status;
    this.options.onStatusChange?.(status);
  }

  getStatus(): SessionStatus {
    return this.status;
  }
} 
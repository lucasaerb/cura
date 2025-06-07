import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RealtimeClient } from '../services/RealtimeClient';
import { SessionService } from '../services/SessionService';
import { useTranscript } from '../contexts/TranscriptContext';
import { SessionStatus, TranscriptItem } from '../types';

interface VoiceChatProps {
  backendUrl?: string;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({ backendUrl }) => {
  const [status, setStatus] = useState<SessionStatus>('DISCONNECTED');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const { transcriptItems, addMessage, updateMessage, clearTranscript } = useTranscript();
  const clientRef = useRef<RealtimeClient | null>(null);
  const sessionServiceRef = useRef<SessionService | null>(null);

  // Initialize session service
  React.useEffect(() => {
    if (backendUrl && backendUrl !== "YOUR_BACKEND_URL") {
      sessionServiceRef.current = new SessionService(backendUrl);
    }
  }, [backendUrl]);

  const handleMessage = (item: TranscriptItem) => {
    if (transcriptItems.find(t => t.itemId === item.itemId)) {
      updateMessage(item.itemId, item.text || '');
    } else {
      addMessage(item.itemId, item.role || 'assistant', item.text || '');
    }
  };

  const handleStatusChange = (newStatus: SessionStatus) => {
    setStatus(newStatus);
  };

  const connect = async () => {
    if (!sessionServiceRef.current) {
      Alert.alert('Setup Required', 'Please configure your backend URL in the SessionService to connect to OpenAI Realtime API');
      return;
    }

    try {
      clientRef.current = new RealtimeClient({
        getEphemeralKey: () => sessionServiceRef.current!.getEphemeralKey(),
        onMessage: handleMessage,
        onStatusChange: handleStatusChange,
      });

      await clientRef.current.connect();
    } catch (error) {
      console.error('Connection failed:', error);
      Alert.alert('Connection Failed', 'Could not connect to OpenAI Realtime API. Please check your backend configuration.');
    }
  };

  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
  };

  const startRecording = async () => {
    if (clientRef.current && status === 'CONNECTED') {
      setIsRecording(true);
      await clientRef.current.startRecording();
    }
  };

  const stopRecording = async () => {
    if (clientRef.current && isRecording) {
      setIsRecording(false);
      await clientRef.current.stopRecording();
    }
  };

  const sendTextMessage = async () => {
    if (clientRef.current && inputText.trim()) {
      addMessage(`user-${Date.now()}`, 'user', inputText);
      await clientRef.current.sendTextMessage(inputText);
      setInputText('');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'CONNECTED': return '#4CAF50';
      case 'CONNECTING': return '#FF9800';
      case 'DISCONNECTED': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderTranscriptItem = (item: TranscriptItem) => (
    <View key={item.itemId} style={[
      styles.messageContainer,
      item.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      <Text style={styles.roleText}>{item.role === 'user' ? 'You' : 'Assistant'}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestampText}>{item.timestamp}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Voice Assistant</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      {/* Transcript */}
      <ScrollView style={styles.transcript} showsVerticalScrollIndicator={false}>
        {transcriptItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="chat" size={48} color="#6B4E8D" />
            <Text style={styles.emptyStateTitle}>Start a conversation</Text>
            <Text style={styles.emptyStateSubtitle}>Connect to begin chatting with your AI assistant</Text>
          </View>
        ) : (
          transcriptItems.map(renderTranscriptItem)
        )}
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Connection Controls */}
        <View style={styles.connectionControls}>
          {status === 'DISCONNECTED' ? (
            <TouchableOpacity style={styles.connectButton} onPress={connect}>
              <Icon name="wifi" size={20} color="white" />
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
              <Icon name="wifi-off" size={20} color="white" />
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.clearButton} onPress={clearTranscript}>
            <Icon name="clear-all" size={20} color="white" />
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Controls */}
        {status === 'CONNECTED' && (
          <View style={styles.voiceControls}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingButton]}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Icon name={isRecording ? "stop" : "mic"} size={24} color="white" />
              <Text style={styles.recordButtonText}>
                {isRecording ? 'Recording...' : 'Hold to Talk'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Text Input */}
        {status === 'CONNECTED' && (
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#6B4E8D"
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
              onPress={sendTextMessage}
              disabled={!inputText.trim()}
            >
              <Icon name="send" size={20} color={inputText.trim() ? "white" : "#6B4E8D"} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E3FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D1B69',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6B4E8D',
    fontWeight: '500',
  },
  transcript: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1B69',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B4E8D',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  messageContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#8B5CF6',
    marginLeft: 40,
  },
  assistantMessage: {
    backgroundColor: 'white',
    marginRight: 40,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B4E8D',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 16,
    color: '#2D1B69',
    lineHeight: 22,
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 12,
    color: '#6B4E8D',
  },
  controls: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  connectionControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  connectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  disconnectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B4E8D',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceControls: {
    marginBottom: 16,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  recordingButton: {
    backgroundColor: '#FF4444',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D1B69',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#8B5CF6',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
}); 
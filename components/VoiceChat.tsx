import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RealtimeClient } from '../services/RealtimeClient';
import { SessionService } from '../services/SessionService';
import { useTranscript } from '../contexts/TranscriptContext';
import { SessionStatus, TranscriptItem } from '../types';

const { width } = Dimensions.get('window');

interface VoiceChatProps {
  backendUrl?: string;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({ backendUrl }) => {
  const [status, setStatus] = useState<SessionStatus>('DISCONNECTED');
  const [inputText, setInputText] = useState('');
  
  const { transcriptItems, addMessage, updateMessage, clearTranscript } = useTranscript();
  const clientRef = useRef<RealtimeClient | null>(null);
  const sessionServiceRef = useRef<SessionService | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Initialize session service
  React.useEffect(() => {
    if (backendUrl && backendUrl !== "YOUR_BACKEND_URL") {
      sessionServiceRef.current = new SessionService(backendUrl);
    }
  }, [backendUrl]);

  // Pulse animation for recording
  React.useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

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
    try {
      clientRef.current = new RealtimeClient({
        getEphemeralKey: () => Promise.resolve(''), // Not needed for direct API calls
        onMessage: handleMessage,
        onStatusChange: handleStatusChange,
      });

      await clientRef.current.connect();
    } catch (error) {
      console.error('Connection failed:', error);
      Alert.alert('Connection Failed', error.message || 'Could not connect to OpenAI API. Please check your API key configuration.');
    }
  };

  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
  };

  const sendTextMessage = async () => {
    if (clientRef.current && inputText.trim()) {
      addMessage(`user-${Date.now()}`, 'user', inputText);
      await clientRef.current.sendTextMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter' && !event.nativeEvent.shiftKey) {
      event.preventDefault();
      sendTextMessage();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'CONNECTED': return '#10B981';
      case 'CONNECTING': return '#F59E0B';
      case 'DISCONNECTED': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'CONNECTED': return 'Online';
      case 'CONNECTING': return 'Connecting...';
      case 'DISCONNECTED': return 'Offline';
      default: return 'Unknown';
    }
  };

  const renderTranscriptItem = (item: TranscriptItem) => (
    <View key={item.itemId} style={[
      styles.messageWrapper,
      item.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper
    ]}>
      <View style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage
      ]}>
        <View style={styles.messageHeader}>
          <View style={styles.avatarContainer}>
            <View style={[
              styles.avatar,
              item.role === 'user' ? styles.userAvatar : styles.assistantAvatar
            ]}>
              <Icon 
                name={item.role === 'user' ? 'person' : 'smart_toy'} 
                size={16} 
                color="white" 
              />
            </View>
            <Text style={[
              styles.roleText,
              item.role === 'user' ? styles.userRoleText : styles.assistantRoleText
            ]}>
              {item.role === 'user' ? 'You' : 'Assistant'}
            </Text>
          </View>
          <Text style={styles.timestampText}>{item.timestamp}</Text>
        </View>
        <Text style={[
          styles.messageText,
          item.role === 'user' ? styles.userMessageText : styles.assistantMessageText
        ]}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <View style={styles.logoContainer}>
              <Icon name="medical-services" size={24} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.title}>Medication Assistant</Text>
              <Text style={styles.subtitle}>Your personal health companion</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
      </View>

      {/* Transcript */}
      <ScrollView 
        style={styles.transcript} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.transcriptContent}
      >
        {transcriptItems.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Icon name="chat-bubble-outline" size={64} color="#A855F7" />
            </View>
            <Text style={styles.emptyStateTitle}>Welcome to Your Health Assistant</Text>
            <Text style={styles.emptyStateSubtitle}>
              I'm here to help you track your medications, answer questions about your health schedule, 
              and support your wellness journey. Connect to start our conversation!
            </Text>
            <View style={styles.emptyStateFeatures}>
              <View style={styles.featureItem}>
                <Icon name="medication" size={20} color="#7C3AED" />
                <Text style={styles.featureText}>Medication Tracking</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="schedule" size={20} color="#7C3AED" />
                <Text style={styles.featureText}>Schedule Management</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="health-and-safety" size={20} color="#7C3AED" />
                <Text style={styles.featureText}>Health Insights</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.welcomeMessage}>
              <View style={styles.assistantWelcome}>
                <View style={styles.assistantAvatarLarge}>
                  <Icon name="smart_toy" size={24} color="white" />
                </View>
                <View style={styles.welcomeContent}>
                  <Text style={styles.welcomeTitle}>Hi Linda! I'm your medication assistant.</Text>
                  <Text style={styles.welcomeText}>
                    I can help you track your medications, answer questions about your schedule, 
                    or just chat about your health journey. How can I help you today?
                  </Text>
                </View>
              </View>
            </View>
            {transcriptItems.map(renderTranscriptItem)}
          </>
        )}
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Connection Controls */}
        <View style={styles.connectionControls}>
          {status === 'DISCONNECTED' ? (
            <TouchableOpacity style={styles.connectButton} onPress={connect}>
              <Icon name="wifi" size={20} color="white" />
              <Text style={styles.buttonText}>Connect to AI</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
              <Icon name="wifi-off" size={20} color="white" />
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.clearButton} onPress={clearTranscript}>
            <Icon name="refresh" size={20} color="white" />
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Controls */}
        {status === 'CONNECTED' && (
          <View style={styles.voiceControls}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordingButton]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
              >
                <Icon name={isRecording ? "stop" : "mic"} size={28} color="white" />
                <Text style={styles.recordButtonText}>
                  {isRecording ? 'Release to Stop' : 'Hold to Talk'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* Text Input */}
        {status === 'CONNECTED' && (
          <View style={styles.textInputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message here..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
                onPress={sendTextMessage}
                disabled={!inputText.trim()}
              >
                <Icon name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Icon name="info-outline" size={16} color="#6B4E8D" />
          <Text style={styles.infoText}>
            Text-only chat mode • No voice recording • Powered by OpenAI
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transcript: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  transcriptContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    backgroundColor: '#F3E8FF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateFeatures: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
  welcomeMessage: {
    marginBottom: 24,
  },
  assistantWelcome: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  assistantAvatarLarge: {
    width: 48,
    height: 48,
    backgroundColor: '#7C3AED',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeContent: {
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  welcomeText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  assistantMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageContainer: {
    maxWidth: width * 0.8,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  userMessage: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 6,
  },
  assistantMessage: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  assistantAvatar: {
    backgroundColor: '#7C3AED',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userRoleText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  assistantRoleText: {
    color: '#6B7280',
  },
  userMessageText: {
    color: 'white',
  },
  timestampText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  assistantMessageText: {
    color: '#1F2937',
  },
  userTimestampText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  controls: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disconnectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B7280',
    paddingVertical: 14,
    borderRadius: 16,
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
    backgroundColor: '#7C3AED',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  recordingButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  textInputContainer: {
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    minHeight: 20,
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6B4E8D',
    fontStyle: 'italic',
  },
}); 
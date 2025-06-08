import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RealtimeClient } from '../services/RealtimeClient';
import { SessionService } from '../services/SessionService';
import { useTranscript } from '../contexts/TranscriptContext';
import { SessionStatus } from '../types';

interface VoiceChatProps {
  backendUrl?: string;
}

export const VoiceChat = forwardRef<{ disconnect: () => void }, VoiceChatProps>(({ backendUrl }, ref) => {
  const [status, setStatus] = useState<SessionStatus>('DISCONNECTED');
  const [isRecording, setIsRecording] = useState(false);
  
  const clientRef = useRef<RealtimeClient | null>(null);
  const sessionServiceRef = useRef<SessionService | null>(null);
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbOpacity = useRef(new Animated.Value(0.6)).current;

  useImperativeHandle(ref, () => ({
    disconnect: () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    }
  }));

  // Initialize session service and auto-connect
  useEffect(() => {
    if (backendUrl && backendUrl !== "YOUR_BACKEND_URL") {
      sessionServiceRef.current = new SessionService(backendUrl);
      connect();
    }
  }, [backendUrl]);

  // Breathing animation
  useEffect(() => {
    const breathingAnimation = Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(orbScale, {
            toValue: 1.2,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orbScale, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(orbOpacity, {
            toValue: 0.8,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orbOpacity, {
            toValue: 0.6,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
    ]);

    breathingAnimation.start();

    return () => {
      breathingAnimation.stop();
    };
  }, []);

  const handleMessage = (item: any) => {
    // Handle messages if needed
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

  return (
    <View style={styles.container}>
      {/* Breathing Orb */}
      <View style={styles.orbContainer}>
        <Animated.View
          style={[
            styles.orb,
            {
              transform: [{ scale: orbScale }],
              opacity: orbOpacity,
              backgroundColor: isRecording ? '#FF6B6B' : '#6B4E8D',
            },
          ]}
        />
        <Text style={styles.orbText}>
          {isRecording ? 'Listening...' : ''}
        </Text>
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
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#6B4E8D',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  orbText: {
    marginTop: 20,
    fontSize: 18,
    color: '#2D1B69',
    fontWeight: '500',
  },
  voiceControls: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6B4E8D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#FF6B6B',
  },
}); 
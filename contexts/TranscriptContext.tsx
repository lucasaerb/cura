import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TranscriptItem } from '../types';

interface TranscriptContextValue {
  transcriptItems: TranscriptItem[];
  addMessage: (itemId: string, role: "user" | "assistant", text: string) => void;
  updateMessage: (itemId: string, text: string) => void;
  clearTranscript: () => void;
}

const TranscriptContext = createContext<TranscriptContextValue | undefined>(undefined);

const STORAGE_KEY = 'voice_chat_transcript';

export const TranscriptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);

  // Load transcript from storage on init
  React.useEffect(() => {
    loadTranscript();
  }, []);

  // Save to storage whenever transcript changes
  React.useEffect(() => {
    saveTranscript();
  }, [transcriptItems]);

  const loadTranscript = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedItems = JSON.parse(saved);
        setTranscriptItems(parsedItems);
      }
    } catch (error) {
      console.error('Failed to load transcript:', error);
    }
  };

  const saveTranscript = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transcriptItems));
    } catch (error) {
      console.error('Failed to save transcript:', error);
    }
  };

  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const addMessage = (itemId: string, role: "user" | "assistant", text: string = "") => {
    setTranscriptItems((prev) => {
      if (prev.some((item) => item.itemId === itemId)) {
        return prev;
      }

      const newItem: TranscriptItem = {
        itemId,
        type: "MESSAGE",
        role,
        text,
        timestamp: getCurrentTime(),
        createdAtMs: Date.now(),
        status: "IN_PROGRESS",
      };

      return [...prev, newItem];
    });
  };

  const updateMessage = (itemId: string, newText: string) => {
    setTranscriptItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          return {
            ...item,
            text: newText,
            status: "DONE" as const,
          };
        }
        return item;
      })
    );
  };

  const clearTranscript = async () => {
    setTranscriptItems([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear transcript:', error);
    }
  };

  return (
    <TranscriptContext.Provider
      value={{
        transcriptItems,
        addMessage,
        updateMessage,
        clearTranscript,
      }}
    >
      {children}
    </TranscriptContext.Provider>
  );
};

export const useTranscript = () => {
  const context = useContext(TranscriptContext);
  if (!context) {
    throw new Error('useTranscript must be used within a TranscriptProvider');
  }
  return context;
}; 
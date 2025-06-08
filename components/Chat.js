import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';

const TypingIndicator = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 1,
            duration: 400,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 1,
            duration: 400,
            delay: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <View style={styles.typingContainer}>
      <Animated.View
        style={[
          styles.typingDot,
          {
            transform: [
              {
                translateY: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -6],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.typingDot,
          {
            transform: [
              {
                translateY: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -6],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.typingDot,
          {
            transform: [
              {
                translateY: dot3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -6],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

export const Chat = ({ isCheckIn }) => {
  const [messages, setMessages] = useState(
    isCheckIn ? [
      {
        id: 'welcome',
        text: "Hi! How are you feeling today?",
        sender: 'ai'
      }
    ] : []
  );
  const [inputText, setInputText] = useState('');
  const [hasStarted, setHasStarted] = useState(isCheckIn);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const examplePrompts = [
    "What instructions did my doctor give me?",
    "How do I get started?",
    "Are there any known side effects of Metformin?",
  ];

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (inputText.trim()) {
      setHasStarted(true);
      const userMessage = inputText.trim();
      setMessages(prev => [...prev, { id: Date.now().toString(), text: userMessage, sender: 'user' }]);
      setInputText('');
      setIsLoading(true);

      // Add typing indicator
      setMessages(prev => [...prev, { id: 'typing', isTyping: true }]);

      try {
        const response = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // Remove typing indicator and add AI response
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== 'typing'),
          {
            id: (Date.now() + 1).toString(),
            text: data.response,
            sender: 'ai',
          },
        ]);
      } catch (error) {
        console.error('Error:', error);
        // Remove typing indicator and add error message
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== 'typing'),
          {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I encountered an error. Please try again.",
            sender: 'ai',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExamplePress = (prompt) => {
    setInputText(prompt);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text style={[
        styles.messageText,
        item.sender === 'user' ? styles.userMessageText : styles.aiMessageText
      ]}>{item.text}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    if (item.isTyping) {
      return (
        <View style={[styles.messageContainer, styles.aiMessage]}>
          <TypingIndicator />
        </View>
      );
    }
    return renderMessage({ item });
  };

  const renderLandingPage = () => (
    <View style={styles.landingContainer}>

      
      <View style={styles.examplesContainer}>
        <Text style={styles.examplesTitle}>How can I help you today?</Text>
        {examplePrompts.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.exampleButton}
            onPress={() => handleExamplePress(prompt)}
          >
            <Text style={styles.exampleText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {!hasStarted ? (
        renderLandingPage()
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          multiline={false}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E3FF',
    width: '100%',
  },
  landingContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#E8E3FF',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D1B69',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  examplesContainer: {
    marginTop: 20,
    paddingHorizontal: 8,
  },
  examplesTitle: {
    fontSize: 20,
    color: '#2D1B69',
    marginBottom: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  exampleButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#2D1B69',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exampleText: {
    fontSize: 16,
    color: '#2D1B69',
    fontWeight: '500',
  },
  messageList: {
    flex: 1,
    width: '100%',
  },
  messageListContent: {
    padding: 16,
    width: '100%',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    width: '100%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2D1B69',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#2D1B69',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    height: 40,
  },
  sendButton: {
    backgroundColor: '#2D1B69',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D1B69',
    marginHorizontal: 2,
  },
}); 
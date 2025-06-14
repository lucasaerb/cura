import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions 
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Chat } from './components/Chat';

const { width, height } = Dimensions.get('window');

export default function AIMenu({ onClose, isCheckIn }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2D1B69" />
        
        {/* Header with close button */}
        <View style={styles.header}>
          <Text style={styles.title}>Talk to Cura</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Component */}
        <View style={styles.content}>
          <Chat isCheckIn={isCheckIn} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B69',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#060070',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#E8E3FF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    width: '100%',
  },
  placeholderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 24,
    color: '#060070',
    fontWeight: '500',
    textAlign: 'center',
  },
}); 
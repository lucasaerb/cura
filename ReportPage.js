import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ScrollView,
  Dimensions 
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ReportPage({ onClose }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8E3FF" />
      
      {/* Header with close button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderTitle}>📊 Health Reports</Text>
          <Text style={styles.placeholderText}>
            Your medication reports and analytics will appear here.
          </Text>
          <Text style={styles.placeholderSubtext}>
            Features coming soon:
            {'\n'}• Adherence tracking
            {'\n'}• Weekly summaries
            {'\n'}• Progress charts
            {'\n'}• Export options
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E3FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#E8E3FF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D1B69',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 27, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#2D1B69',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  placeholderContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    borderWidth: 2,
    borderColor: '#2D1B69',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 40,
  },
  placeholderTitle: {
    fontSize: 28,
    color: '#2D1B69',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  placeholderText: {
    fontSize: 18,
    color: '#6B4E8D',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#6B4E8D',
    textAlign: 'left',
    lineHeight: 24,
  },
}); 
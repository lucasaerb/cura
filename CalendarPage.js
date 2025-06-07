import React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions 
} from 'react-native';
import { Header, Card, Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function CalendarPage({ onClose }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#E8E3FF" />
        
        {/* Header with close button */}
        <Header
          centerComponent={{ 
            text: 'Calendar', 
            style: { color: '#2D1B69', fontSize: 24, fontWeight: 'bold' } 
          }}
          rightComponent={
            <Button
              icon={<Icon name="close" size={24} color="#2D1B69" />}
              onPress={onClose}
              buttonStyle={styles.closeButton}
              type="clear"
            />
          }
          backgroundColor="#E8E3FF"
          barStyle="dark-content"
        />

        {/* Main content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card containerStyle={styles.placeholderContainer}>
            <View style={styles.cardContent}>
              <Icon name="calendar-today" size={48} color="#2D1B69" style={styles.calendarMainIcon} />
              <Text style={styles.placeholderTitle}>Medication Calendar</Text>
              <Text style={styles.placeholderText}>
                Your medication schedule and calendar view will appear here.
              </Text>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Icon name="view-module" size={20} color="#6B4E8D" />
                  <Text style={styles.featureText}>Monthly calendar view</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="schedule" size={20} color="#6B4E8D" />
                  <Text style={styles.featureText}>Medication schedule overview</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="error-outline" size={20} color="#6B4E8D" />
                  <Text style={styles.featureText}>Missed dose tracking</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="notification-important" size={20} color="#6B4E8D" />
                  <Text style={styles.featureText}>Appointment reminders</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="refresh" size={20} color="#6B4E8D" />
                  <Text style={styles.featureText}>Prescription refill dates</Text>
                </View>
              </View>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#E8E3FF',
  },
  closeButton: {
    backgroundColor: 'rgba(45, 27, 105, 0.1)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  placeholderContainer: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2D1B69',
    borderStyle: 'dashed',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    alignItems: 'center',
  },
  calendarMainIcon: {
    marginBottom: 15,
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
    marginBottom: 25,
    lineHeight: 24,
  },
  featureList: {
    width: '100%',
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#6B4E8D',
    marginLeft: 12,
    lineHeight: 20,
  },
}; 
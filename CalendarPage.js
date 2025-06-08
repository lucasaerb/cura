import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function CalendarPage({ onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate sample medication adherence data for the past week
  const generateMedicationHistory = () => {
    const today = new Date();
    const medications = [
      { id: 1, name: 'Lexapro', time: '12:00', icon: '💊' },
      { id: 2, name: 'Opill', time: '09:00', icon: '💊' },
      { id: 3, name: 'Metformin', time: '18:00', icon: '💊' },
      { id: 4, name: 'Aspirin', time: '15:00', icon: '💊' },
    ];

    const history = [];
    
    // Generate data for the past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const dayMeds = medications.map(med => ({
        ...med,
        taken: Math.random() > 0.3, // 70% chance of being taken
        missed: Math.random() > 0.7, // 30% chance of being missed
      }));
      
      history.push({
        date: date,
        medications: dayMeds,
      });
    }
    
    return history;
  };

  // Generate sample medications for today
  const todayMedications = [
    { id: 1, name: 'Aspirin', time: '3:00pm', status: 'missed', icon: '💊' },
    { id: 2, name: 'Lisinopril', time: '5:30pm', status: 'upcoming', icon: '💊' },
    { id: 3, name: 'Amoxicillin', time: '8:00pm', status: 'pending', icon: '💊' },
    { id: 4, name: 'Metoprolol', time: '8:20pm', status: 'pending', icon: '💊' },
  ];

  const [medicationHistory] = useState(generateMedicationHistory());

  // Get current week dates for the horizontal selector
  const getWeekDates = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - 3 + i); // Show 3 days before, today, and 3 days after
      dates.push(date);
    }
    
    return dates;
  };

  const weekDates = getWeekDates();

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'missed': return '#FF6B6B';
      case 'upcoming': return '#4ECDC4';
      case 'pending': return '#95A5A6';
      default: return '#95A5A6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'missed': return 'Missed';
      case 'upcoming': return 'upcoming';
      case 'pending': return 'Taken';
      default: return 'Taken';
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#E8E3FF" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#2D1B69" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Date Display */}
          <View style={styles.dateContainer}>
            <View style={styles.datePill}>
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </View>
          </View>

          {/* Week Date Selector */}
          <View style={styles.weekSelector}>
            {weekDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayPill,
                  isToday(date) && styles.todayPill,
                  selectedDate.toDateString() === date.toDateString() && styles.selectedPill
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dayNumber,
                  isToday(date) && styles.todayText,
                  selectedDate.toDateString() === date.toDateString() && styles.selectedText
                ]}>
                  {date.getDate()}
                </Text>
                <Text style={[
                  styles.dayName,
                  isToday(date) && styles.todayText,
                  selectedDate.toDateString() === date.toDateString() && styles.selectedText
                ]}>
                  {getDayName(date)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Today's Medications */}
          <View style={styles.medicationsContainer}>
            {todayMedications.map((medication) => (
              <View key={medication.id} style={styles.medicationCard}>
                <View style={styles.medicationInfo}>
                  <View style={styles.pillIcon}>
                    <Icon name="medication" size={24} color="#8B5CF6" />
                  </View>
                  <View style={styles.medicationDetails}>
                    <Text style={styles.medicationName}>{medication.name}</Text>
                    <Text style={styles.medicationTime}>{medication.time}</Text>
                  </View>
                </View>
                
                <View style={styles.medicationActions}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(medication.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(medication.status)}</Text>
                  </View>
                  <TouchableOpacity style={styles.addButton}>
                    <Icon name="add" size={20} color="#8B5CF6" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Adherence History Section */}
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Past 7 Days Adherence</Text>
            <View style={styles.historyGrid}>
              {medicationHistory.map((day, index) => {
                const totalMeds = day.medications.length;
                const takenMeds = day.medications.filter(med => med.taken).length;
                const adherenceRate = totalMeds > 0 ? (takenMeds / totalMeds) * 100 : 100;
                const hasMissed = day.medications.some(med => !med.taken);
                
                return (
                  <View key={index} style={styles.historyDay}>
                    <Text style={styles.historyDate}>{day.date.getDate()}</Text>
                    <Text style={styles.historyDayName}>{getDayName(day.date)}</Text>
                    <View style={[
                      styles.adherenceIndicator,
                      { backgroundColor: hasMissed ? '#FF6B6B' : '#4ECDC4' }
                    ]}>
                      <Text style={styles.adherenceText}>{Math.round(adherenceRate)}%</Text>
                    </View>
                    {hasMissed && (
                      <View style={styles.missedIndicator}>
                        <Icon name="error" size={12} color="#FF6B6B" />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#060070',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  datePill: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 16,
    color: '#060070',
    fontWeight: '500',
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  dayPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 45,
  },
  todayPill: {
    backgroundColor: '#8B5CF6',
  },
  selectedPill: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#060070',
    marginBottom: 2,
  },
  dayName: {
    fontSize: 12,
    color: '#060070',
  },
  todayText: {
    color: 'white',
  },
  selectedText: {
    color: '#060070',
  },
  medicationsContainer: {
    marginBottom: 30,
  },
  medicationCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pillIcon: {
    marginRight: 15,
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#060070',
    marginBottom: 4,
  },
  medicationTime: {
    fontSize: 16,
    color: '#060070',
  },
  medicationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historySection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#060070',
    marginBottom: 16,
  },
  historyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDay: {
    alignItems: 'center',
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#060070',
    marginBottom: 4,
  },
  historyDayName: {
    fontSize: 12,
    color: '#060070',
    marginBottom: 8,
  },
  adherenceIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  adherenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  missedIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  bottomSpacing: {
    height: 40,
  },
}; 
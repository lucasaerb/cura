import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  TextInput,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';
import AIMenu from './AIMenu';
import ReportPage from './ReportPage';

const { width } = Dimensions.get('window');

// Sample medication data with enhanced structure
const initialMedications = [
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
    taken: true,
    nextIntake: '9 am, Dec 13',
    brandColor: '#2E5BFF',
    streak: 12,
    totalDoses: 21,
    missedDoses: 0,
    lastTaken: new Date().toISOString(),
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
];

export default function App() {
  const [medications, setMedications] = useState(initialMedications);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName] = useState('Linda');
  const [userStreak, setUserStreak] = useState(12);
  const [userPhoto] = useState('https://images.unsplash.com/photo-1494790108755-2616b612b1c3?w=150&h=150&fit=crop&crop=face');
  const [imageError, setImageError] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showReportPage, setShowReportPage] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    category: '',
    dueTime: '09:00',
    frequency: 'daily',
    instructions: ''
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const breathingAnim = useRef(new Animated.Value(1)).current;

  // Load data on app start
  useEffect(() => {
    loadMedications();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Start breathing animation
  useEffect(() => {
    const startBreathing = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathingAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    startBreathing();
  }, []);

  // Save and load medications from AsyncStorage
  const saveMedications = async (medsToSave) => {
    try {
      await AsyncStorage.setItem('medications', JSON.stringify(medsToSave));
    } catch (error) {
      console.error('Error saving medications:', error);
    }
  };

  const loadMedications = async () => {
    try {
      const savedMedications = await AsyncStorage.getItem('medications');
      if (savedMedications) {
        setMedications(JSON.parse(savedMedications));
      }
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  // Enhanced time calculations
  const getCurrentDateTime = () => {
    const now = new Date();
    const options = { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    };
    return now.toLocaleDateString('en-US', options);
  };

  const getTimeUntilDose = (dueTime) => {
    const now = new Date();
    const [hours, minutes] = dueTime.split(':').map(Number);
    const dueDate = new Date();
    dueDate.setHours(hours, minutes, 0, 0);

    if (dueDate <= now) {
      dueDate.setDate(dueDate.getDate() + 1);
    }

    const timeDiff = dueDate - now;
    const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntil === 0 && minutesUntil <= 30) {
      return minutesUntil <= 5 ? 'NOW' : `${minutesUntil}m`;
    } else if (hoursUntil === 0) {
      return `${minutesUntil}m`;
    } else if (hoursUntil <= 2) {
      return `${hoursUntil}h ${minutesUntil}m`;
    }
    return `${hoursUntil}h`;
  };

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'pm' : 'am';
    const hours12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Enhanced medication management
  const toggleMedicationStatus = (medicationId) => {
    const updatedMeds = medications.map(med => {
      if (med.id === medicationId) {
        if (med.taken) {
          // Unchecking - subtract from streak and total doses
          const newStreak = Math.max(0, med.streak - 1);
          const newTotalDoses = Math.max(0, med.totalDoses - 1);
          
          return { 
            ...med, 
            taken: false,
            lastTaken: null,
            streak: newStreak,
            totalDoses: newTotalDoses
          };
        } else {
          // Checking - add to streak and total doses
          const newStreak = med.streak + 1;
          const newTotalDoses = med.totalDoses + 1;
          
          return { 
            ...med, 
            taken: true,
            lastTaken: new Date().toISOString(),
            streak: newStreak,
            totalDoses: newTotalDoses
          };
        }
      }
      return med;
    });
    
    setMedications(updatedMeds);
    saveMedications(updatedMeds);
    
    const medication = medications.find(med => med.id === medicationId);
    
    if (!medication.taken) {
      // Was just marked as taken
      setUserStreak(prev => prev + 1);
      
      // Animate success
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();
      
      Alert.alert(
        "Great job! 💊",
        `Medication taken! Keep up the great work.`,
        [{ text: "Awesome!" }]
      );
    } else {
      // Was just unmarked
      setUserStreak(prev => Math.max(0, prev - 1));
      
      Alert.alert(
        "Medication Unmarked",
        `${medication.name} has been unmarked as not taken.`,
        [{ text: "OK" }]
      );
    }
  };

  const snoozeMedication = (medicationId) => {
    Alert.alert(
      "Snooze Reminder",
      "Remind me again in:",
      [
        { text: "15 minutes", onPress: () => scheduleSnooze(medicationId, 15) },
        { text: "30 minutes", onPress: () => scheduleSnooze(medicationId, 30) },
        { text: "1 hour", onPress: () => scheduleSnooze(medicationId, 60) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const scheduleSnooze = (medicationId, minutes) => {
    // In a real app, you'd schedule a local notification here
    Alert.alert("Reminder Set", `I'll remind you again in ${minutes} minutes!`);
  };

  const addNewMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      Alert.alert("Error", "Please fill in medication name and dosage");
      return;
    }

    const newMed = {
      ...newMedication,
      id: Date.now(),
      taken: false,
      nextIntake: null,
      brandColor: '#2E5BFF',
      streak: 0,
      totalDoses: 0,
      missedDoses: 0,
      lastTaken: null,
      refillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      prescribedBy: 'Dr. Unknown'
    };

    const updatedMeds = [...medications, newMed];
    setMedications(updatedMeds);
    saveMedications(updatedMeds);
    setShowAddModal(false);
    setNewMedication({
      name: '',
      dosage: '',
      category: '',
      dueTime: '09:00',
      frequency: 'daily',
      instructions: ''
    });

    Alert.alert("Success", "New medication added!");
  };

  const deleteMedication = (medicationId) => {
    Alert.alert(
      "Delete Medication",
      "Are you sure you want to remove this medication?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedMeds = medications.filter(med => med.id !== medicationId);
            setMedications(updatedMeds);
            saveMedications(updatedMeds);
          }
        }
      ]
    );
  };

  const getUpcomingMedications = () => {
    return medications
      .filter(med => !med.taken)
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime))
      .slice(0, 3);
  };

  const handleAvatarPress = () => {
    Alert.alert(
      "Profile Settings",
      "Choose an option:",
      [
        { text: "Change Photo", onPress: () => Alert.alert("Coming Soon", "Photo selection feature coming soon!") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const getUserInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isDueSoon = (dueTime) => {
    const timeUntil = getTimeUntilDose(dueTime);
    return timeUntil === 'NOW' || timeUntil.includes('m') && !timeUntil.includes('h');
  };

  // If AI menu is open, show AI menu instead of main app
  if (showAIMenu) {
    return <AIMenu onClose={() => setShowAIMenu(false)} />;
  }

  // If report page is open, show report page instead of main app
  if (showReportPage) {
    return <ReportPage onClose={() => setShowReportPage(false)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8E3FF" />
      
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
              {userPhoto && !imageError ? (
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <Image 
                    source={{ uri: userPhoto }}
                    style={styles.avatar}
                    onError={() => setImageError(true)}
                  />
                </Animated.View>
              ) : (
                <Animated.View style={[styles.avatarFallback, { transform: [{ scale: scaleAnim }] }]}>
                  <Text style={styles.avatarInitials}>{getUserInitials(userName)}</Text>
                </Animated.View>
              )}
              <View style={styles.avatarBorder} />
              <View style={styles.editIconContainer}>
                <Text style={styles.editIcon}>⚙️</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hello, {userName}</Text>
              <Text style={styles.dateTime}>{getCurrentDateTime()}</Text>
            </View>
          </View>
          <View style={styles.streakContainer}>
            <Text style={styles.streakLabel}>Streak</Text>
            <View style={styles.streakCircle}>
              <Text style={styles.streakNumber}>{userStreak}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{medications.filter(m => m.taken).length}</Text>
          <Text style={styles.statLabel}>Taken Today</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{medications.filter(m => !m.taken).length}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{medications.length}</Text>
          <Text style={styles.statLabel}>Total Meds</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Urgent Reminders */}
        {getUpcomingMedications().some(med => isDueSoon(med.dueTime)) && (
          <View style={styles.urgentSection}>
            <Text style={styles.urgentTitle}>🚨 Due Now</Text>
            {getUpcomingMedications()
              .filter(med => isDueSoon(med.dueTime))
              .map(medication => (
                <View key={medication.id} style={styles.urgentCard}>
                  <View style={styles.urgentContent}>
                    <Text style={styles.urgentMedName}>{medication.name}</Text>
                    <Text style={styles.urgentTime}>{getTimeUntilDose(medication.dueTime)}</Text>
                  </View>
                  <View style={styles.urgentActions}>
                    <TouchableOpacity 
                      style={styles.snoozeButton}
                      onPress={() => snoozeMedication(medication.id)}
                    >
                      <Text style={styles.snoozeText}>💤</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.urgentTakeButton}
                      onPress={() => toggleMedicationStatus(medication.id)}
                    >
                      <Text style={styles.urgentTakeText}>Take Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            }
          </View>
        )}

        {/* Your day section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your day:</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          
          {medications.map(medication => (
            <TouchableOpacity 
              key={medication.id} 
              style={styles.medicationCard}
              onLongPress={() => deleteMedication(medication.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.categoryText}>{medication.category}</Text>
                <TouchableOpacity 
                  style={styles.infoButton}
                  onPress={() => setSelectedMedication(medication)}
                >
                  <Text style={styles.infoIcon}>i</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.medicationContent}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  {medication.genericName && (
                    <Text style={styles.genericName}>{medication.genericName}</Text>
                  )}
                  <Text style={styles.dosageText}>{medication.dosage} • {medication.frequency}</Text>
                  
                  <View style={styles.timeline}>
                    <View style={styles.timelineContainer}>
                      <View style={[styles.timelineDot, { backgroundColor: medication.brandColor }]} />
                      <View style={styles.timelineContent}>
                        {medication.taken ? (
                          <>
                            <Text style={styles.statusText}>✅ Taken for today!</Text>
                            {medication.nextIntake && (
                              <>
                                <View style={[styles.timelineDot, styles.nextDot]} />
                                <Text style={styles.nextIntakeText}>Next: {medication.nextIntake}</Text>
                              </>
                            )}
                          </>
                        ) : (
                          <Text style={[styles.statusText, isDueSoon(medication.dueTime) && styles.urgentText]}>
                            Due at {formatTime(medication.dueTime)} • {getTimeUntilDose(medication.dueTime)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.statusButton, 
                    { backgroundColor: medication.taken ? '#E8F5E8' : '#F0F0F0' }
                  ]}
                  onPress={() => toggleMedicationStatus(medication.id)}
                >
                  <Text style={[
                    styles.checkmark, 
                    { color: medication.taken ? '#4CAF50' : '#999' }
                  ]}>
                    ✓
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* AI Assistant Button */}
      <TouchableOpacity 
        style={styles.aiButton}
        onPress={() => setShowAIMenu(true)}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.aiButtonInner, { transform: [{ scale: breathingAnim }] }]}>
          <View style={styles.aiButtonGradient}>
            <Text style={styles.aiButtonIcon}>🤖</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Report Button */}
      <TouchableOpacity 
        style={styles.reportButton}
        onPress={() => setShowReportPage(true)}
        activeOpacity={0.8}
      >
        <View style={styles.reportButtonInner}>
          <Text style={styles.reportButtonIcon}>📊</Text>
        </View>
      </TouchableOpacity>

      {/* Add Medication Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Medication</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Medication Name"
              value={newMedication.name}
              onChangeText={(text) => setNewMedication({...newMedication, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Dosage (e.g., 10mg)"
              value={newMedication.dosage}
              onChangeText={(text) => setNewMedication({...newMedication, dosage: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={newMedication.category}
              onChangeText={(text) => setNewMedication({...newMedication, category: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Instructions"
              value={newMedication.instructions}
              onChangeText={(text) => setNewMedication({...newMedication, instructions: text})}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={addNewMedication}
              >
                <Text style={styles.saveButtonText}>Add Medication</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Medication Details Modal */}
      {selectedMedication && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!selectedMedication}
          onRequestClose={() => setSelectedMedication(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.detailsModal}>
              <Text style={styles.detailsTitle}>{selectedMedication.name}</Text>
              <Text style={styles.detailsSubtitle}>{selectedMedication.genericName}</Text>
              
              <View style={styles.detailsContent}>
                <Text style={styles.detailItem}>💊 Dosage: {selectedMedication.dosage}</Text>
                <Text style={styles.detailItem}>⏰ Time: {formatTime(selectedMedication.dueTime)}</Text>
                <Text style={styles.detailItem}>📅 Frequency: {selectedMedication.frequency}</Text>
                <Text style={styles.detailItem}>📝 Instructions: {selectedMedication.instructions}</Text>
                <Text style={styles.detailItem}>🔥 Streak: {selectedMedication.streak} days</Text>
                <Text style={styles.detailItem}>👨‍⚕️ Prescribed by: {selectedMedication.prescribedBy}</Text>
                <Text style={styles.detailItem}>🔄 Refill due: {selectedMedication.refillDate}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedMedication(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

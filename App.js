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
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { styles } from './styles';
import AIMenu from './AIMenu';
import ReportPage from './ReportPage';
import CalendarPage from './CalendarPage';
import ProfilePage from './ProfilePage';
import CheckInPage from './CheckInPage';

const { width, height } = Dimensions.get('window');

// Check if we're running on native platform for useNativeDriver
const isNative = Platform.OS !== 'web';

// Import local profile picture
const profilePicture = require('./assets/pfp.jpg');

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
    taken: false,
    nextIntake: null,
    brandColor: '#2E5BFF',
    streak: 12,
    totalDoses: 21,
    missedDoses: 0,
    lastTaken: null,
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
  },
  {
    id: 4,
    name: 'Lisinopril',
    genericName: 'lisinopril',
    category: 'Blood Pressure',
    dosage: '10mg',
    dueTime: '08:00',
    frequency: 'daily',
    instructions: 'Take on empty stomach',
    taken: false,
    nextIntake: null,
    brandColor: '#2E5BFF',
    streak: 14,
    totalDoses: 30,
    missedDoses: 1,
    lastTaken: null,
    refillDate: '2024-12-30',
    prescribedBy: 'Dr. Wilson'
  },
  {
    id: 5,
    name: 'Atorvastatin',
    genericName: 'atorvastatin calcium',
    category: 'Cholesterol',
    dosage: '20mg',
    dueTime: '21:00',
    frequency: 'daily',
    instructions: 'Take in the evening',
    taken: false,
    nextIntake: null,
    brandColor: '#2E5BFF',
    streak: 9,
    totalDoses: 30,
    missedDoses: 0,
    lastTaken: null,
    refillDate: '2025-01-05',
    prescribedBy: 'Dr. Brown'
  }
];

export default function App() {
  const [medications, setMedications] = useState(initialMedications);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName] = useState('Linda');
  const [userStreak, setUserStreak] = useState(12);
  const [userPhoto] = useState(profilePicture);
  const [imageError, setImageError] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [isCheckIn, setIsCheckIn] = useState(false);
  const [showReportPage, setShowReportPage] = useState(false);
  const [showCalendarPage, setShowCalendarPage] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [showCheckInPage, setShowCheckInPage] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shouldFireConfetti, setShouldFireConfetti] = useState(false);
  const [hasShownTodaysCelebration, setHasShownTodaysCelebration] = useState(false);
  const medicationAnimations = useRef(new Map()).current;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const breathingAnim = useRef(new Animated.Value(1)).current;

  // Initialize animations for medications
  useEffect(() => {
    medications.forEach(med => {
      if (!medicationAnimations.has(med.id)) {
        medicationAnimations.set(med.id, {
          scale: new Animated.Value(med.taken ? 0.95 : 1),
          opacity: new Animated.Value(med.taken ? 0.6 : 1),
        });
      }
    });
  }, [medications]);

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
            useNativeDriver: isNative,
          }),
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: isNative,
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
      // TEMPORARY: Force reset to show all 5 medications
      await AsyncStorage.removeItem('medications');
      await AsyncStorage.removeItem('lastCelebrationDate'); // Also reset celebration status
      setMedications(initialMedications);
      setHasShownTodaysCelebration(false); // Reset celebration flag
      saveMedications(initialMedications);
      
      // Original code (commented out temporarily):
      // const savedMedications = await AsyncStorage.getItem('medications');
      // if (savedMedications) {
      //   setMedications(JSON.parse(savedMedications));
      // }
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

  // Check if a medication is overdue
  const isMedicationOverdue = (dueTime, taken) => {
    if (taken) return false;
    
    const now = new Date();
    const [hours, minutes] = dueTime.split(':').map(Number);
    const dueDate = new Date();
    dueDate.setHours(hours, minutes, 0, 0);
    
    return now > dueDate;
  };

  // Sort medications by priority: untaken first (overdue first, then by due time), then taken at bottom
  const getSortedMedications = () => {
    return [...medications].sort((a, b) => {
      // First priority: taken medications always go to the bottom
      if (a.taken && !b.taken) return 1;
      if (!a.taken && b.taken) return -1;
      
      // If both are taken or both are untaken, sort by overdue status and time
      if (a.taken === b.taken) {
        const aOverdue = isMedicationOverdue(a.dueTime, a.taken);
        const bOverdue = isMedicationOverdue(b.dueTime, b.taken);
        
        // If one is overdue and the other isn't, overdue comes first
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        
        // If both have same overdue status, sort by due time
        return a.dueTime.localeCompare(b.dueTime);
      }
      
      return 0;
    });
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
    const medication = medications.find(med => med.id === medicationId);
    const animations = medicationAnimations.get(medicationId);
    
    if (!animations) return;

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
    
    if (!medication.taken) {
      // Was just marked as taken - animate to minimized state
      setUserStreak(prev => prev + 1);
      
      Animated.parallel([
        Animated.timing(animations.scale, {
          toValue: 0.95,
          duration: 300,
          useNativeDriver: isNative,
        }),
        Animated.timing(animations.opacity, {
          toValue: 0.6,
          duration: 300,
          useNativeDriver: isNative,
        }),
        // Success scale animation
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: isNative }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: isNative })
        ])
      ]).start(() => {
        // Animation completed
      });
      
      // Alert.alert(
      //   "Great job! 💊",
      //   `Medication taken! Keep up the great work.`,
      //   [{ text: "Awesome!" }]
      // );
    } else {
      // Was just unmarked - animate back to normal state
      setUserStreak(prev => Math.max(0, prev - 1));
      
      Animated.parallel([
        Animated.timing(animations.scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: isNative,
        }),
        Animated.timing(animations.opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: isNative,
        })
      ]).start();
      
      // Alert.alert(
      //   "Medication Unmarked",
      //   `${medication.name} has been unmarked as not taken.`,
      //   [{ text: "OK" }]
      // );
    }
  };

  const getUpcomingMedications = () => {
    return medications
      .filter(med => !med.taken)
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime))
      .slice(0, 3);
  };

  const handleAvatarPress = () => {
    setShowProfilePage(true);
  };

  const getUserInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Check if all medications are completed for the day
  const checkAllMedicationsCompleted = () => {
    const allCompleted = medications.every(med => med.taken);
    const today = new Date().toDateString();
    
    console.log('Checking completion:', { allCompleted, hasShownTodaysCelebration, medicationsCount: medications.length });
    
    if (allCompleted && medications.length > 0 && !hasShownTodaysCelebration) {
      console.log('🎉 All medications completed! Showing celebration...');
      setShowCelebration(true);
      setShouldFireConfetti(true);
      setHasShownTodaysCelebration(true);
      
      // Save celebration date
      AsyncStorage.setItem('lastCelebrationDate', today).catch(error => {
        console.error('Error saving celebration date:', error);
      });
    }
  };

  // Check completion status whenever medications change
  useEffect(() => {
    checkAllMedicationsCompleted();
  }, [medications]);

  // Load celebration status on app start
  useEffect(() => {
    const loadCelebrationStatus = async () => {
      try {
        const today = new Date().toDateString();
        const lastCelebrationDate = await AsyncStorage.getItem('lastCelebrationDate');
        setHasShownTodaysCelebration(lastCelebrationDate === today);
      } catch (error) {
        console.error('Error loading celebration status:', error);
      }
    };
    loadCelebrationStatus();
  }, []);

  // If profile page is open, show profile page instead of main app
  if (showProfilePage) {
    return (
      <ProfilePage 
        onClose={() => setShowProfilePage(false)} 
        userName={userName}
        userPhoto={userPhoto}
        imageError={imageError}
      />
    );
  }

  // If AI menu is open, show AI menu instead of main app
  if (showAIMenu) {
    return <AIMenu onClose={() => {
      setShowAIMenu(false);
      setIsCheckIn(false);
    }} isCheckIn={isCheckIn} />;
  }

  // If report page is open, show report page instead of main app
  if (showReportPage) {
    return <ReportPage onClose={() => setShowReportPage(false)} />;
  }

  // If calendar page is open, show calendar page instead of main app
  if (showCalendarPage) {
    return <CalendarPage onClose={() => setShowCalendarPage(false)} />;
  }

  // If check-in page is open, show check-in page instead of main app
  if (showCheckInPage) {
    return <CheckInPage onClose={() => setShowCheckInPage(false)} userName={userName} />;
  }

  return (
    <SafeAreaProvider>
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
                      source={userPhoto}
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
                  <Icon name="person" size={12} color="white" />
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
        {/* <View style={styles.statsBar}>
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
        </View> */}

        {/* Daily Check-in Banner */}
        <TouchableOpacity 
          style={styles.checkInBanner}
          onPress={() => setShowCheckInPage(true)}
          activeOpacity={0.9}
        >
          <View style={styles.checkInContent}>
            <View style={styles.checkInIconContainer}>
              <Icon name="psychology" size={24} color="#2D1B69" />
            </View>
            <View style={styles.checkInTextContainer}>
              <Text style={styles.checkInTitle}>Daily Check-in</Text>
              <Text style={styles.checkInSubtitle}>Let's see how you're feeling today</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#2D1B69" />
          </View>
        </TouchableOpacity>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Your day section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your day:</Text>
            </View>
            
            {getSortedMedications().map(medication => {
              const animations = medicationAnimations.get(medication.id);
              const isOverdue = isMedicationOverdue(medication.dueTime, medication.taken);
              
              return (
                <Animated.View
                  key={medication.id}
                  style={[
                    styles.medicationCard,
                    animations && {
                      transform: [{ scale: animations.scale }],
                      opacity: animations.opacity,
                    }
                  ]}
                >
                  <TouchableOpacity 
                    style={medication.taken ? styles.medicationCardContentCompressed : styles.medicationCardContent}
                  >
                    <View style={medication.taken ? styles.cardHeaderCompressed : styles.cardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.categoryText}>
                          {medication.category}
                        </Text>
                        {isOverdue && (
                          <View style={styles.missedBadge}>
                            <Text style={styles.missedText}>Missed</Text>
                          </View>
                        )}
                      </View>
                      {!medication.taken && (
                        <TouchableOpacity 
                          style={styles.infoButton}
                          onPress={() => setSelectedMedication(medication)}
                        >
                          <Text style={styles.infoIcon}>i</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <View style={styles.medicationContent}>
                      {medication.taken ? (
                        // Simplified view for taken medications
                        <View style={styles.medicationInfoCompressed}>
                          <Text style={styles.medicationNameCompressed}>
                            {medication.name} - taken for today
                          </Text>
                        </View>
                      ) : (
                        // Full view for active medications
                        <View style={styles.medicationInfo}>
                          <Text style={styles.medicationName}>
                            {medication.name}
                          </Text>
                          {medication.genericName && (
                            <Text style={styles.genericName}>{medication.genericName}</Text>
                          )}
                          <Text style={styles.dosageText}>{medication.dosage} • {medication.frequency}</Text>
                          
                          <View style={styles.timeline}>
                            <View style={styles.timelineContainer}>
                              <View style={[styles.timelineDot, { backgroundColor: medication.brandColor }]} />
                              <View style={styles.timelineContent}>
                                <Text style={styles.statusText}>
                                  {isOverdue ? 
                                    `Was due at ${formatTime(medication.dueTime)}` :
                                    `Due at ${formatTime(medication.dueTime)} • ${getTimeUntilDose(medication.dueTime)}`
                                  }
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      )}
                      
                      <TouchableOpacity 
                        style={[
                          medication.taken ? styles.statusButtonCompressed : styles.statusButton, 
                          { backgroundColor: medication.taken ? '#E8F5E8' : '#E8E3FF' }
                        ]}
                        onPress={() => toggleMedicationStatus(medication.id)}
                      >
                        <Text style={[
                          styles.checkmark, 
                          { color: medication.taken ? '#4CAF50' : '#8B5CF6' }
                        ]}>
                          ✓
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomButtonsContainer}>
          {/* Calendar Button - Left */}
          <TouchableOpacity 
            style={styles.sideButtonLeft}
            onPress={() => setShowCalendarPage(true)}
            activeOpacity={0.9}
          >
            <View style={styles.sideButtonInner}>
              <View style={styles.sideButtonIconContainer}>
                <Icon name="calendar-today" size={24} color="#E8E3FF" />
              </View>
              <Text style={styles.buttonLabel}>History</Text>
            </View>
          </TouchableOpacity>

          {/* AI Assistant Button - Center */}
          <TouchableOpacity 
            style={styles.aiButton}
            onPress={() => {
              setIsCheckIn(false);
              setShowAIMenu(true);
            }}
            activeOpacity={0.9}
          >
            <Animated.View style={[styles.aiButtonInner, { transform: [{ scale: breathingAnim }] }]}>
              <View style={styles.aiButtonGradient}>
                <View style={styles.aiIconContainer}>
                  <Icon name="assistant" size={32} color="white" />
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Report Button - Right */}
          <TouchableOpacity 
            style={styles.sideButton}
            onPress={() => setShowReportPage(true)}
            activeOpacity={0.9}
          >
            <View style={styles.sideButtonInner}>
              <View style={styles.sideButtonIconContainer}>
                <Icon name="assessment" size={24} color="#E8E3FF" />
              </View>
              <Text style={styles.buttonLabel}>Report</Text>
            </View>
          </TouchableOpacity>
        </View>

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

        {/* Celebration Modal with Confetti */}
        {showCelebration && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={showCelebration}
            onRequestClose={() => {
              setShowCelebration(false);
              setShouldFireConfetti(false);
            }}
          >
            <View style={styles.celebrationOverlay}>
              <View style={styles.celebrationModal}>
                <Animated.View style={[styles.celebrationContent, { transform: [{ scale: scaleAnim }] }]}>
                  <View style={styles.celebrationIcon}>
                    <Icon name="celebration" size={64} color="#FFD700" />
                  </View>
                  <Text style={styles.celebrationTitle}>🎉 Congratulations, {userName}! 🎉</Text>
                  <Text style={styles.celebrationSubtitle}>
                    You've completed all your medications for today!
                  </Text>
                  <Text style={styles.celebrationMessage}>
                    Keep up the amazing work! Your health journey is inspiring. 💪
                  </Text>
                  <View style={styles.celebrationStats}>
                    <View style={styles.statBadge}>
                      <Icon name="local-fire-department" size={20} color="#FF6B35" />
                      <Text style={styles.statText}>{userStreak} day streak!</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Icon name="check-circle" size={20} color="#4CAF50" />
                      <Text style={styles.statText}>100% complete</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.celebrationButton}
                    onPress={() => {
                      setShowCelebration(false);
                      setShouldFireConfetti(false);
                    }}
                  >
                    <Text style={styles.celebrationButtonText}>Awesome! 🚀</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
              
              {/* Confetti positioned absolutely on top */}
              {shouldFireConfetti && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1000,
                  pointerEvents: 'none'
                }}>
                  <ConfettiCannon
                    count={200}
                    origin={{x: width/2, y: height * 0.1}}
                    fadeOut={true}
                    explosionSpeed={350}
                    fallSpeed={3000}
                    colors={['#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#DDA0DD', '#F0E68C', '#FF6B35', '#4CAF50']}
                    onAnimationEnd={() => {
                      console.log('🎊 Confetti animation ended');
                      setShouldFireConfetti(false);
                    }}
                  />
                </View>
              )}
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const SIDE_EFFECTS = [
  'Nausea', 'Headache', 'Dizziness', 'Fatigue', 'Anxiety', 'Insomnia',
  'Drowsiness', 'Dry Mouth', 'Loss of Appetite', 'Stomach Pain',
  'Constipation', 'Diarrhea', 'Rash', 'Sweating', 'Tremors',
  'Blurred Vision', 'Muscle Pain', 'Joint Pain', 'Chest Pain',
  'Shortness of Breath'
];

const MOODS = [
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😡', label: 'Angry', value: 'angry' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '😴', label: 'Tired', value: 'tired' }
];

const MoodButton = ({ emoji, label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.moodButton, selected && styles.moodButtonSelected]}
    onPress={onPress}
  >
    <Text style={styles.moodEmoji}>{emoji}</Text>
    <Text style={[styles.moodLabel, selected && styles.moodLabelSelected]}>{label}</Text>
  </TouchableOpacity>
);

const SideEffectBadge = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.sideEffectBadge, selected && styles.sideEffectBadgeSelected]}
    onPress={onPress}
  >
    <Text style={[styles.sideEffectText, selected && styles.sideEffectTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function CheckInPage({ onClose, userName = 'Linda' }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [sideEffects, setSideEffects] = useState([]);
  const [medicationWorking, setMedicationWorking] = useState(null);
  const [sleepQuality, setSleepQuality] = useState(null);
  const [appetite, setAppetite] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(null);
  const [painLevel, setPainLevel] = useState(null);
  const [notes, setNotes] = useState('');
  const [journalText, setJournalText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showJournal, setShowJournal] = useState(false);

  const toggleSideEffect = (effect) => {
    if (sideEffects.includes(effect)) {
      setSideEffects(sideEffects.filter(e => e !== effect));
    } else {
      setSideEffects([...sideEffects, effect]);
    }
  };

  const handleSelection = (value, type) => {
    switch (type) {
      case 'mood':
        setMood(value);
        break;
      case 'sleep':
        setSleepQuality(value);
        break;
      case 'appetite':
        setAppetite(value);
        break;
      case 'energy':
        setEnergyLevel(value);
        break;
      case 'medication':
        setMedicationWorking(value);
        break;
    }
    
    // Auto-proceed to next step for single-option questions
    if (type !== 'sideEffects') {
      setTimeout(() => {
        if (currentStep < 5) {
          setCurrentStep(currentStep + 1);
        } else if (currentStep === 5) {
          setShowJournal(true);
        }
      }, 400); // Small delay for better UX
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 5) {
      setShowJournal(true);
    }
  };

  const handleJournalSubmit = () => {
    // Submit the check-in with journal
    console.log({
      mood,
      sideEffects,
      medicationWorking,
      sleepQuality,
      appetite,
      energyLevel,
      painLevel,
      journalText
    });
    setShowJournal(false);
    setCurrentStep(6); // Show thank you page
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording functionality
    // For now, we'll just toggle the state
  };

  const renderStep = () => {
    if (showJournal) {
      return (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.journalContainer}
        >
          <Text style={styles.question}>Would you like to journal any thoughts?</Text>
          <View style={styles.journalInputContainer}>
            <TextInput
              style={styles.journalInput}
              placeholder="Type your thoughts here..."
              placeholderTextColor="#6B4EFF"
              multiline
              value={journalText}
              onChangeText={setJournalText}
            />
            <TouchableOpacity
              style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
              onPress={toggleRecording}
            >
              <Icon 
                name={isRecording ? "stop" : "mic"} 
                size={24} 
                color={isRecording ? '#FFFFFF' : '#2D1B69'} 
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleJournalSubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>How are you feeling today?</Text>
            <View style={styles.moodContainer}>
              {MOODS.map((moodOption) => (
                <MoodButton
                  key={moodOption.value}
                  emoji={moodOption.emoji}
                  label={moodOption.label}
                  selected={mood === moodOption.value}
                  onPress={() => handleSelection(moodOption.value, 'mood')}
                />
              ))}
            </View>
            <TouchableOpacity style={[styles.voiceModeButton, { marginTop: 150 }]} onPress={() => {}}>
              <Icon name="keyboard-voice" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.voiceModeButtonText}>Switch to Voice Mode ✨ </Text>
            </TouchableOpacity>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>How well did you sleep last night?</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[styles.ratingButton, sleepQuality === rating && styles.ratingButtonSelected]}
                  onPress={() => handleSelection(rating, 'sleep')}
                >
                  <Icon 
                    name="bedtime" 
                    size={24} 
                    color={sleepQuality === rating ? '#FFFFFF' : '#2D1B69'} 
                  />
                  <Text style={[styles.ratingText, sleepQuality === rating && styles.ratingTextSelected]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>1 = Poor, 5 = Excellent</Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>How is your appetite today?</Text>
            <View style={styles.appetiteContainer}>
              <TouchableOpacity
                style={[styles.appetiteButton, appetite === 'decreased' && styles.appetiteButtonSelected]}
                onPress={() => handleSelection('decreased', 'appetite')}
              >
                <Icon name="remove" size={32} color={appetite === 'decreased' ? '#FFFFFF' : '#2D1B69'} />
                <Text style={[styles.appetiteButtonText, appetite === 'decreased' && styles.appetiteButtonTextSelected]}>
                  Decreased
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.appetiteButton, appetite === 'normal' && styles.appetiteButtonSelected]}
                onPress={() => handleSelection('normal', 'appetite')}
              >
                <Icon name="check" size={32} color={appetite === 'normal' ? '#FFFFFF' : '#2D1B69'} />
                <Text style={[styles.appetiteButtonText, appetite === 'normal' && styles.appetiteButtonTextSelected]}>
                  Normal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.appetiteButton, appetite === 'increased' && styles.appetiteButtonSelected]}
                onPress={() => handleSelection('increased', 'appetite')}
              >
                <Icon name="add" size={32} color={appetite === 'increased' ? '#FFFFFF' : '#2D1B69'} />
                <Text style={[styles.appetiteButtonText, appetite === 'increased' && styles.appetiteButtonTextSelected]}>
                  Increased
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>What's your energy level today?</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[styles.ratingButton, energyLevel === rating && styles.ratingButtonSelected]}
                  onPress={() => handleSelection(rating, 'energy')}
                >
                  <Icon 
                    name="bolt" 
                    size={24} 
                    color={energyLevel === rating ? '#FFFFFF' : '#2D1B69'} 
                  />
                  <Text style={[styles.ratingText, energyLevel === rating && styles.ratingTextSelected]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>1 = Very Low, 5 = Very High</Text>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Are you experiencing any side effects?</Text>
            <View style={styles.sideEffectsContainer}>
              {SIDE_EFFECTS.map((effect) => (
                <SideEffectBadge
                  key={effect}
                  label={effect}
                  selected={sideEffects.includes(effect)}
                  onPress={() => toggleSideEffect(effect)}
                />
              ))}
            </View>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>Is your medication working as expected?</Text>
            <View style={styles.medicationContainer}>
              <TouchableOpacity
                style={[styles.medicationButton, medicationWorking === true && styles.medicationButtonSelected]}
                onPress={() => handleSelection(true, 'medication')}
              >
                <Icon name="thumb-up" size={32} color={medicationWorking === true ? '#FFFFFF' : '#2D1B69'} />
                <Text style={[styles.medicationButtonText, medicationWorking === true && styles.medicationButtonTextSelected]}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.medicationButton, medicationWorking === false && styles.medicationButtonSelected]}
                onPress={() => handleSelection(false, 'medication')}
              >
                <Icon name="thumb-down" size={32} color={medicationWorking === false ? '#FFFFFF' : '#2D1B69'} />
                <Text style={[styles.medicationButtonText, medicationWorking === false && styles.medicationButtonTextSelected]}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 6:
        return (
          <View style={styles.thankYouContainer}>
            <Icon name="check-circle" size={80} color="#2D1B69" />
            <Text style={styles.thankYouTitle}>Thank You, {userName}!</Text>
            <Text style={styles.thankYouText}>
              Your check-in has been recorded.
            </Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2D1B69" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Check-in</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        {!showJournal && currentStep < 6 && (
          <View style={styles.progressContainer}>
            {[0, 1, 2, 3, 4, 5].map((step) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  step === currentStep && styles.progressDotActive,
                  step < currentStep && styles.progressDotCompleted
                ]}
              />
            ))}
          </View>
        )}

        {/* Content */}
        <ScrollView style={styles.content}>
          {renderStep()}
        </ScrollView>

        {/* Footer - Only show for side effects step */}
        {currentStep === 4 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
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
    color: 'white',
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: 'white',
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: '#6B4EFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#E8E3FF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  stepContainer: {
    padding: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 24,
    textAlign: 'center',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
    paddingHorizontal: 20,
  },
  moodButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    width: (width - 100) / 2, // 2 buttons per row
    shadowColor: '#2D1B69',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodButtonSelected: {
    backgroundColor: '#2D1B69',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 16,
    color: '#2D1B69',
    fontWeight: '500',
  },
  moodLabelSelected: {
    color: 'white',
  },
  sideEffectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  sideEffectBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sideEffectBadgeSelected: {
    backgroundColor: '#2D1B69',
    borderColor: '#2D1B69',
  },
  sideEffectText: {
    fontSize: 14,
    color: '#2D1B69',
    fontWeight: '500',
  },
  sideEffectTextSelected: {
    color: 'white',
  },
  medicationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  medicationButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'white',
    width: (width - 80) / 2,
    shadowColor: '#2D1B69',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationButtonSelected: {
    backgroundColor: '#2D1B69',
  },
  medicationButtonText: {
    fontSize: 16,
    color: '#2D1B69',
    fontWeight: '500',
    marginTop: 8,
  },
  medicationButtonTextSelected: {
    color: 'white',
  },
  footer: {
    padding: 20,
    backgroundColor: '#E8E3FF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(45, 27, 105, 0.1)',
  },
  nextButton: {
    backgroundColor: '#2D1B69',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  ratingButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    width: (width - 100) / 5,
    shadowColor: '#2D1B69',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingButtonSelected: {
    backgroundColor: '#2D1B69',
  },
  ratingText: {
    fontSize: 16,
    color: '#2D1B69',
    fontWeight: '500',
    marginTop: 8,
  },
  ratingTextSelected: {
    color: 'white',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6B4EFF',
    textAlign: 'center',
    marginTop: 8,
  },
  thankYouContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  thankYouTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D1B69',
    marginTop: 24,
    marginBottom: 16,
  },
  thankYouText: {
    fontSize: 16,
    color: '#6B4EFF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  doneButton: {
    backgroundColor: '#2D1B69',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  appetiteContainer: {
    gap: 16,
    paddingHorizontal: 20,
  },
  appetiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#2D1B69',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appetiteButtonSelected: {
    backgroundColor: '#2D1B69',
  },
  appetiteButtonText: {
    fontSize: 18,
    color: '#2D1B69',
    fontWeight: '500',
    marginLeft: 16,
  },
  appetiteButtonTextSelected: {
    color: 'white',
  },
  journalContainer: {
    flex: 1,
    padding: 20,
  },
  journalInputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  journalInput: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    paddingRight: 60,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#2D1B69',
    shadowColor: '#2D1B69',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2D1B69',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceButtonRecording: {
    backgroundColor: '#2D1B69',
  },
  submitButton: {
    backgroundColor: '#2D1B69',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  voiceModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A18AFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 18,
    alignSelf: 'center',
    shadowColor: '#2D1B69',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  voiceModeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 
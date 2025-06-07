import React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Import the same profile picture used in the main app
const profilePicture = require('./assets/pfp.jpg');

// Import medication logos and device images
const lexaproLogo = require('./assets/Lexapro.png');
const opillLogo = require('./assets/opill.png');
const watchImage = require('./assets/watch.jpg');
const ouraImage = require('./assets/oura.png');

export default function ProfilePage({ onClose, userName, userPhoto, imageError }) {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#E8E3FF" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#2D1B69" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Profile Photo */}
          <View style={styles.profileSection}>
            {userPhoto && !imageError ? (
              <Image 
                source={userPhoto}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImageFallback}>
                <Text style={styles.profileInitials}>L</Text>
              </View>
            )}
          </View>

          {/* Basic Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>MRN:</Text>
              <Text style={styles.infoValue}>123489</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>My plan:</Text>
              <Text style={styles.infoValue}>Blue Cross Blue Shield</Text>
            </View>
          </View>

          {/* Prescriptions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prescriptions</Text>
            <View style={styles.prescriptionsGrid}>
              <View style={styles.prescriptionItem}>
                <Image source={lexaproLogo} style={styles.medicationLogo} />
                <Text style={styles.prescriptionGeneric}>escitalopram</Text>
                <Text style={styles.prescriptionCategory}>Antidepressant</Text>
              </View>
              <View style={styles.prescriptionItem}>
                <Image source={opillLogo} style={styles.medicationLogoOpill} />
                <Text style={styles.prescriptionCategory}>Birth control</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.expandButton}>
              <Icon name="expand-more" size={24} color="#2D1B69" />
            </TouchableOpacity>
          </View>

          {/* Connected Devices Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Connected Devices</Text>
              <TouchableOpacity style={styles.editButton}>
                <Icon name="edit" size={20} color="#2D1B69" />
              </TouchableOpacity>
            </View>
            <View style={styles.devicesGrid}>
              <View style={styles.deviceItem}>
                <Image source={watchImage} style={styles.deviceImageWatch} />
                <Text style={styles.deviceName}>Apple watch series 3</Text>
              </View>
              <View style={styles.deviceItem}>
                <Image source={ouraImage} style={styles.ringIcon} />
                <Text style={styles.deviceNameItalic}>Oura ring</Text>
              </View>
            </View>
          </View>

          {/* Upcoming Appointments Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <View style={styles.appointmentsContainer}>
              
              {/* Physical Appointment */}
              <View style={styles.appointmentItem}>
                <View style={styles.timelineDot} />
                <View style={styles.doctorImageContainer}>
                  <View style={styles.doctorImage}>
                    <Icon name="person" size={24} color="#2D1B69" />
                  </View>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentType}>Physical</Text>
                  <Text style={styles.appointmentTime}>April 15, 2 PM</Text>
                </View>
              </View>

              {/* Timeline Line */}
              <View style={styles.timelineLine} />

              {/* Neurological Appointment */}
              <View style={styles.appointmentItem}>
                <View style={styles.timelineDot} />
                <View style={styles.doctorImageContainer}>
                  <View style={styles.doctorImage}>
                    <Icon name="person" size={24} color="#2D1B69" />
                  </View>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentType}>Neurological</Text>
                  <Text style={styles.appointmentTime}>June 12, 4:30 PM</Text>
                </View>
              </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D1B69',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  profileImageFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  profileInitials: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1B69',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#2D1B69',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1B69',
    marginBottom: 16,
  },
  editButton: {
    padding: 4,
  },
  prescriptionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  prescriptionItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  medicationLogo: {
    width: 80,
    height: 40,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  medicationLogoOpill: {
    width: 80,
    height: 40,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  prescriptionGeneric: {
    fontSize: 14,
    color: '#6B4E8D',
    marginBottom: 4,
  },
  prescriptionCategory: {
    fontSize: 16,
    color: '#2D1B69',
  },
  expandButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  devicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  deviceItem: {
    alignItems: 'center',
    flex: 1,
  },
  deviceImageWatch: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 12,
  },
  deviceImageRing: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ringIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  deviceName: {
    fontSize: 16,
    color: '#2D1B69',
    textAlign: 'center',
  },
  deviceNameItalic: {
    fontSize: 16,
    color: '#2D1B69',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  appointmentsContainer: {
    position: 'relative',
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2D1B69',
    marginRight: 16,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 32,
    bottom: 32,
    width: 2,
    backgroundColor: '#2D1B69',
    zIndex: 1,
  },
  doctorImageContainer: {
    marginRight: 16,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1B69',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 16,
    color: '#2D1B69',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 40,
  },
}; 
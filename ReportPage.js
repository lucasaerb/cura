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

export default function ReportPage({ onClose }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const timePeriods = [
    { id: 'week', label: 'week' },
    { id: 'month', label: 'month' },
    { id: '2month', label: '2 month' }
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#E8E3FF" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Icon name="description" size={32} color="#2D1B69" style={styles.reportIcon} />
              <Text style={styles.title}>My report</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#2D1B69" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Time Period Selector */}
          <View style={styles.periodSection}>
            <Text style={styles.viewLabel}>view:</Text>
            <View style={styles.periodTabs}>
              {timePeriods.map(period => (
                <TouchableOpacity
                  key={period.id}
                  style={[
                    styles.periodTab,
                    selectedPeriod === period.id && styles.selectedTab
                  ]}
                  onPress={() => setSelectedPeriod(period.id)}
                >
                  <Text style={[
                    styles.periodTabText,
                    selectedPeriod === period.id && styles.selectedTabText
                  ]}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Key Insights Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Insights</Text>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>•</Text>
              <Text style={styles.insightText}>
                <Text style={styles.medicationName}>Lexapro</Text> initiated Nov 15. Mild early side effects (fatigue, nausea) resolved by week 2. Marked mood improvement by week 3.
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>•</Text>
              <Text style={styles.insightText}>
                <Text style={styles.medicationName}>Opill adherence:</Text> 28/30 days. Two missed doses with no reported symptoms or concerns.
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>•</Text>
              <Text style={styles.insightText}>
                Check-ins indicate <Text style={styles.improvedText}>improved mood, sleep, and energy</Text> over time.
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>•</Text>
              <Text style={styles.insightText}>
                <Text style={styles.noTrendsText}>No urgent trends;</Text> vitals stable.
              </Text>
            </View>
          </View>

          {/* Medication Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medication Details</Text>
            
            <View style={styles.medicationCard}>
              <Text style={styles.medicationHeader}>Lexapro (escitalopram)</Text>
              <View style={styles.medicationItem}>
                <Text style={styles.medicationBullet}>•</Text>
                <Text style={styles.medicationText}>
                  10mg daily (AM) | Start: May 15 | Adherence: <Icon name="check-circle" size={16} color="#4CAF50" /> <Text style={styles.adherenceText}>100%</Text>
                </Text>
              </View>
              <View style={styles.medicationItem}>
                <Text style={styles.medicationBullet}>•</Text>
                <Text style={styles.medicationText}>
                  Patient trend: mood stabilized, sleep improved, no ongoing side effects
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.expandButton}>
              <Icon name="expand-more" size={24} color="#2D1B69" />
            </TouchableOpacity>
          </View>

          {/* Symptoms Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symptoms - Self report</Text>
            <View style={styles.symptomItem}>
              <Text style={styles.symptomBullet}>•</Text>
              <Text style={styles.symptomText}>
                <Text style={styles.symptomLabel}>Mood swings:</Text> High in week 1 → Low by week 4
              </Text>
            </View>
            <View style={styles.symptomItem}>
              <Text style={styles.symptomBullet}>•</Text>
              <Text style={styles.symptomText}>
                <Text style={styles.symptomLabel}>Anxiety:</Text> Persistent in weeks 1–2 → Reduced by week 4
              </Text>
            </View>
            <View style={styles.symptomItem}>
              <Text style={styles.symptomBullet}>•</Text>
              <Text style={styles.symptomText}>
                <Text style={styles.symptomLabel}>Sleep quality:</Text> Poor at start → Good by weeks 3–4
              </Text>
            </View>

            <TouchableOpacity style={styles.expandButton}>
              <Icon name="expand-more" size={24} color="#2D1B69" />
            </TouchableOpacity>
          </View>

          {/* Recommendations Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations for Review</Text>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>
                <Text style={styles.recommendationLabel}>Maintain Lexapro dosage</Text> – patient response is positive, side effects resolved
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>
                <Text style={styles.recommendationLabel}>Support Opill adherence</Text> – assess for pattern in missed days; may benefit from reminder system
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={styles.recommendationText}>
                Monitor mental health trends into next cycle; if mood stabilizes further, revisit long-term plan
              </Text>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#E8E3FF',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportIcon: {
    marginRight: 12,
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
  periodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewLabel: {
    fontSize: 16,
    color: '#2D1B69',
    marginRight: 12,
    fontWeight: '500',
  },
  periodTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  periodTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  selectedTab: {
    backgroundColor: '#A5B4FC',
  },
  periodTabText: {
    fontSize: 16,
    color: '#2D1B69',
    fontWeight: '500',
  },
  selectedTabText: {
    color: '#2D1B69',
    fontWeight: '600',
    fontStyle: 'italic',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1B69',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  insightBullet: {
    fontSize: 16,
    color: '#2D1B69',
    marginRight: 8,
    marginTop: 2,
  },
  insightText: {
    fontSize: 16,
    color: '#2D1B69',
    lineHeight: 22,
    flex: 1,
  },
  medicationName: {
    fontWeight: 'bold',
    color: '#2D1B69',
  },
  improvedText: {
    fontWeight: 'bold',
    color: '#2D1B69',
  },
  noTrendsText: {
    fontWeight: 'bold',
    color: '#2D1B69',
  },
  medicationCard: {
    marginBottom: 12,
  },
  medicationHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D1B69',
    marginBottom: 8,
  },
  medicationItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  medicationBullet: {
    fontSize: 16,
    color: '#2D1B69',
    marginRight: 8,
    marginTop: 2,
  },
  medicationText: {
    fontSize: 16,
    color: '#2D1B69',
    lineHeight: 22,
    flex: 1,
  },
  adherenceText: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  expandButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  symptomItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  symptomBullet: {
    fontSize: 16,
    color: '#2D1B69',
    marginRight: 8,
    marginTop: 2,
  },
  symptomText: {
    fontSize: 16,
    color: '#2D1B69',
    lineHeight: 22,
    flex: 1,
  },
  symptomLabel: {
    fontWeight: 'bold',
    color: '#2D1B69',
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#2D1B69',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 16,
    color: '#2D1B69',
    lineHeight: 22,
    flex: 1,
  },
  recommendationLabel: {
    fontWeight: 'bold',
    color: '#2D1B69',
  },
  bottomSpacing: {
    height: 40,
  },
}; 
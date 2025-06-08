import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LineChart, BarChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');

// Sample data for charts
const moodData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      data: [2, 5, 3, 6],
      color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`, // Yellow
      strokeWidth: 2
    }
  ]
};

const sleepData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      data: [2, 3, 4, 5],
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green
      strokeWidth: 2
    }
  ]
};

const sideEffectsData = {
  labels: ['Nausea', 'Headache', 'Dizziness', 'Fatigue', 'Anxiety'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99],
      colors: [
        (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green for low
        (opacity = 1) => `rgba(255, 193, 7, ${opacity})`, // Yellow for medium
        (opacity = 1) => `rgba(255, 193, 7, ${opacity})`, // Yellow for medium
        (opacity = 1) => `rgba(244, 67, 54, ${opacity})`, // Red for high
        (opacity = 1) => `rgba(244, 67, 54, ${opacity})`, // Red for very high
      ]
    }
  ]
};

const adherenceData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [100, 100, 90, 100, 100, 80, 100],
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green
    }
  ]
};

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(45, 27, 105, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  propsForLabels: {
    fontSize: 12,
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: 'rgba(45, 27, 105, 0.1)',
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#4CAF50'
  },
  fillShadowGradient: '#FFC107',
  fillShadowGradientOpacity: 0.2,
};

const TabButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.tabButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default function ReportPage({ onClose }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const timePeriods = [
    { id: 'week', label: 'Last 7 days' },
    { id: 'month', label: 'Last 30 days' },
    { id: '2month', label: 'Last 60 days' }
  ];

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    setShowSettings(false);
  };

  const toggleSettings = () => {
    if (showSettings) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowSettings(false));
    } else {
      setShowSettings(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderAnalytics = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Mood Tracking Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood Tracking</Text>
        <Text style={styles.chartSubtitle}>Self-reported mood scores (1-7 scale)</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={moodData}
            width={width - 60}
            height={200}
            chartConfig={{
              ...chartConfig,
              fillShadowGradient: '#FFC107',
            }}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withDots={false}
            withShadow={true}
            segments={6}
          />
        </View>
      </View>

      {/* Sleep Quality Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sleep Quality</Text>
        <Text style={styles.chartSubtitle}>Sleep quality scores (1-7 scale)</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={sleepData}
            width={width - 60}
            height={200}
            chartConfig={{
              ...chartConfig,
              fillShadowGradient: '#4CAF50',
            }}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withDots={false}
            withShadow={true}
            segments={6}
          />
        </View>
      </View>

      {/* Side Effects Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Side Effects Frequency</Text>
        <Text style={styles.chartSubtitle}>Percentage of days reported</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={sideEffectsData}
            width={width - 60}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            fromZero={true}
            segments={5}
            getBarColor={(data, dataIndex) => {
              const value = data[dataIndex];
              if (value < 30) return '#4CAF50'; // Green for low
              if (value < 60) return '#FFC107'; // Yellow for medium
              return '#F44336'; // Red for high
            }}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderInsights = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
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
    </ScrollView>
  );

  const renderAdherence = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medication Adherence</Text>
        <Text style={styles.chartSubtitle}>Weekly adherence rate (%)</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={adherenceData}
            width={width - 60}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            fromZero={true}
            segments={5}
          />
        </View>
      </View>

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
      </View>
    </ScrollView>
  );

  const renderRecommendations = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
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
    </ScrollView>
  );

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
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={toggleSettings}
              >
                <Icon name="settings" size={24} color="#2D1B69" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#2D1B69" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Settings Modal */}
        {showSettings && (
          <Animated.View 
            style={[
              styles.settingsOverlay,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity 
              style={styles.settingsBackdrop}
              activeOpacity={1}
              onPress={toggleSettings}
            />
            <Animated.View 
              style={[
                styles.settingsContent,
                {
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }
              ]}
            >
              <View style={styles.settingsHeader}>
                <Text style={styles.settingsTitle}>Time Period</Text>
                <TouchableOpacity onPress={toggleSettings}>
                  <Icon name="close" size={24} color="#2D1B69" />
                </TouchableOpacity>
              </View>
              <View style={styles.periodOptions}>
                {timePeriods.map(period => (
                  <TouchableOpacity
                    key={period.id}
                    style={[
                      styles.periodOption,
                      selectedPeriod === period.id && styles.periodOptionSelected
                    ]}
                    onPress={() => handlePeriodSelect(period.id)}
                  >
                    <Text style={[
                      styles.periodOptionText,
                      selectedPeriod === period.id && styles.periodOptionTextSelected
                    ]}>
                      {period.label}
                    </Text>
                    {selectedPeriod === period.id && (
                      <Icon name="check" size={24} color="#2D1B69" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </Animated.View>
        )}

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TabButton 
            title="Analytics" 
            isActive={activeTab === 'analytics'} 
            onPress={() => setActiveTab('analytics')} 
          />
          <TabButton 
            title="Insights" 
            isActive={activeTab === 'insights'} 
            onPress={() => setActiveTab('insights')} 
          />
          <TabButton 
            title="Adherence" 
            isActive={activeTab === 'adherence'} 
            onPress={() => setActiveTab('adherence')} 
          />
          <TabButton 
            title="Review" 
            isActive={activeTab === 'recommendations'} 
            onPress={() => setActiveTab('recommendations')} 
          />
        </View>

        {/* Tab Content */}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'insights' && renderInsights()}
        {activeTab === 'adherence' && renderAdherence()}
        {activeTab === 'recommendations' && renderRecommendations()}
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
    color: '#060070',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  viewLabel: {
    fontSize: 16,
    color: '#060070',
    marginRight: 12,
    fontWeight: '500',
  },
  dropdownTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  dropdownTextButtonText: {
    fontSize: 20,
    color: '#060070',
    fontStyle: 'italic',
    fontWeight: '400',
    marginRight: 2,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E3FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#060070',
  },
  selectedDropdownItemText: {
    fontWeight: 'bold',
    color: '#060070',
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
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#060070',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  insightBullet: {
    fontSize: 16,
    color: '#060070',
    marginRight: 8,
    marginTop: 2,
  },
  insightText: {
    fontSize: 16,
    color: '#060070',
    lineHeight: 22,
    flex: 1,
  },
  medicationName: {
    fontWeight: 'bold',
    color: '#060070',
  },
  improvedText: {
    fontWeight: 'bold',
    color: '#060070',
  },
  noTrendsText: {
    fontWeight: 'bold',
    color: '#060070',
  },
  medicationCard: {
    marginBottom: 12,
  },
  medicationHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#060070',
    marginBottom: 8,
  },
  medicationItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  medicationBullet: {
    fontSize: 16,
    color: '#060070',
    marginRight: 8,
    marginTop: 2,
  },
  medicationText: {
    fontSize: 16,
    color: '#060070',
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
    color: '#060070',
    marginRight: 8,
    marginTop: 2,
  },
  symptomText: {
    fontSize: 16,
    color: '#060070',
    lineHeight: 22,
    flex: 1,
  },
  symptomLabel: {
    fontWeight: 'bold',
    color: '#060070',
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#060070',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 16,
    color: '#060070',
    lineHeight: 22,
    flex: 1,
  },
  recommendationLabel: {
    fontWeight: 'bold',
    color: '#060070',
  },
  bottomSpacing: {
    height: 40,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#6B4EFF',
    marginBottom: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#2D1B69',
  },
  timePeriodContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 27, 105, 0.1)',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#2D1B69',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#2D1B69',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: 'white',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    marginRight: 8,
  },
  settingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  settingsBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  settingsContent: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D1B69',
  },
  periodOptions: {
    gap: 12,
  },
  periodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
  },
  periodOptionSelected: {
    backgroundColor: '#E8E3FF',
  },
  periodOptionText: {
    fontSize: 16,
    color: '#2D1B69',
  },
  periodOptionTextSelected: {
    fontWeight: '600',
  },
  dotLabel: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dotLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
}; 
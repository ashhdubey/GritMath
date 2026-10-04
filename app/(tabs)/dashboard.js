import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { getTotalSolved, getStreak, getDashboardStats } from '../../src/storage/storage';
import { useTheme } from '../../src/theme';
import AdBanner from '../../src/components/AdBanner';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const theme = useTheme();
  const [totalSolved, setTotalSolved] = useState(0);
  const [streakData, setStreakData] = useState({ count: 0, max: 0, lastDate: null });
  const [timeRange, setTimeRange] = useState('today');
  const [dashboardStats, setDashboardStats] = useState(null);

  useFocusEffect(useCallback(() => {
    setTotalSolved(getTotalSolved());
    setStreakData(getStreak());
    setDashboardStats(getDashboardStats(timeRange));
  }, [timeRange]));

  const renderPerformanceGrid = () => {
    if (!dashboardStats) return null;
    const { total, correct, wrong, skipped } = dashboardStats.performance;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <View style={styles.perfGrid}>
        <View style={[styles.perfCard, { backgroundColor: theme.surface, borderColor: theme.border, width: '48%' }]}>
          <Text style={[styles.perfValue, { color: theme.text }]}>{total}</Text>
          <Text style={[styles.perfLabel, { color: theme.textSecondary }]}>Total</Text>
        </View>
        <View style={[styles.perfCard, { backgroundColor: theme.surface, borderColor: theme.border, width: '48%' }]}>
          <Text style={[styles.perfValue, { color: theme.primary }]}>{accuracy}%</Text>
          <Text style={[styles.perfLabel, { color: theme.textSecondary }]}>Accuracy</Text>
        </View>
        <View style={[styles.perfCard, { backgroundColor: theme.surface, borderColor: theme.border, width: '31%' }]}>
          <Text style={[styles.perfValue, { color: theme.success }]}>{correct}</Text>
          <Text style={[styles.perfLabel, { color: theme.textSecondary }]}>Correct</Text>
        </View>
        <View style={[styles.perfCard, { backgroundColor: theme.surface, borderColor: theme.border, width: '31%' }]}>
          <Text style={[styles.perfValue, { color: theme.danger }]}>{wrong}</Text>
          <Text style={[styles.perfLabel, { color: theme.textSecondary }]}>Wrong</Text>
        </View>
        <View style={[styles.perfCard, { backgroundColor: theme.surface, borderColor: theme.border, width: '31%' }]}>
          <Text style={[styles.perfValue, { color: theme.warning }]}>{skipped}</Text>
          <Text style={[styles.perfLabel, { color: theme.textSecondary }]}>Skipped</Text>
        </View>
      </View>
    );
  };

  const renderPieChart = () => {
    if (!dashboardStats) return null;
    const { endless, survival } = dashboardStats.moduleAcc;

    const data = [
      {
        name: 'Endless',
        population: Math.round(endless) || 0, // Fallback if no data
        color: theme.primary,
        legendFontColor: theme.text,
        legendFontSize: 14,
      },
      {
        name: 'Survival',
        population: Math.round(survival) || 0, // Fallback if no data
        color: theme.danger || '#EF4444',
        legendFontColor: theme.text,
        legendFontSize: 14,
      }
    ];
    
    // If both are 0, chart might throw error or look empty
    if (data[0].population === 0 && data[1].population === 0) {
      data[0].population = 1; // Fake data just to show empty chart
      data[1].population = 1;
      data[0].color = theme.border;
      data[1].color = theme.border;
    }

    return (
      <View style={[styles.chartContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <PieChart
          data={data}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your performance metrics</Text>
      </View>

      <View style={styles.metricRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.iconBg, { backgroundColor: theme.primaryLight }]}>
            <Feather name="check-circle" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.metricValue, { color: theme.text }]}>{totalSolved}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total (All Time)</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={[styles.iconBg, { backgroundColor: theme.warningLight, width: 36, height: 36, marginBottom: 0, marginRight: 12 }]}>
              <Feather name="zap" size={18} color={theme.warning} />
            </View>
            <Text style={[styles.metricLabel, { color: theme.textSecondary, fontSize: 16 }]}>Streak</Text>
          </View>
          
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: theme.border, justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>Max Streak</Text>
              <Text style={[styles.metricValue, { color: theme.text, fontSize: 22, marginTop: 2 }]}>{streakData.max || 0} <Text style={{ fontSize: 14 }}>days</Text></Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', paddingTop: 8 }}>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>Current Streak</Text>
              <Text style={[styles.metricValue, { color: theme.text, fontSize: 22, marginTop: 2 }]}>{streakData.count || 0} <Text style={{ fontSize: 14 }}>days</Text></Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.sectionHeader, { flexDirection: 'row', alignItems: 'center' }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance</Text>
          <TouchableOpacity onPress={() => Alert.alert("Performance Tracking", "Performance tracking dynamically aggregates your Endless and Survival mode scores across the selected time range.\n\n(Revision and Practice modes are excluded)")} style={{ marginLeft: 8 }}>
            <Feather name="info" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.filterRow, { backgroundColor: theme.border }]}>
          {['today', 'week', 'month', 'overall'].map(range => (
            <TouchableOpacity 
              key={range} 
              style={[styles.filterBtn, timeRange === range && { backgroundColor: theme.surface, shadowColor: '#000', elevation: 2, shadowOpacity: 0.1, shadowRadius: 4 }]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[styles.filterText, { color: timeRange === range ? theme.text : theme.textSecondary }]}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderPerformanceGrid()}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Module-wise Stats (Accuracy)</Text>
        </View>
        {renderPieChart()}
      </View>

      <AdBanner />
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 60, paddingBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: 16, marginTop: 4 },
  
  metricRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  metricCard: { flex: 1, borderRadius: 20, padding: 20, borderWidth: 1 },
  iconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  metricValue: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  metricLabel: { fontSize: 13, fontWeight: '600' },
  
  section: { marginBottom: 32 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  
  filterRow: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16 },
  filterBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  filterText: { fontSize: 13, fontWeight: '700' },

  perfGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  perfCard: { padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  perfValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  perfLabel: { fontSize: 12, fontWeight: '600' },

  chartContainer: { borderRadius: 20, borderWidth: 1, paddingVertical: 20, alignItems: 'center', overflow: 'hidden' }
});

import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '../../src/engine/MathEngine';
import { getTotalSolved, getStreak, getQuizHistory, getCategoryStats, getDailyActiveTime } from '../../src/storage/storage';
import { useTheme } from '../../src/theme';

export default function Dashboard() {
  const theme = useTheme();
  const [totalSolved, setTotalSolved] = useState(0);
  const [streakData, setStreakData] = useState({ count: 0, max: 0, lastDate: null });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});
  const [activeTimes, setActiveTimes] = useState({});
  
  // For Monthly Calendar Heatmap
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDayMinutes, setSelectedDayMinutes] = useState(null);

  useFocusEffect(useCallback(() => {
    setTotalSolved(getTotalSolved());
    setStreakData(getStreak());
    setRecentQuizzes(getQuizHistory().slice(0, 5));
    setCategoryStats(getCategoryStats());
    setActiveTimes(getDailyActiveTime());
  }, []));

  // Generate Calendar Days for currentMonth
  const generateMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Empty slots for alignment
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      const fullDateStr = `${year}-${mStr}-${dStr}`;
      days.push({
        date: fullDateStr,
        dayNum: i,
        minutes: activeTimes[fullDateStr] || 0
      });
    }
    return days;
  };
  
  const calendarDays = generateMonthDays();
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDayMinutes(null);
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDayMinutes(null);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Your performance metrics</Text>
      </View>

      {/* Monthly Activity Heatmap */}
      <View style={styles.section}>
        <View style={styles.heatmapContainer}>
          <View style={styles.heatmapHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.monthNav}>
              <Feather name="chevron-left" size={20} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: theme.text }]}>{monthName}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.monthNav}>
              <Feather name="chevron-right" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarGrid}>
            {['S','M','T','W','T','F','S'].map((day, i) => (
              <Text key={`header-${i}`} style={[styles.dayHeader, { color: theme.textSecondary }]}>{day}</Text>
            ))}
            
            {calendarDays.map((dayObj, i) => {
              if (!dayObj) return <View key={`empty-${i}`} style={styles.calendarCell} />;
              
              let opacity = 0.1;
              if (dayObj.minutes >= 15) opacity = 1;
              else if (dayObj.minutes >= 10) opacity = 0.7;
              else if (dayObj.minutes >= 5) opacity = 0.4;
              else if (dayObj.minutes > 0) opacity = 0.2;
              
              const isSelected = selectedDayMinutes?.date === dayObj.date;

              return (
                <TouchableOpacity 
                  key={dayObj.date} 
                  style={styles.calendarCell}
                  onPress={() => setSelectedDayMinutes(dayObj)}
                >
                  <View style={[
                    styles.heatmapBlock, 
                    { 
                      backgroundColor: dayObj.minutes > 0 ? theme.primary : theme.border,
                      opacity: dayObj.minutes > 0 ? opacity : 0.5,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: theme.text
                    }
                  ]} />
                </TouchableOpacity>
              );
            })}
          </View>
          
          {selectedDayMinutes && (
            <Text style={[styles.selectedDayText, { color: theme.text }]}>
              {selectedDayMinutes.date}: {Math.round(selectedDayMinutes.minutes)} mins active
            </Text>
          )}
        </View>
      </View>

      <View style={styles.metricRow}>
        <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.iconBg, { backgroundColor: theme.primaryLight }]}>
            <Feather name="check-circle" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.metricValue, { color: theme.text }]}>{totalSolved}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Solved</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.iconBg, { backgroundColor: theme.warningLight }]}>
            <Feather name="zap" size={24} color={theme.warning} />
          </View>
          <Text style={[styles.metricValue, { color: theme.text }]}>{streakData.max || 0}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Max Streak</Text>
        </View>
      </View>



      {/* Category Mastery Chart */}
      {Object.keys(categoryStats).length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Category Mastery</Text>
          </View>
          <View style={[styles.chartContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {Object.entries(categoryStats).map(([catKey, stats], i) => {
              const catInfo = CATEGORIES.find((c) => c.key === catKey);
              const pct = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
              const barColor = pct >= 80 ? theme.success : pct >= 50 ? theme.warning : theme.danger;
              return (
                <View key={i} style={styles.chartCol}>
                  <Text style={[styles.chartPctText, { color: theme.textSecondary }]}>{pct}%</Text>
                  <View style={[styles.chartTrack, { backgroundColor: theme.background }]}>
                    <View style={[styles.chartFill, { height: `${pct}%`, backgroundColor: barColor }]} />
                  </View>
                  <Text style={[styles.mathIconSmall, { color: theme.textSecondary, marginTop: 8 }]}>{catInfo?.icon || '#'}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {recentQuizzes.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
          </View>
          <View style={[styles.listContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {recentQuizzes.map((quiz, i) => {
              const pct = Math.round((quiz.score / quiz.total) * 100);
              const catInfo = CATEGORIES.find((c) => c.key === quiz.category);
              const isLast = i === recentQuizzes.length - 1;
              return (
                <View key={i} style={[styles.listItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                  <View style={[styles.catIconBg, { backgroundColor: theme.background }]}>
                    <Text style={[styles.mathIconMedium, { color: theme.primary }]}>{catInfo?.icon || '#'}</Text>
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={[styles.listCategory, { color: theme.text }]}>{catInfo?.label || quiz.category}</Text>
                    <Text style={[styles.listMeta, { color: theme.textSecondary }]}>{quiz.score}/{quiz.total} • {quiz.difficulty}</Text>
                  </View>
                  <Text style={[styles.listPct, { color: pct >= 80 ? theme.success : pct >= 50 ? theme.warning : theme.danger }]}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {Object.keys(categoryStats).length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Weakness Analytics</Text>
          </View>
          <View style={[styles.listContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {Object.entries(categoryStats).map(([catKey, stats], i) => {
              const catInfo = CATEGORIES.find((c) => c.key === catKey);
              const pct = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
              const avgSpeed = stats.attempted > 0 ? (stats.totalTime / stats.attempted).toFixed(1) : '0.0';
              const isLast = i === Object.keys(categoryStats).length - 1;
              return (
                <View key={i} style={[styles.listItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                  <View style={[styles.catIconBg, { backgroundColor: theme.background }]}>
                    <Text style={[styles.mathIconMedium, { color: theme.primary }]}>{catInfo?.icon || '#'}</Text>
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={[styles.listCategory, { color: theme.text }]}>{catInfo?.label || catKey}</Text>
                    <Text style={[styles.listMeta, { color: theme.textSecondary }]}>{avgSpeed}s / question</Text>
                  </View>
                  <Text style={[styles.listPct, { color: pct >= 80 ? theme.success : pct >= 50 ? theme.warning : theme.danger }]}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
      
      {totalSolved === 0 && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyIcon, { color: theme.textSecondary }]}>🚀</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Welcome to GritMath!</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Play your first quiz in the Practice tab to start seeing your performance metrics here.</Text>
        </View>
      )}

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
  metricLabel: { fontSize: 13, fontWeight: '500' },
  section: { marginBottom: 32 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', borderRadius: 20, borderWidth: 1, padding: 20, height: 200 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartTrack: { width: 12, height: 100, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  chartFill: { width: '100%', borderRadius: 6 },
  chartPctText: { fontSize: 10, fontWeight: '600', marginBottom: 6 },
  mathIconSmall: { fontSize: 14, fontWeight: '800' },
  mathIconMedium: { fontSize: 18, fontWeight: '800' },

  heatmapContainer: { borderRadius: 20, paddingVertical: 12 },
  heatmapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 8 },
  monthText: { fontSize: 18, fontWeight: '700' },
  monthNav: { padding: 4 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dayHeader: { width: '13%', textAlign: 'center', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  calendarCell: { width: '13%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  heatmapBlock: { width: 24, height: 24, borderRadius: 6 },
  selectedDayText: { textAlign: 'center', marginTop: 12, fontSize: 14, fontWeight: '600' },

  listContainer: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  catIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  listInfo: { flex: 1 },
  listCategory: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  listMeta: { fontSize: 13, fontWeight: '500' },
  listPct: { fontSize: 16, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});

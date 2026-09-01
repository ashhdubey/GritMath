import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '../../src/engine/MathEngine';
import { getTotalSolved, getHighScores, getQuizHistory, getCategoryStats } from '../../src/storage/storage';
import { useTheme } from '../../src/theme';

export default function Dashboard() {
  const theme = useTheme();
  const [totalSolved, setTotalSolved] = useState(0);
  const [highScores, setHighScores] = useState({});
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});

  useFocusEffect(useCallback(() => {
    setTotalSolved(getTotalSolved());
    setHighScores(getHighScores());
    setRecentQuizzes(getQuizHistory().slice(0, 5));
    setCategoryStats(getCategoryStats());
  }, []));

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
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Total Solved</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.iconBg, { backgroundColor: theme.warningLight }]}>
            <Feather name="award" size={24} color={theme.warning} />
          </View>
          <Text style={[styles.metricValue, { color: theme.text }]}>{Object.keys(highScores).length}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Records Set</Text>
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
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Category Breakdown</Text>
          </View>
          <View style={[styles.listContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {Object.entries(categoryStats).map(([catKey, stats], i) => {
              const catInfo = CATEGORIES.find((c) => c.key === catKey);
              const pct = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
              const isLast = i === Object.keys(categoryStats).length - 1;
              return (
                <View key={i} style={[styles.listItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                  <View style={[styles.catIconBg, { backgroundColor: theme.background }]}>
                    <Text style={[styles.mathIconMedium, { color: theme.primary }]}>{catInfo?.icon || '#'}</Text>
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={[styles.listCategory, { color: theme.text }]}>{catInfo?.label || catKey}</Text>
                    <Text style={[styles.listMeta, { color: theme.textSecondary }]}>{stats.correct} / {stats.attempted} Correct</Text>
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

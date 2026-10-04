import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import AdBanner from '../../src/components/AdBanner';
import useAppStore from '../../src/store/useAppStore';
import { generateSequentialRevision } from '../../src/engine/MathEngine';

export default function Revision() {
  const theme = useTheme();
  const router = useRouter();
  const { startRevisionQuiz } = useAppStore();
  
  const [tab, setTab] = useState('recommended'); // 'recommended' | 'daily_revision'
  const [selectedRec, setSelectedRec] = useState(null);

  // Daily Revision state
  const [revTables, setRevTables] = useState({ enabled: true, min: '2', max: '20' });
  const [revSquares, setRevSquares] = useState({ enabled: false, min: '2', max: '25' });
  const [revCubes, setRevCubes] = useState({ enabled: false, min: '2', max: '15' });
  const [revError, setRevError] = useState('');

  const handleStartDailyRevision = () => {
    const selections = {};
    
    if (revTables.enabled) {
      const min = parseInt(revTables.min, 10);
      const max = parseInt(revTables.max, 10);
      if (isNaN(min) || isNaN(max) || min > max || min < 1) return setRevError('Invalid Tables range');
      selections.tables = { min, max };
    }
    
    if (revSquares.enabled) {
      const min = parseInt(revSquares.min, 10);
      const max = parseInt(revSquares.max, 10);
      if (isNaN(min) || isNaN(max) || min > max || min < 1) return setRevError('Invalid Squares range');
      selections.squares = { min, max };
    }

    if (revCubes.enabled) {
      const min = parseInt(revCubes.min, 10);
      const max = parseInt(revCubes.max, 10);
      if (isNaN(min) || isNaN(max) || min > max || min < 1) return setRevError('Invalid Cubes range');
      selections.cubes = { min, max };
    }

    if (Object.keys(selections).length === 0) {
      return setRevError('Please select at least one category to revise.');
    }

    setRevError('');
    const questions = generateSequentialRevision(selections);
    
    startRevisionQuiz(questions);

    router.push('/daily-revision-quiz');
  };

  const renderRecommendedContent = () => {
    if (selectedRec) {
      return (
        <View style={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedRec(null)}>
            <Feather name="arrow-left" size={20} color={theme.text} />
            <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedRec === 'squares' ? 'Squares (1-25)' : 
             selectedRec === 'cubes' ? 'Cubes (1-20)' : 
             selectedRec === 'square_roots' ? 'Square Roots' :
             selectedRec === 'cube_roots' ? 'Cube Roots' :
             selectedRec === 'percentages' ? 'Common Percentages' :
             'Tables (2-20)'}
          </Text>
          <View style={styles.grid}>
            {selectedRec === 'squares' && Array.from({length: 25}, (_, i) => i + 1).map(n => (
              <View key={n} style={[styles.gridItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.gridText, { color: theme.text }]}>{n}² = {n*n}</Text>
              </View>
            ))}
            {selectedRec === 'cubes' && Array.from({length: 20}, (_, i) => i + 1).map(n => (
              <View key={n} style={[styles.gridItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.gridText, { color: theme.text }]}>{n}³ = {n*n*n}</Text>
              </View>
            ))}
            {selectedRec === 'square_roots' && Array.from({length: 25}, (_, i) => i + 1).map(n => (
              <View key={n} style={[styles.gridItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.gridText, { color: theme.text }]}>√{n*n} = {n}</Text>
              </View>
            ))}
            {selectedRec === 'cube_roots' && Array.from({length: 20}, (_, i) => i + 1).map(n => (
              <View key={n} style={[styles.gridItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.gridText, { color: theme.text }]}>∛{n*n*n} = {n}</Text>
              </View>
            ))}
            {selectedRec === 'percentages' && (
              <>
                {[
                  { label: 'Halves & Quarters', items: ['50% = 1/2', '25% = 1/4', '75% = 3/4'] },
                  { label: 'Thirds', items: ['33.3% ≈ 1/3', '66.6% ≈ 2/3'] },
                  { label: 'Fifths', items: ['20% = 1/5', '40% = 2/5', '60% = 3/5', '80% = 4/5'] },
                  { label: 'Eighths', items: ['12.5% = 1/8', '37.5% = 3/8', '62.5% = 5/8', '87.5% = 7/8'] }
                ].map((group, idx) => (
                  <View key={idx} style={[styles.gridItem, { backgroundColor: theme.surface, borderColor: theme.border, width: '48%' }]}>
                    <Text style={[styles.gridText, { color: theme.text, marginBottom: 8 }]}>{group.label}</Text>
                    {group.items.map(item => (
                      <Text key={item} style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>{item}</Text>
                    ))}
                  </View>
                ))}
              </>
            )}
            {selectedRec === 'tables' && Array.from({length: 19}, (_, i) => i + 2).map(n => (
              <View key={n} style={[styles.gridItem, { backgroundColor: theme.surface, borderColor: theme.border, width: '48%' }]}>
                <Text style={[styles.gridText, { color: theme.text, marginBottom: 8 }]}>Table of {n}</Text>
                {Array.from({length: 10}, (_, j) => j + 1).map(m => (
                  <Text key={m} style={{ color: theme.textSecondary, fontSize: 12 }}>{n} × {m} = {n * m}</Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <TouchableOpacity style={[styles.navCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setSelectedRec('squares')}>
          <View style={[styles.iconBg, { backgroundColor: theme.primaryLight }]}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.primary }}>x²</Text>
          </View>
          <Text style={[styles.navCardTitle, { color: theme.text }]}>Squares</Text>
          <Feather name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setSelectedRec('square_roots')}>
          <View style={[styles.iconBg, { backgroundColor: theme.primaryLight }]}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.primary }}>√x</Text>
          </View>
          <Text style={[styles.navCardTitle, { color: theme.text }]}>Square Roots</Text>
          <Feather name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setSelectedRec('cubes')}>
          <View style={[styles.iconBg, { backgroundColor: theme.successLight }]}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.success }}>x³</Text>
          </View>
          <Text style={[styles.navCardTitle, { color: theme.text }]}>Cubes</Text>
          <Feather name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setSelectedRec('cube_roots')}>
          <View style={[styles.iconBg, { backgroundColor: theme.successLight }]}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.success }}>∛x</Text>
          </View>
          <Text style={[styles.navCardTitle, { color: theme.text }]}>Cube Roots</Text>
          <Feather name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setSelectedRec('percentages')}>
          <View style={[styles.iconBg, { backgroundColor: theme.warningLight }]}>
            <Feather name="percent" size={24} color={theme.warning} />
          </View>
          <Text style={[styles.navCardTitle, { color: theme.text }]}>Percentages</Text>
          <Feather name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setSelectedRec('tables')}>
          <View style={[styles.iconBg, { backgroundColor: theme.dangerLight || '#FEE2E2' }]}>
            <Feather name="x" size={24} color={theme.danger || '#EF4444'} />
          </View>
          <Text style={[styles.navCardTitle, { color: theme.text }]}>Multiplication Tables</Text>
          <Feather name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDailyRevision = () => (
    <View style={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 8 }]}>Daily Writing Practice</Text>
      <Text style={{ color: theme.textSecondary, marginBottom: 20 }}>Revise your math tables, squares, and cubes sequentially.</Text>

      {/* Tables Card */}
      <View style={[styles.revCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.revCardHeader}>
          <Text style={[styles.revCardTitle, { color: theme.text }]}>Multiplication Tables</Text>
          <Switch 
            value={revTables.enabled} 
            onValueChange={v => setRevTables(prev => ({...prev, enabled: v}))} 
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
        {revTables.enabled && (
          <View style={styles.revInputRow}>
            <Text style={{ color: theme.textSecondary }}>From</Text>
            <TextInput style={[styles.revInput, { borderColor: theme.border, color: theme.text }]} value={revTables.min} onChangeText={v => setRevTables(prev => ({...prev, min: v}))} keyboardType="number-pad" />
            <Text style={{ color: theme.textSecondary }}>To</Text>
            <TextInput style={[styles.revInput, { borderColor: theme.border, color: theme.text }]} value={revTables.max} onChangeText={v => setRevTables(prev => ({...prev, max: v}))} keyboardType="number-pad" />
          </View>
        )}
      </View>

      {/* Squares Card */}
      <View style={[styles.revCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.revCardHeader}>
          <Text style={[styles.revCardTitle, { color: theme.text }]}>Squares</Text>
          <Switch 
            value={revSquares.enabled} 
            onValueChange={v => setRevSquares(prev => ({...prev, enabled: v}))} 
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
        {revSquares.enabled && (
          <View style={styles.revInputRow}>
            <Text style={{ color: theme.textSecondary }}>From</Text>
            <TextInput style={[styles.revInput, { borderColor: theme.border, color: theme.text }]} value={revSquares.min} onChangeText={v => setRevSquares(prev => ({...prev, min: v}))} keyboardType="number-pad" />
            <Text style={{ color: theme.textSecondary }}>To</Text>
            <TextInput style={[styles.revInput, { borderColor: theme.border, color: theme.text }]} value={revSquares.max} onChangeText={v => setRevSquares(prev => ({...prev, max: v}))} keyboardType="number-pad" />
          </View>
        )}
      </View>

      {/* Cubes Card */}
      <View style={[styles.revCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.revCardHeader}>
          <Text style={[styles.revCardTitle, { color: theme.text }]}>Cubes</Text>
          <Switch 
            value={revCubes.enabled} 
            onValueChange={v => setRevCubes(prev => ({...prev, enabled: v}))} 
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
        {revCubes.enabled && (
          <View style={styles.revInputRow}>
            <Text style={{ color: theme.textSecondary }}>From</Text>
            <TextInput style={[styles.revInput, { borderColor: theme.border, color: theme.text }]} value={revCubes.min} onChangeText={v => setRevCubes(prev => ({...prev, min: v}))} keyboardType="number-pad" />
            <Text style={{ color: theme.textSecondary }}>To</Text>
            <TextInput style={[styles.revInput, { borderColor: theme.border, color: theme.text }]} value={revCubes.max} onChangeText={v => setRevCubes(prev => ({...prev, max: v}))} keyboardType="number-pad" />
          </View>
        )}
      </View>

      {revError ? <Text style={{ color: theme.danger || '#EF4444', marginBottom: 12, fontWeight: '600' }}>⚠ {revError}</Text> : null}

      <TouchableOpacity style={[styles.startBtn, { backgroundColor: theme.primary }]} onPress={handleStartDailyRevision}>
        <Text style={styles.startText}>Start Daily Revision</Text>
        <Feather name="arrow-right" size={20} color="#FFF" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Revision</Text>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.tabBtn, tab === 'recommended' && { backgroundColor: theme.surface, shadowColor: '#000', elevation: 2, shadowOpacity: 0.1, shadowRadius: 4 }]} 
          onPress={() => { setTab('recommended'); setSelectedRec(null); }}
        >
          <Text style={[styles.tabText, tab === 'recommended' ? { color: theme.text } : { color: theme.textSecondary }]}>Reference</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, tab === 'daily_revision' && { backgroundColor: theme.surface, shadowColor: '#000', elevation: 2, shadowOpacity: 0.1, shadowRadius: 4 }]} 
          onPress={() => setTab('daily_revision')}
        >
          <Text style={[styles.tabText, tab === 'daily_revision' ? { color: theme.text } : { color: theme.textSecondary }]}>Daily Revision</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 16, backgroundColor: 'transparent' }}>
        <AdBanner />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {tab === 'recommended' ? renderRecommendedContent() : renderDailyRevision()}
        <AdBanner />
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  tabContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  content: { paddingBottom: 20 },
  
  navCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
  iconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  navCardTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },

  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '31%', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  gridText: { fontSize: 15, fontWeight: '700' },

  revCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  revCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  revCardTitle: { fontSize: 18, fontWeight: '700' },
  revInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 },
  revInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, fontWeight: '600' },

  startBtn: { marginTop: 16, paddingVertical: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#0056D2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  startText: { color: '#FFF', fontSize: 18, fontWeight: '800' }
});

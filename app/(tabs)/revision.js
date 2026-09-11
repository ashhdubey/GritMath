import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';
import AdBanner from '../../src/components/AdBanner';

export default function Revision() {
  const theme = useTheme();
  const [tab, setTab] = useState('recommended'); // 'recommended' | 'manual'
  
  // Recommended nested state
  const [selectedRec, setSelectedRec] = useState(null);

  // Manual state
  const [manualType, setManualType] = useState('table'); // 'table' | 'square' | 'cube' | 'square_root' | 'cube_root' | 'percentage'
  const [fromVal, setFromVal] = useState('2');
  const [toVal, setToVal] = useState('10');
  const [generatedList, setGeneratedList] = useState([]);
  const [generateError, setGenerateError] = useState('');

  const handleGenerate = () => {
    const from = parseInt(fromVal, 10);
    const to = parseInt(toVal, 10);
    // BUG-15 FIX: Show error instead of silently failing
    if (isNaN(from) || isNaN(to) || from > to || from < 1) {
      setGenerateError('From must be ≤ To and both must be positive numbers.');
      return;
    }
    setGenerateError('');

    const results = [];
    for (let i = from; i <= to; i++) {
      if (manualType === 'square') results.push({ id: i, label: `${i}² = ${i * i}` });
      else if (manualType === 'cube') results.push({ id: i, label: `${i}³ = ${i * i * i}` });
      else if (manualType === 'square_root') results.push({ id: i, label: `√${i * i} = ${i}` });
      else if (manualType === 'cube_root') results.push({ id: i, label: `∛${i * i * i} = ${i}` });
      else if (manualType === 'percentage') {
        const percStr = Array.from({length: 10}, (_, idx) => `${(idx + 1) * 10}% of ${i} = ${(i * ((idx + 1) * 10)) / 100}`).join('\n');
        results.push({ id: i, label: `Percentages of ${i}:\n${percStr}` });
      }
      else {
        const tableStr = Array.from({length: 10}, (_, idx) => `${i} × ${idx + 1} = ${i * (idx + 1)}`).join('\n');
        results.push({ id: i, label: `Table of ${i}:\n${tableStr}` });
      }
    }
    setGeneratedList(results);
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
          <Text style={[styles.tabText, tab === 'recommended' ? { color: theme.text } : { color: theme.textSecondary }]}>Recommended</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, tab === 'manual' && { backgroundColor: theme.surface, shadowColor: '#000', elevation: 2, shadowOpacity: 0.1, shadowRadius: 4 }]} 
          onPress={() => setTab('manual')}
        >
          <Text style={[styles.tabText, tab === 'manual' ? { color: theme.text } : { color: theme.textSecondary }]}>Manual</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 16, backgroundColor: 'transparent' }}>
        <AdBanner />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {tab === 'recommended' ? renderRecommendedContent() : (
          <View style={styles.content}>
            <View style={styles.typeSelector}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {[{id: 'table', label: 'TABLE'}, {id: 'square', label: 'SQUARE'}, {id: 'cube', label: 'CUBE'}, {id: 'square_root', label: 'SQ ROOT'}, {id: 'cube_root', label: 'CB ROOT'}, {id: 'percentage', label: 'PERCENT'}].map(t => (
                  <TouchableOpacity 
                    key={t.id}
                    style={[styles.typeBtn, { borderColor: theme.border, paddingHorizontal: 16 }, manualType === t.id && { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}
                    onPress={() => setManualType(t.id)}
                  >
                    <Text style={[styles.typeText, manualType === t.id ? { color: theme.primary } : { color: theme.textSecondary }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>From:</Text>
                <TextInput 
                  style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]} 
                  value={fromVal} 
                  onChangeText={setFromVal} 
                  keyboardType="number-pad" 
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>To:</Text>
                <TextInput 
                  style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]} 
                  value={toVal} 
                  onChangeText={setToVal} 
                  keyboardType="number-pad" 
                />
              </View>
            </View>
            <TouchableOpacity style={[styles.generateBtn, { backgroundColor: theme.primary }]} onPress={handleGenerate}>
              <Text style={styles.generateText}>Generate</Text>
            </TouchableOpacity>
            {generateError ? (
              <Text style={{ color: theme.danger || '#EF4444', fontSize: 13, marginTop: 8, fontWeight: '600' }}>⚠ {generateError}</Text>
            ) : null}

            <View style={styles.resultsArea}>
              {generatedList.map((res) => (
                <View key={res.id} style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.resultText, { color: theme.text }]}>{res.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
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
  
  typeSelector: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  typeText: { fontSize: 13, fontWeight: '700' },
  
  inputRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  inputGroup: { flex: 1 },
  inputLabel: { marginBottom: 8, fontSize: 14, fontWeight: '600' },
  input: { borderRadius: 12, borderWidth: 1, padding: 16, fontSize: 18, fontWeight: '700' },
  generateBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  generateText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  resultsArea: { gap: 12 },
  resultCard: { padding: 16, borderRadius: 12, borderWidth: 1 },
  resultText: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
});

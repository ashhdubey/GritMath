import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';

export default function Revision() {
  const theme = useTheme();
  const [tab, setTab] = useState('recommended'); // 'recommended' | 'manual'
  
  // Recommended nested state
  const [selectedRec, setSelectedRec] = useState(null);

  // Manual state
  const [manualType, setManualType] = useState('table'); // 'table' | 'square' | 'cube'
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
            {selectedRec === 'squares' ? 'Squares (1-25)' : selectedRec === 'cubes' ? 'Cubes (1-20)' : 'Tables (2-20)'}
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
            <Feather name="grid" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.navCardTitle, { color: theme.text }]}>Squares</Text>
          <Feather name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setSelectedRec('cubes')}>
          <View style={[styles.iconBg, { backgroundColor: theme.successLight }]}>
            <Feather name="box" size={24} color={theme.success} />
          </View>
          <Text style={[styles.navCardTitle, { color: theme.text }]}>Cubes</Text>
          <Feather name="chevron-right" size={24} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navCard, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setSelectedRec('tables')}>
          <View style={[styles.iconBg, { backgroundColor: theme.warningLight }]}>
            <Feather name="x" size={24} color={theme.warning} />
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

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {tab === 'recommended' ? renderRecommendedContent() : (
          <View style={styles.content}>
            <View style={styles.typeSelector}>
              {['table', 'square', 'cube'].map(t => (
                <TouchableOpacity 
                  key={t}
                  style={[styles.typeBtn, { borderColor: theme.border }, manualType === t && { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}
                  onPress={() => setManualType(t)}
                >
                  <Text style={[styles.typeText, manualType === t ? { color: theme.primary } : { color: theme.textSecondary }]}>{t.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
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

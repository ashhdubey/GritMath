import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';
import { requestNotificationPermissions, scheduleDailyReminder, cancelAllReminders } from '../../src/notifications';
import { useTheme } from '../../src/theme';

export default function ExperienceSettings() {
  const router = useRouter();
  const theme = useTheme();
  
  const { 
    hapticsEnabled, setHapticsEnabled,
    notifsEnabled, setNotifsEnabled,
    notifsTime, setNotifsTime
  } = useAppStore();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState(20);
  const [tempMinute, setTempMinute] = useState(0);

  const handleNotifToggle = async (val) => {
    if (val) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permission Denied', 'Please enable notifications in your system settings to use streak reminders.');
        return;
      }
      setNotifsEnabled(true);
      scheduleDailyReminder(notifsTime);
    } else {
      setNotifsEnabled(false);
      cancelAllReminders();
    }
  };

  const openTimePicker = () => {
    const [h, m] = notifsTime.split(':').map(Number);
    setTempHour(h || 20);
    setTempMinute(m || 0);
    setShowTimePicker(true);
  };

  const saveTime = () => {
    const formatted = `${String(tempHour).padStart(2, '0')}:${String(tempMinute).padStart(2, '0')}`;
    setNotifsTime(formatted);
    if (notifsEnabled) scheduleDailyReminder(formatted);
    setShowTimePicker(false);
  };

  const adjustHour = (delta) => setTempHour(prev => (prev + delta + 24) % 24);
  const adjustMinute = (delta) => setTempMinute(prev => (prev + delta + 60) % 60);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Experience</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={[styles.cardGroup, { backgroundColor: theme.surface }]}>
          
          {/* Haptics */}
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <View style={styles.iconContainer}>
              <Feather name="smartphone" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>Haptic Feedback</Text>
              <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>Vibrations during quizzes</Text>
            </View>
            <Switch 
              value={hapticsEnabled} 
              onValueChange={setHapticsEnabled}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={hapticsEnabled ? theme.primary : '#f4f3f4'}
            />
          </View>

          {/* Streak Reminders */}
          <View style={[styles.row, notifsEnabled && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <View style={styles.iconContainer}>
              <Feather name="bell" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.rowTitle, { color: theme.text }]}>Streak Reminders</Text>
              <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>Daily offline notifications</Text>
            </View>
            <Switch 
              value={notifsEnabled} 
              onValueChange={handleNotifToggle}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={notifsEnabled ? theme.primary : '#f4f3f4'}
            />
          </View>
          
          {/* Reminder Time */}
          {notifsEnabled && (
            <TouchableOpacity 
              style={styles.row} 
              onPress={openTimePicker}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Feather name="clock" size={20} color={theme.textSecondary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>Reminder Time</Text>
                <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>Select hour and minute</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.primary }}>{notifsTime}</Text>
            </TouchableOpacity>
          )}

        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.timeModal, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Set Reminder Time</Text>
            
            <View style={styles.pickerRow}>
              {/* Hour Picker */}
              <View style={styles.pickerCol}>
                <TouchableOpacity onPress={() => adjustHour(1)} style={styles.pickerBtn}>
                  <Feather name="chevron-up" size={28} color={theme.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.pickerText, { color: theme.primary }]}>{String(tempHour).padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => adjustHour(-1)} style={styles.pickerBtn}>
                  <Feather name="chevron-down" size={28} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.pickerColon, { color: theme.text }]}>:</Text>

              {/* Minute Picker */}
              <View style={styles.pickerCol}>
                <TouchableOpacity onPress={() => adjustMinute(5)} style={styles.pickerBtn}>
                  <Feather name="chevron-up" size={28} color={theme.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.pickerText, { color: theme.primary }]}>{String(tempMinute).padStart(2, '0')}</Text>
                <TouchableOpacity onPress={() => adjustMinute(-5)} style={styles.pickerBtn}>
                  <Feather name="chevron-down" size={28} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalActionBtn} onPress={() => setShowTimePicker(false)}>
                <Text style={{ fontSize: 16, color: theme.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalActionBtn} onPress={saveTime}>
                <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 24 
  },
  backBtnWrapper: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  
  scrollContent: { paddingHorizontal: 16 },
  
  cardGroup: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    paddingRight: 12,
  },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  timeModal: { width: '100%', borderRadius: 24, padding: 24, borderWidth: 1, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 24 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  pickerCol: { alignItems: 'center', width: 70 },
  pickerBtn: { padding: 12 },
  pickerText: { fontSize: 40, fontWeight: '800', marginVertical: 8 },
  pickerColon: { fontSize: 40, fontWeight: '800', marginHorizontal: 12, marginBottom: 8 },
  modalActions: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.2)', paddingTop: 16 },
  modalActionBtn: { flex: 1, alignItems: 'center', paddingVertical: 12 },
});

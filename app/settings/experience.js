import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useAppStore from '../../src/store/useAppStore';
import { requestNotificationPermissions, scheduleDailyReminder, cancelAllReminders } from '../../src/notifications';
import { useTheme } from '../../src/theme';

export default function ExperienceSettings() {
  const router = useRouter();
  const theme = useTheme();
  
  const hapticsEnabled = useAppStore(state => state.hapticsEnabled);
  const setHapticsEnabled = useAppStore(state => state.setHapticsEnabled);
  const notifsEnabled = useAppStore(state => state.notifsEnabled);
  const setNotifsEnabled = useAppStore(state => state.setNotifsEnabled);
  const notifsTime = useAppStore(state => state.notifsTime);
  const setNotifsTime = useAppStore(state => state.setNotifsTime);

  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleNotifToggle = async (val) => {
    if (val) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permission Denied', 'Please enable notifications in your system settings to use streak reminders.');
        return;
      }
      setNotifsEnabled(true);
      scheduleDailyReminder(notifsTime).catch(e => Alert.alert('Error', e.message));
    } else {
      setNotifsEnabled(false);
      cancelAllReminders();
    }
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  const handleTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    
    if (event.type === 'set' && selectedDate) {
      const h = selectedDate.getHours();
      const m = selectedDate.getMinutes();
      const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      setNotifsTime(formatted);
      if (notifsEnabled) {
        scheduleDailyReminder(formatted).catch(e => Alert.alert('Error', e.message));
      }
    }
  };

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h || 20);
    d.setMinutes(m || 0);
    return d;
  };

  const formatAmPm = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

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
              <Text style={{ fontSize: 16, fontWeight: '700', color: theme.primary }}>{formatAmPm(notifsTime)}</Text>
            </TouchableOpacity>
          )}

        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Native Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={parseTime(notifsTime)}
          mode="time"
          is24Hour={false} // Enables AM/PM selection
          display="default"
          onChange={handleTimeChange}
        />
      )}

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
});

import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';

export default function SettingsIndex() {
  const router = useRouter();
  const theme = useTheme();

  const MenuItem = ({ icon, title, isLast, route }) => (
    <TouchableOpacity 
      style={[styles.menuItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
      onPress={() => router.push(route)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Feather name={icon} size={20} color={theme.textSecondary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>{title}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>

      <View style={[styles.cardGroup, { backgroundColor: theme.surface }]}>
        <MenuItem 
          icon="download" 
          title="App Updates" 
          route="/settings/updates" 
        />
        <MenuItem 
          icon="layout" 
          title="App Theme" 
          route="/settings/theme" 
        />
        <MenuItem 
          icon="zap" 
          title="Experience & Gamification" 
          route="/settings/experience" 
        />
        <MenuItem 
          icon="database" 
          title="Data & Storage" 
          route="/settings/data" 
          isLast={true}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Support</Text>
      <View style={[styles.cardGroup, { backgroundColor: theme.surface }]}>
        <MenuItem 
          icon="info" 
          title="About GritMath" 
          route="/about"
          isLast={true}
        />
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
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
  headerTitle: { fontSize: 24, fontWeight: '700' },
  
  cardGroup: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 8, 
    marginLeft: 24 
  },
  
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 16 
  },
  iconContainer: { 
    width: 32, 
    height: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  textContainer: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  menuTitle: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
});

import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../src/theme';
import useAppStore from '../src/store/useAppStore';

const LINKS = [
  { icon: 'github', label: 'GitHub', username: 'ashhdubey', url: 'https://github.com/ashhdubey' },
  { icon: 'linkedin', label: 'LinkedIn', username: 'ashhdubey', url: 'https://www.linkedin.com/in/ashhdubey/' },
  { icon: 'globe', label: 'Portfolio', username: 'ashhdubey.in', url: 'https://ashhdubey.in/' },
];

export default function About() {
  const router = useRouter();
  const theme = useTheme();
  const accentColor = useAppStore(state => state.accentColor);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>About</Text>

      {/* App Section */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, marginBottom: 24 }]}>
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
            <Feather name="hash" size={40} color={theme.primary} />
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.devName, { color: theme.text }]}>
              GritMath
            </Text>
            <Text style={[styles.devTitle, { color: theme.primary }]}>
              Version {require('../package.json').version}
            </Text>
          </View>
        </View>

        <Text style={[styles.bio, { color: theme.textSecondary }]}>
          100% offline speed math trainer. Made for competitive exam preparation.
        </Text>
        
        <Text style={[styles.bio, { color: theme.primary, fontWeight: '700', marginBottom: 0 }]}>
          Zero ads. Zero accounts. Zero cost.
        </Text>
      </View>

      {/* Developer Section */}

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
            <Feather name="user" size={40} color={theme.primary} />
          </View>
          
          <View style={styles.headerInfo}>
            <Text style={[styles.devName, { color: theme.text }]}>
              Ashish Kumar Dubey
            </Text>
            <Text style={[styles.devTitle, { color: theme.primary }]}>
              Software Engineer <Text style={{fontSize: 16}}>🇮🇳</Text>
            </Text>
          </View>
        </View>

        <Text style={[styles.bio, { color: theme.textSecondary }]}>
          Passionate about building fast, completely offline, and distraction-free mobile applications. GritMath was built with the belief that tools for learning should be completely free and endlessly reliable.
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Text style={[styles.linksTitle, { color: theme.text }]}>Connect & Follow</Text>

        {LINKS.map((link, i) => (
          <TouchableOpacity 
            key={i} 
            style={[styles.linkRow, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => Linking.openURL(link.url)}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
              <Feather name={link.icon} size={20} color={theme.primary} />
            </View>
            <View style={styles.linkInfo}>
              <Text style={[styles.linkLabel, { color: theme.textSecondary }]}>{link.label}</Text>
              <Text style={[styles.linkUsername, { color: theme.text }]}>{link.username}</Text>
            </View>
            <Feather name="external-link" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  backBtn: { paddingTop: 60, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 24 },
  
  card: { borderRadius: 24, padding: 24, borderWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  headerInfo: { flex: 1, justifyContent: 'center' },
  devName: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  devTitle: { fontSize: 15, fontWeight: '700' },
  
  bio: { fontSize: 15, lineHeight: 24, marginBottom: 24 },
  divider: { height: 1, width: '100%', marginBottom: 24 },
  
  linksTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  linkRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  linkInfo: { flex: 1 },
  linkLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  linkUsername: { fontSize: 15, fontWeight: '700' },
});

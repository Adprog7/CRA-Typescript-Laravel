import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isClient = user?.client === 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Mon <Text style={styles.highlight}>Profil</Text></Text>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Nom</Text>
          <Text style={[styles.value, { color: theme.text }]}>{user?.name || '—'}</Text>

          <Text style={[styles.label, { marginTop: 16, color: theme.textSecondary }]}>Email</Text>
          <Text style={[styles.value, { color: theme.text }]}>{user?.email}</Text>

          <Text style={[styles.label, { marginTop: 16, color: theme.textSecondary }]}>Type de compte</Text>
          <View style={[styles.badge, isClient ? styles.badgeClient : styles.badgeEmployee]}>
            <Text style={styles.badgeText}>{isClient ? '🏢 Compte Client' : 'Collaborateur'}</Text>
          </View>
        </View>

        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>DÉCONNEXION</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '900', marginBottom: 24 },
  highlight: { color: '#0066cc' },
  card: { borderRadius: 16, padding: 24, borderWidth: 1, marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  value: { fontSize: 16, fontFamily: 'monospace' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 4 },
  badgeClient: { backgroundColor: '#00f2fe22', borderWidth: 1, borderColor: '#00f2fe' },
  badgeEmployee: { backgroundColor: '#0066cc22', borderWidth: 1, borderColor: '#0066cc' },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  logoutBtn: { backgroundColor: '#cc2200', borderRadius: 12, padding: 18, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 1.5 },
});

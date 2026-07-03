import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Text style={[styles.title, { color: theme.text }]}>PROJET <Text style={styles.highlight}>CRA</Text></Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Connexion</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected }]}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              placeholderTextColor={theme.textSecondary + '80'}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Mot de passe</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary + '80'}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SE CONNECTER</Text>}
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Pas encore de compte ?{' '}
              <Text style={styles.link} onPress={() => router.push('/auth/register')}>S'inscrire</Text>
            </Text>
            <Text style={[styles.footerText, { color: theme.textSecondary, marginTop: 12 }]}>
              Vous êtes un client ?{' '}
              <Text style={[styles.link, { color: '#00f2fe' }]} onPress={() => router.push('/auth/client-login')}>
                Accès Entreprise
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 20 },
  card: {
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
  },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  highlight: { color: '#0066cc' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 28 },
  formGroup: { marginBottom: 16 },
  label: { marginBottom: 6, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  error: { color: '#ff4d4d', marginBottom: 12, textAlign: 'center', fontSize: 13 },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  footer: { marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 13 },
  link: { color: '#0066cc', fontWeight: '700' },
});

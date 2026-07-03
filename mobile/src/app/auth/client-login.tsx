import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function ClientLoginScreen() {
  const { clientLogin } = useAuth();
  const theme = useTheme();
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!companyName.trim()) { setError("Veuillez entrer le nom de votre entreprise"); return; }
    setError('');
    setLoading(true);
    try {
      await clientLogin(companyName);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Entreprise non trouvée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Text style={[styles.title, { color: theme.text }]}>PROJET <Text style={styles.highlight}>CRA</Text></Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Espace Entreprise</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Nom de l'entreprise</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected }]}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Nom de l'entreprise"
              placeholderTextColor={theme.textSecondary + '80'}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ACCÉDER À MES MISSIONS</Text>}
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Vous êtes un collaborateur ?{' '}
              <Text style={styles.link} onPress={() => router.replace('/auth/login')}>Retour à la connexion</Text>
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
  card: { borderRadius: 16, padding: 28, borderWidth: 1 },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  highlight: { color: '#0066cc' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 28 },
  formGroup: { marginBottom: 16 },
  label: { marginBottom: 6, fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15 },
  error: { color: '#ff4d4d', marginBottom: 12, textAlign: 'center', fontSize: 13 },
  button: { backgroundColor: '#0066cc', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  footer: { marginTop: 24, alignItems: 'center' },
  footerText: { fontSize: 13 },
  link: { fontWeight: '700', textDecorationLine: 'underline' },
});

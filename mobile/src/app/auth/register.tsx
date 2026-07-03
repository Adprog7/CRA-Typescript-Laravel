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

export default function RegisterScreen() {
  const { register } = useAuth();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, confirmation);
      router.replace('/auth/login');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
          <Text style={[styles.title, { color: theme.text }]}>PROJET <Text style={styles.highlight}>CRA</Text></Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Création de compte</Text>

          {[
            { label: 'Nom complet', value: name, set: setName, placeholder: 'Jean Dupont' },
            { label: 'Email', value: email, set: setEmail, placeholder: 'votre@email.com', keyboard: 'email-address' as const, autoCapitalize: 'none' as const },
            { label: 'Mot de passe', value: password, set: setPassword, placeholder: '••••••••', secure: true },
            { label: 'Confirmer le mot de passe', value: confirmation, set: setConfirmation, placeholder: '••••••••', secure: true },
          ].map((field) => (
            <View style={styles.formGroup} key={field.label}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>{field.label}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.backgroundSelected }]}
                value={field.value}
                onChangeText={field.set}
                placeholder={field.placeholder}
                placeholderTextColor={theme.textSecondary + '80'}
                secureTextEntry={field.secure}
                keyboardType={field.keyboard}
                autoCapitalize={field.autoCapitalize ?? 'words'}
                editable={!loading}
              />
            </View>
          ))}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>S'INSCRIRE</Text>}
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Déjà inscrit ?{' '}
              <Text style={styles.link} onPress={() => router.replace('/auth/login')}>Se connecter</Text>
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
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  formGroup: { marginBottom: 14 },
  label: { marginBottom: 6, fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15 },
  error: { color: '#ff4d4d', marginBottom: 12, textAlign: 'center', fontSize: 13 },
  button: { backgroundColor: '#0066cc', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { fontSize: 13 },
  link: { color: '#0066cc', fontWeight: '700' },
});

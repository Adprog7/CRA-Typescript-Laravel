import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextInput } from '@/components/text-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from 'react-native';

type UserRole = 'owner' | 'employee' | 'customer';

const ROLE_LABELS: Record<UserRole, string> = {
  owner: '👨‍💼 Propriétaire',
  employee: '👷 Employé',
  customer: '👤 Client',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  owner: 'Accès complet à la gestion',
  employee: 'Gestion des stocks',
  customer: 'Consultation uniquement',
};

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const handleSignup = async () => {
    // Validations
    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      await signup(email, password, selectedRole);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Créer un compte
            </ThemedText>
            <ThemedText type="small" style={styles.subtitle}>
              MyDigitalSchool - Gestion de Stock
            </ThemedText>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Email */}
            <TextInput
              label="Email"
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Mot de passe */}
            <TextInput
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              secureTextEntry
            />

            {/* Confirmer mot de passe */}
            <TextInput
              label="Confirmer le mot de passe"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
              secureTextEntry
            />

            {/* Sélection du rôle */}
            <View style={styles.roleSection}>
              <ThemedText type="small" style={styles.roleLabel}>
                Type de compte
              </ThemedText>
              <View style={styles.roleContainer}>
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      {
                        borderColor: colors.backgroundElement,
                        backgroundColor:
                          selectedRole === role ? '#2A9D8F' : colors.backgroundElement,
                      },
                    ]}
                    onPress={() => setSelectedRole(role)}
                    disabled={isLoading}>
                    <ThemedText
                      type="small"
                      style={{
                        fontWeight: '600',
                        color: selectedRole === role ? 'white' : colors.text,
                      }}>
                      {ROLE_LABELS[role]}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      style={{
                        fontSize: 12,
                        color: selectedRole === role ? 'rgba(255,255,255,0.7)' : colors.textSecondary,
                      }}>
                      {ROLE_DESCRIPTIONS[role]}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Message d'erreur */}
            {error ? (
              <ThemedText type="small" style={[styles.error, { color: '#E63946' }]}>
                {error}
              </ThemedText>
            ) : null}

            {/* Bouton inscription */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#2A9D8F' }]}
              onPress={handleSignup}
              disabled={isLoading}>
              <ThemedText type="small" style={{ color: 'white', fontWeight: 'bold' }}>
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
              </ThemedText>
            </TouchableOpacity>

            {/* Lien connexion */}
            <View style={styles.linkContainer}>
              <ThemedText type="small">Déjà un compte ? </ThemedText>
              <TouchableOpacity onPress={() => router.back()}>
                <ThemedText type="small" style={{ color: '#2A9D8F', fontWeight: 'bold' }}>
                  Se connecter
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  scrollContent: {
    paddingVertical: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  subtitle: {
    opacity: 0.7,
  },
  form: {
    gap: Spacing.three,
  },
  roleSection: {
    gap: Spacing.two,
  },
  roleLabel: {
    fontWeight: '600',
  },
  roleContainer: {
    gap: Spacing.two,
  },
  roleButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 8,
    borderWidth: 1,
    gap: Spacing.one,
  },
  error: {
    textAlign: 'center',
    marginVertical: Spacing.two,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
});

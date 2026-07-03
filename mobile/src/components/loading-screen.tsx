import { Colors, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export function LoadingScreen({ 
  title = 'Chargement...', 
  subtitle = 'Veuillez patienter' 
}: LoadingScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Spinner simple */}
        <View
          style={[
            styles.spinner,
            {
              borderColor: colors.backgroundElement,
              borderTopColor: colors.text,
            },
          ]}
        />

        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>

        {subtitle && (
          <ThemedText type="small" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderTopWidth: 4,
  },
  title: {
    marginTop: Spacing.two,
  },
  subtitle: {
    opacity: 0.7,
  },
});

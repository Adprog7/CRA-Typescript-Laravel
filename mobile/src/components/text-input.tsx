import { Colors, Spacing } from '@/constants/theme';
import { TextInput as RNTextInput, StyleSheet, useColorScheme, View } from 'react-native';
import { ThemedText } from './themed-text';

interface TextInputProps extends React.ComponentProps<typeof RNTextInput> {
  label?: string;
  error?: string;
}

export function TextInput({ label, error, ...props }: TextInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.container}>
      {label && <ThemedText type="small" style={styles.label}>{label}</ThemedText>}
      <RNTextInput
        {...props}
        style={[
          styles.input,
          {
            borderColor: error ? '#E63946' : colors.backgroundElement,
            color: colors.text,
          },
          props.style,
        ]}
        placeholderTextColor={colors.textSecondary}
      />
      {error && <ThemedText type="small" style={styles.error}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 14,
  },
  error: {
    color: '#E63946',
  },
});

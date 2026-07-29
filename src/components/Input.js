import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { borderRadius, spacing, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function Input({
  label, icon, value, onChangeText, placeholder, secureTextEntry, error,
  keyboardType, autoCapitalize, multiline, containerStyle, inputStyle, rightIcon,
  onRightIconPress,
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View style={[
        styles.inputRow,
        { backgroundColor: colors.surfaceSecondary, borderColor: error ? colors.error : colors.border },
        multiline && styles.multiline,
      ]}>
        {icon && <Ionicons name={icon} size={20} color={colors.textLight} style={styles.leftIcon} />}
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            icon && { marginLeft: spacing.sm },
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {rightIcon && (
          <Ionicons name={rightIcon} size={20} color={colors.textLight} style={styles.rightIcon} onPress={onRightIconPress} />
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', marginBottom: spacing.sm, ...typography.caption },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1.5, paddingHorizontal: spacing.md },
  leftIcon: { marginRight: spacing.xs },
  rightIcon: { marginLeft: spacing.xs, padding: spacing.xs },
  input: { flex: 1, paddingVertical: 14, fontSize: 16 },
  multiline: { minHeight: 100, alignItems: 'flex-start' },
  multilineInput: { minHeight: 80 },
  error: { fontSize: 12, marginTop: spacing.xs, fontWeight: '500' },
});

// src/components/ui/AppInput.js
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

export default function AppInput({ 
  label, value, onChangeText, placeholder, error, icon, isPassword, multiline, numberOfLines, ...restProps 
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(isPassword);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && { borderColor: COLORS.primary }, // Рамка при фокусе
        error && { borderColor: COLORS.danger },      // Рамка при ошибке
        multiline && { height: 100, alignItems: 'flex-start' } // Для многострочного
      ]}>
        {icon && <Ionicons name={icon} size={20} color={COLORS.textSecondary} style={styles.leftIcon} />}
        
        <TextInput
          style={[styles.input, multiline && { textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={hidePassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...restProps}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
            <Ionicons name={hidePassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.textMain, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius,
    paddingHorizontal: 16, minHeight: 50,
  },
  leftIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.textMain, paddingVertical: 12 },
  errorText: { color: COLORS.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
});
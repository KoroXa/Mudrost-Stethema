// src/components/ui/AppButton.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

export default function AppButton({ 
  title, onPress, variant = 'primary', size = 'md', loading = false, disabled = false, leftIcon, style 
}) {
  // Определяем стили в зависимости от варианта
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary': return { bg: '#EAEAEA', text: COLORS.textMain, border: 'transparent' };
      case 'outline': return { bg: 'transparent', text: COLORS.textMain, border: COLORS.border };
      case 'danger': return { bg: '#DC2626', text: '#FFFFFF', border: 'transparent' };
      default: return { bg: COLORS.primary, text: '#FFFFFF', border: 'transparent' }; // primary
    }
  };

  // Определяем высоту и размер текста
  const getSizeStyle = () => {
    switch (size) {
      case 'sm': return { height: 40, fontSize: 14, paddingH: 12 };
      case 'lg': return { height: 60, fontSize: 18, paddingH: 24 };
      default: return { height: 50, fontSize: 16, paddingH: 16 }; // md
    }
  };

  const vStyle = getVariantStyle();
  const sStyle = getSizeStyle();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: vStyle.bg, borderColor: vStyle.border, borderWidth: 1, height: sStyle.height, paddingHorizontal: sStyle.paddingH },
        disabled && { opacity: 0.5 },
        style
      ]}
      onPress={disabled || loading ? null : onPress} // Блокируем нажатие, если loading или disabled
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={vStyle.text} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}
          <Text style={[styles.text, { color: vStyle.text, fontSize: sStyle.fontSize }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  text: { fontWeight: 'bold' },
  iconWrapper: { marginRight: 8 },
});
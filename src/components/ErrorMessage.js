// src/components/ErrorMessage.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={80} color={COLORS.textSecondary} />
      <Text style={styles.title}>Упс! Что-то пошло не так</Text>
      <Text style={styles.message}>{message}</Text>
      
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Ionicons name="refresh" size={20} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.retryText}>Повторить попытку</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  title: {
    fontSize: 20, fontWeight: 'bold', color: COLORS.textMain, marginTop: 20, marginBottom: 10,
  },
  message: {
    fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 30, lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 14,
    paddingHorizontal: 24, borderRadius: SIZES.radius, alignItems: 'center',
  },
  retryText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
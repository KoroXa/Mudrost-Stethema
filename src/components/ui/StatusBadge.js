// src/components/ui/StatusBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Служебная функция для цветов (как в ТЗ)
const getStatusConfig = (status) => {
  switch (status.toLowerCase()) {
    case 'pending': return { bg: '#FEF3C7', text: '#D97706', label: 'Ожидает' };
    case 'in_progress': return { bg: '#DBEAFE', text: '#2563EB', label: 'В работе' };
    case 'completed': return { bg: '#DCFCE7', text: '#16A34A', label: 'Готово' };
    case 'cancelled': return { bg: '#FEE2E2', text: '#DC2626', label: 'Отменено' };
    default: return { bg: '#F3F4F6', text: '#4B5563', label: status }; // По умолчанию для тегов
  }
};

export default function StatusBadge({ status }) {
  const config = getStatusConfig(status);
  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: 'bold' },
});
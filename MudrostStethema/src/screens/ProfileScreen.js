// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useQuoteStore } from '../store/useQuoteStore'; // <-- ИМПОРТ ZUSTAND

const SettingRow = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress}>
    <View style={styles.settingLeft}>
      <Ionicons name={icon} size={24} color={COLORS.textMain} style={styles.settingIcon} />
      <Text style={styles.settingText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { quotes } = useQuoteStore(); // <-- Берем из Zustand
  const savedCount = quotes.filter(q => q.isLiked).length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Профиль</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={60} color={COLORS.surface} />
        </View>
        <Text style={styles.userName}>Пользователь</Text>
        <Text style={styles.savedStats}>Сохранено {savedCount} цитат</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.settingsList}>
        <SettingRow icon="notifications-outline" title="Уведомления" onPress={() => alert('В разработке')} />
        <SettingRow icon="moon-outline" title="Тема" onPress={() => alert('В разработке')} />
        <SettingRow icon="stats-chart-outline" title="Статистика" onPress={() => alert('В разработке')} />
        <SettingRow icon="information-circle-outline" title="О приложении" onPress={() => alert('Mudrost-Stethema v1.0.0')} />
      </View>
    </ScrollView>
  );
}
// Стили оставляем без изменений
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textMain },
  headerSpacer: { width: 28 },
  profileInfo: { alignItems: 'center', paddingVertical: 24 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6C7A89', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  userName: { fontSize: 22, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 4 },
  savedStats: { fontSize: 14, color: COLORS.textSecondary },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20, marginBottom: 16 },
  settingsList: { paddingHorizontal: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { marginRight: 16 },
  settingText: { fontSize: 16, color: COLORS.textMain },
});
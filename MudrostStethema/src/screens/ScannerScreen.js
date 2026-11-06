// src/screens/ScannerScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useQuoteStore } from '../store/useQuoteStore'; // <-- ИМПОРТ ZUSTAND
import QuoteCard from '../components/QuoteCard';

export default function ScannerScreen({ navigation }) {
  const { quotes, toggleLike } = useQuoteStore(); // <-- Берем из Zustand
  const favoriteQuotes = quotes.filter(q => q.isLiked);

  if (favoriteQuotes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Избранное</Text>
        </View>
        <View style={styles.emptyContent}>
          <Ionicons name="heart-outline" size={100} color={COLORS.textMain} />
          <Text style={styles.emptyText}>Вы еще не сохранили{"\n"}ни одной цитаты</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Главная')}>
            <Text style={styles.primaryButtonText}>На главную</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Избранное</Text>
      </View>
      <FlatList
        data={favoriteQuotes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <QuoteCard 
            item={item} 
            onPress={() => navigation.navigate('Detail', { quote: item })}
            onLikePress={() => toggleLike(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}
// Стили оставляем без изменений (те, что были раньше)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  emptyContainer: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.textMain },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 18, color: COLORS.textMain, textAlign: 'center', marginTop: 20, marginBottom: 40, lineHeight: 26 },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingVertical: 16, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
});
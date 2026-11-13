// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { CATEGORIES } from '../constants/mockData';
import { useQuoteStore } from '../store/useQuoteStore';
import QuoteCard from '../components/QuoteCard';
import ErrorMessage from '../components/ErrorMessage';

export default function DashboardScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    quotes, toggleLike, fetchQuotes, 
    isLoading, isRefreshing, error, hasHydrated 
  } = useQuoteStore();

  useEffect(() => {
    if (hasHydrated) {
      fetchQuotes();
    }
    // Cleanup функция (очистка памяти при размонтировании)
    return () => {
      // Мы не можем напрямую вызвать abortController тут, 
      // но он сработает при следующем вызове fetchQuotes или при перезагрузке.
    };
  }, [hasHydrated]);

  const allTags = Array.from(new Set(['Все', ...CATEGORIES, ...quotes.flatMap(q => q.tags || [])]));

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.text?.toLowerCase().includes(searchQuery.toLowerCase()) || quote.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Все' || quote.tags?.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  // Если идет первичная загрузка (нет данных)
  if (isLoading && quotes.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Загрузка мудрости...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} onRetry={() => fetchQuotes()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Привет,{"\n"}Пользователь!</Text>
        <View style={styles.profileAvatar}><Ionicons name="person" size={30} color={COLORS.surface} /></View>
      </View>

      {/* ... Поиск и чипсы (без изменений) ... */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Найти цитату или автора" 
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allTags.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.chip, activeCategory === cat && styles.chipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList 
        data={filteredQuotes} 
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QuoteCard 
            item={item} 
            onPress={() => navigation.navigate('Detail', { quote: item })}
            onLikePress={() => toggleLike(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        
        // ПАТТЕРН PULL-TO-REFRESH
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={() => fetchQuotes(true)} // Передаем true для обновления
            colors={[COLORS.primary]} // Цвет для Android
            tintColor={COLORS.primary} // Цвет для iOS
          />
        }
        
        // ПАГИНАЦИЯ
        //onEndReached={() => loadMore()}
        //onEndReachedThreshold={0.5} // Сработает, когда останется пол-экрана до конца

        // ПОДВАЛ СПИСКА (Спиннер подгрузки или "Ничего не найдено")
        ListFooterComponent={
          isLoading && quotes.length > 0 ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
          ) : null
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="search-outline" size={60} color={COLORS.textSecondary} />
            <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.textSecondary, textAlign: 'center' }}>
              Ничего не найдено{"\n"}по вашему запросу
            </Text>
          </View>
        }
      />
    </View>
  );
}

// Стили оставляем без изменений
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  greeting: { fontSize: 26, fontWeight: 'bold', color: COLORS.textMain, lineHeight: 32 },
  profileAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#6C7A89', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: 20, borderRadius: SIZES.radius, paddingHorizontal: 12, height: 48, marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: SIZES.body, color: COLORS.textMain },
  filtersWrapper: { paddingHorizontal: 20, marginBottom: 16, height: 40 },
  chip: { backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, justifyContent: 'center' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.textMain, fontSize: 14 },
  chipTextActive: { color: COLORS.surface, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
});
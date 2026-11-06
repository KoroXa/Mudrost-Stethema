// src/components/QuoteCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { getLocalAvatar } from '../constants/localAvatars'; 

export default function QuoteCard({ item, onPress, onLikePress }) {
  // Ищем локальную картинку
  const avatarSource = getLocalAvatar(item.author);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        
        {/* Если картинка есть — показываем её, иначе иконку */}
        {avatarSource ? (
          <Image source={avatarSource} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color={COLORS.surface} />
          </View>
        )}
        
        <Text style={styles.authorName}>{item.author}</Text>
        
        <TouchableOpacity onPress={onLikePress}>
          <Ionicons 
            name={item.isLiked ? 'heart' : 'heart-outline'} 
            size={24} 
            color={item.isLiked ? COLORS.primary : COLORS.textMain} 
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.quoteText}>"{item.text}"</Text>

      <View style={styles.tagsContainer}>
        {item.tags?.map((tag, index) => (
          <View key={index} style={styles.tagBadge}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarImage: { width: 36, height: 36, borderRadius: 18, marginRight: 10, backgroundColor: '#E0E0E0' },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6C7A89', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  authorName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: COLORS.textMain },
  quoteText: { fontSize: 16, fontStyle: 'italic', color: COLORS.textMain, lineHeight: 24, marginBottom: 16 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBadge: { backgroundColor: '#EAEAEA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12, color: COLORS.textSecondary },
});
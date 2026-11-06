// src/screens/DetailScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity, 
  Share, 
  Image // <-- Добавили Image для аватарок
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SIZES } from '../constants/theme';
import { useQuoteStore } from '../store/useQuoteStore';
import { getLocalAvatar } from '../constants/localAvatars'; // <-- ИМПОРТ

export default function DetailScreen({ route, navigation }) {
  const { quotes, toggleLike } = useQuoteStore();
  const currentQuote = quotes.find(q => q.id === route.params?.quote?.id) || route.params?.quote;
  
  if (!currentQuote) return null; // Защита

  const avatarSource = getLocalAvatar(currentQuote.author); // <-- Ищем фото

  const handleCopy = async () => {
    await Clipboard.setStringAsync(`"${currentQuote.text}" — ${currentQuote.author}\nИсточник: ${currentQuote.sourceUrl || 'Неизвестно'}`);
    alert('Цитата скопирована!');
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `"${currentQuote.text}" — ${currentQuote.author}` });
    } catch (error) { console.log(error.message); }
  };

  return (
        <ImageBackground 
      // Если есть своя обложка — используем её, иначе стандартный фон
      source={currentQuote.coverImage 
        ? { uri: currentQuote.coverImage } 
        : { uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop' }
      } 
      style={styles.background}
    >
      <View style={styles.overlay}>
        {/* Кнопка Назад */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Текст цитаты */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>“{currentQuote.text}”</Text>
          <Text style={styles.quoteAuthor}>— {"\n"}{currentQuote.author}</Text>
        </View>

        {/* Нижняя панель */}
        <View style={styles.bottomPanel}>
          
          <View style={styles.authorInfo}>
            {/* ВЫВОДИМ ЛОКАЛЬНУЮ КАРТИНКУ */}
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatarImageBottom} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color={COLORS.surface} />
              </View>
            )}
            
            <View style={styles.authorTextContainer}>
              <Text style={styles.authorNameBottom}>{currentQuote.author}</Text>
              <Text style={styles.authorBio} numberOfLines={2}>
                {currentQuote.authorBio || 'Великий мыслитель.'}
              </Text>
            </View>
          </View>

          {/* Кнопки действий (Копировать, Поделиться) */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
              <Ionicons name="copy-outline" size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Скопировать</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              <Text style={styles.actionText}>Поделиться</Text>
            </TouchableOpacity>
          </View>

          {/* Главная кнопка */}
          <TouchableOpacity 
            style={[styles.primaryButton, currentQuote.isLiked && { backgroundColor: '#444' }]} 
            onPress={() => toggleLike(currentQuote.id)}
          >
            <Text style={styles.primaryButtonText}>
              {currentQuote.isLiked ? 'Удалить из избранного' : 'Добавить в избранное'}
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Легкое затемнение фона
    paddingTop: 60,
  },
  backButton: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  quoteText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 44,
  },
  quoteAuthor: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  bottomPanel: {
    backgroundColor: 'rgba(30,30,30,0.85)', // Темная полупрозрачная плашка
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  // Стиль для скачанной аватарки
  avatarImageBottom: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: '#E0E0E0',
  },
  // Стиль заглушки, если аватарки нет
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6C7A89',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  authorTextContainer: {
    flex: 1,
  },
  authorNameBottom: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  authorBio: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
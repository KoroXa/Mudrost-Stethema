// src/screens/FormScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  KeyboardAvoidingView, Platform, Modal, Image, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // <-- ИМПОРТ БИБЛИОТЕКИ
import { COLORS, SIZES } from '../constants/theme';
import { useQuoteStore } from '../store/useQuoteStore';

const DEFAULT_CATEGORIES = ['Мотивация', 'Философия', 'Успех', 'Наука', 'Жизнь', 'Мем', 'Политика'];

export default function FormScreen({ navigation }) {
  const [quoteText, setQuoteText] = useState('');
  const [author, setAuthor] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [coverImage, setCoverImage] = useState(null); // <-- Состояние для обложки
  const [selectedTags, setSelectedTags] = useState([]); 
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState(DEFAULT_CATEGORIES);

  const addQuote = useQuoteStore((state) => state.addQuote); 

  // Функция выбора картинки из галереи
  const pickImage = async () => {
    // Запрашиваем разрешение на доступ к галерее
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нам нужен доступ к галерее, чтобы выбрать обложку!');
      return;
    }

    // Открываем галерею
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Разрешаем обрезать
      aspect: [4, 3],      // Пропорции как у обложки
      quality: 0.7,        // Сжимаем картинку, чтобы не занимала много места
    });

    // Если пользователь выбрал фото (не нажал "Отмена")
    if (!result.canceled) {
      setCoverImage(result.assets[0].uri); // Сохраняем путь к фото
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag));
    else setSelectedTags([...selectedTags, tag]);
  };

  const handleAddCustomTag = () => {
    const cleanTag = newTagInput.trim();
    if (cleanTag && !availableTags.includes(cleanTag)) {
      setAvailableTags([...availableTags, cleanTag]);
      setSelectedTags([...selectedTags, cleanTag]);
      setNewTagInput('');
    }
  };

  const handleSave = () => {
    if (!quoteText || !author) {
      alert('Заполните текст цитаты и автора!');
      return;
    }
    if (selectedTags.length === 0) {
      alert('Выберите хотя бы один тег!');
      return;
    }
    
    // Передаем coverImage в хранилище
    addQuote({ 
      text: quoteText, 
      author: author, 
      tags: selectedTags,
      sourceUrl: sourceUrl,
      coverImage: coverImage // <-- ДОБАВЛЯЕМ ОБЛОЖКУ
    });
    
    alert('Цитата сохранена!');
    
    // Сброс формы
    setQuoteText('');
    setAuthor('');
    setSourceUrl('');
    setCoverImage(null);
    setSelectedTags([]); 
    navigation.navigate('Главная');
  };

  const renderDropdown = () => (
    <Modal transparent={true} visible={isPickerVisible} animationType="fade" onRequestClose={() => setPickerVisible(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setPickerVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Выберите теги</Text>
          
          <View style={styles.addTagRow}>
            <TextInput 
              style={styles.addTagInput}
              placeholder="Свой тег..."
              placeholderTextColor={COLORS.textSecondary}
              value={newTagInput}
              onChangeText={setNewTagInput}
              onSubmitEditing={handleAddCustomTag}
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={handleAddCustomTag}>
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 200 }}>
            {availableTags.map((item) => {
              const isSelected = selectedTags.includes(item);
              return (
                <TouchableOpacity key={item} style={styles.modalItem} onPress={() => toggleTag(item)}>
                  <Text style={[styles.modalItemText, isSelected && styles.modalItemTextActive]}>{item}</Text>
                  {isSelected && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.closeModalBtn} onPress={() => setPickerVisible(false)}>
             <Text style={styles.closeModalText}>Готово</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Добавить цитату</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Текст цитаты</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Введите текст цитаты..." 
          placeholderTextColor={COLORS.textSecondary} 
          multiline 
          numberOfLines={4} 
          value={quoteText} 
          onChangeText={setQuoteText} 
          textAlignVertical="top" 
        />

        <Text style={styles.label}>Автор</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Например: Конфуций" 
          placeholderTextColor={COLORS.textSecondary} 
          value={author} 
          onChangeText={setAuthor} 
        />

        <Text style={styles.label}>Ссылка на источник (необязательно)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="https://..." 
          placeholderTextColor={COLORS.textSecondary} 
          value={sourceUrl} 
          onChangeText={setSourceUrl} 
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.label}>Теги</Text>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setPickerVisible(true)}>
          <Text style={styles.dropdownText} numberOfLines={1}>
            {selectedTags.length > 0 ? selectedTags.join(', ') : 'Выберите теги...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.textMain} />
        </TouchableOpacity>

        {/* БЛОК ЗАГРУЗКИ ОБЛОЖКИ */}
        <Text style={styles.label}>Обложка (необязательно)</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {coverImage ? (
            // Если картинка выбрана, показываем её превью
            <View style={styles.previewContainer}>
              <Image source={{ uri: coverImage }} style={styles.previewImage} />
              <View style={styles.previewOverlay}>
                <Ionicons name="pencil" size={24} color="#FFF" />
                <Text style={styles.previewText}>Изменить фото</Text>
              </View>
            </View>
          ) : (
            // Если нет — показываем заглушку
            <Text style={styles.uploadText}>Загрузить изображение</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Сохранить</Text>
        </TouchableOpacity>
      </View>
      {renderDropdown()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.background },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMain },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  label: { fontSize: 16, fontWeight: '500', color: COLORS.textMain, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, paddingHorizontal: 16, height: 50, fontSize: 15, color: COLORS.textMain },
  textArea: { height: 100, paddingTop: 12, paddingBottom: 12 },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, paddingHorizontal: 16, height: 50 },
  dropdownText: { fontSize: 15, color: COLORS.textMain },
  
  uploadBox: { height: 150, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', borderRadius: SIZES.radius, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, marginBottom: 20, overflow: 'hidden' },
  uploadText: { color: COLORS.textSecondary, fontSize: 14 },
  
  // Стили для превью картинки
  previewContainer: { width: '100%', height: '100%' },
  previewImage: { width: '100%', height: '100%' },
  previewOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  previewText: { color: '#FFF', marginLeft: 8, fontSize: 14, fontWeight: 'bold' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, height: 56, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: COLORS.surface, borderRadius: SIZES.radius, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: COLORS.textMain },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
  modalItemText: { fontSize: 16, color: COLORS.textMain },
  modalItemTextActive: { color: COLORS.primary, fontWeight: 'bold' },
  closeModalBtn: { marginTop: 16, backgroundColor: COLORS.primary, padding: 12, borderRadius: SIZES.radius, alignItems: 'center' },
  closeModalText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  addTagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  addTagInput: { flex: 1, height: 44, borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius, paddingHorizontal: 12, marginRight: 8, color: COLORS.textMain },
  addTagBtn: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: SIZES.radius, justifyContent: 'center', alignItems: 'center' }
});
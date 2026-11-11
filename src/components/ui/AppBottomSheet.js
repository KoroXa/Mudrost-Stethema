// src/components/ui/AppBottomSheet.js
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';

export default function AppBottomSheet({ visible, onClose, title, children }) {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide" // Анимация выезда снизу
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Затемненный фон (Backdrop). Клик по нему закрывает шторку */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPressOut={onClose} />
        
        {/* Сама шторка */}
        <View style={styles.sheetContainer}>
          {/* Индикатор свайпа */}
          <View style={styles.dragIndicator} />
          
          {/* Шапка */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
          </View>

          {/* Контент */}
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }, // Прозрачность 50%
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  dragIndicator: {
    width: 40, height: 5, backgroundColor: '#E0E0E0',
    borderRadius: 3, alignSelf: 'center', marginBottom: 15,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMain },
  closeBtn: { padding: 4 },
  content: { paddingBottom: 20 },
});
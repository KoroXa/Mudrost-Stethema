// src/screens/LoginScreen.js
import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../constants/theme';
import AppButton from '../components/ui/AppButton'; // Наша новая кнопка
import AppInput from '../components/ui/AppInput';   // Наш новый инпут

export default function LoginScreen({ navigation }) {
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.title}>Цитаты{"\n"}и аффирмации</Text>

      <View style={styles.formContainer}>
        <AppInput 
          placeholder="Email или логин" 
          icon="mail-outline" 
          keyboardType="email-address" 
        />
        
        <AppInput 
          placeholder="Пароль" 
          icon="lock-closed-outline" 
          isPassword={true} 
        />

        <AppButton 
          title="Войти" 
          variant="primary" 
          size="lg" 
          onPress={() => navigation.replace('MainApp')} 
          style={{ marginTop: 10 }}
        />

        <AppButton 
          title="Войти как гость" 
          variant="outline" 
          size="lg" 
          onPress={() => navigation.replace('MainApp')} 
          style={{ marginTop: 12 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 32, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: 'bold', color: COLORS.textMain, textAlign: 'center', marginBottom: 40, lineHeight: 40 },
  formContainer: { width: '100%' },
});
// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import { supabase } from '../lib/supabase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setLoading(true);
    // Настоящий вход через базу данных Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Ошибка входа', error.message);
    } else {
      navigation.replace('MainApp'); // Вход успешен
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.title}>Цитаты{"\n"}и аффирмации</Text>
      
      <View style={styles.formContainer}>
        <AppInput 
          placeholder="Email" 
          icon="mail-outline" 
          keyboardType="email-address" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none" 
        />
        <AppInput 
          placeholder="Пароль" 
          icon="lock-closed-outline" 
          isPassword={true} 
          value={password} 
          onChangeText={setPassword} 
        />
        
        <AppButton 
          title="Войти" 
          variant="primary" 
          size="lg" 
          onPress={signInWithEmail} 
          loading={loading} 
          style={{ marginTop: 20 }} 
        />
        
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 16 }}>
          <Text style={styles.registerText}>Нет аккаунта? Зарегистрироваться</Text>
        </TouchableOpacity>

        
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 32, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: 'bold', color: COLORS.textMain, textAlign: 'center', marginBottom: 40, lineHeight: 40 },
  formContainer: { width: '100%' },
  registerText: { textAlign: 'center', marginTop: 16, color: COLORS.textSecondary, fontSize: 14 },
});
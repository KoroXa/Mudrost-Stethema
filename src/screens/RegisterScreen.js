// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import { supabase } from '../lib/supabase';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Ошибка регистрации', error.message);
    } else {
      Alert.alert('Успех!', 'Аккаунт создан. Теперь вы можете войти.');
      navigation.navigate('Login'); 
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.title}>Регистрация</Text>
      
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
          placeholder="Пароль (минимум 6 символов)" 
          icon="lock-closed-outline" 
          isPassword={true}
          value={password}
          onChangeText={setPassword}
        />
        
        <AppButton 
          title="Создать аккаунт" 
          variant="primary" 
          size="lg" 
          onPress={signUpWithEmail} 
          loading={loading}
          style={{ marginTop: 20 }}
        />
        
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={styles.linkText}>Уже есть аккаунт? Войти</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 32, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: 'bold', color: COLORS.textMain, textAlign: 'center', marginBottom: 40 },
  formContainer: { width: '100%' },
  linkText: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14 },
});
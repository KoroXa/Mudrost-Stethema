// src/screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ImageBackground } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

export default function SplashScreen({ navigation }) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    ).start();

    // УВЕЛИЧИЛИ ТАЙМЕР до 5000мс (5 секунд)
    const timer = setTimeout(() => {
      navigation.replace('Login'); 
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <ImageBackground 
      source={require('../../assets/statham.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>ЦИТАТЫ</Text>
          <Text style={styles.title}>И</Text>
          <Text style={[styles.title, styles.underline]}>АФФИРМАЦИИ</Text>
        </View>

        <View style={styles.bottomContent}>
          <Text style={styles.loadingText}>загрузка</Text>
          
          <Animated.Image
            source={require('../../assets/statham_avatar.png')} 
            style={[styles.avatar, { transform: [{ rotate: spin }] }]}
            resizeMode="cover" 
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: { alignItems: 'center' },
  title: {
    fontSize: 32, fontWeight: '900', color: COLORS.primary,
    textAlign: 'center', lineHeight: 40,
  },
  underline: { textDecorationLine: 'underline' },
  bottomContent: { position: 'absolute', bottom: 50, alignItems: 'center' },
  loadingText: {
    color: '#FFFFFF', fontSize: SIZES.body, marginBottom: 10, fontWeight: 'bold',
  },
  avatar: {
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    // УБРАЛИ БЕЛУЮ ОБВОДКУ (borderWidth и borderColor)
  }
});
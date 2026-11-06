import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const DRINKS = [
  {
    id: 1,
    name: 'Капучино',
    price: 250,
    image: require('./assets/images/cappuccino.png'),
  },
  {
    id: 2,
    name: 'Латте',
    price: 280,
    image: require('./assets/images/latte.png'),
  },
  {
    id: 3,
    name: 'Эспрессо',
    price: 180,
    image: require('./assets/images/espresso.png'),
  },
];

export default function BaristaScreen() {
  const [counts, setCounts] = useState({ 1: 0, 2: 0, 3: 0 });

  const changeCount = (id, delta) => {
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta),
    }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Каталог напитков</Text>

      {DRINKS.map((drink) => (
        <View key={drink.id} style={styles.card}>
          <Image source={drink.image} style={styles.image} />
          <View style={styles.info}>
            <Text style={styles.name}>{drink.name}</Text>
            <Text style={styles.price}>{drink.price} ₽</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => changeCount(drink.id, -1)}
              >
                <Text style={styles.counterText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.countValue}>{counts[drink.id]}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => changeCount(drink.id, 1)}
              >
                <Text style={styles.counterText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  content: {
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3E2723',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#EEE',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3E2723',
  },
  price: {
    fontSize: 16,
    color: '#8D6E63',
    marginTop: 4,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#6D4C41',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  countValue: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    color: '#3E2723',
  },
});
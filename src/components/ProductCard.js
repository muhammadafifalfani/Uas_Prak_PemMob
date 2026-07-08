import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';

export default function ProductCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: item.thumbnail }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.category}>{item.category.toUpperCase()}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#fff', margin: 8, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f2f6', elevation: 2 },
  image: { width: '100%', height: 120, backgroundColor: '#f8f9fa' },
  info: { padding: 10 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50' },
  category: { fontSize: 10, color: '#7f8c8d', marginVertical: 2 },
  price: { fontSize: 14, fontWeight: '700', color: '#2ecc71' },
});
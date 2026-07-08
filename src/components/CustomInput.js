import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';

export default function CustomInput({ label, error, ...props }) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput style={[styles.input, error && styles.inputError]} {...props} />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16, width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#2c3e50', marginBottom: 6 },
  input: { width: '100%', height: 48, borderWidth: 1, borderColor: '#dcdde1', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
  inputError: { borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontSize: 12, marginTop: 4 },
});
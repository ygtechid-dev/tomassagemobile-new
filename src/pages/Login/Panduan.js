import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import WebView from 'react-native-webview';

const Panduan = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Tombol Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Judul */}
      <Text style={styles.title}>Panduan</Text>

      {/* WebView */}
      <View style={styles.webviewContainer}>
        <WebView source={{ uri: 'https://berkaniaga.id/panduan' }} />
      </View>

      {/* Tombol Continue */}
      <Button
        mode="contained"
        style={styles.continueButton}
        onPress={() => navigation.push('SetPasswordScreen')}
      >
        Saya Sudah Membaca Panduan
      </Button>
    </View>
  );
};

export default Panduan;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Supaya WebView bisa tampil penuh
    backgroundColor: 'white',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  webviewContainer: {
    flex: 1, // Supaya WebView memenuhi sisa layar
    width: '100%',
    marginBottom: 20,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#20B2AA',
    borderRadius: 10,
    paddingVertical: 8,
  },
});

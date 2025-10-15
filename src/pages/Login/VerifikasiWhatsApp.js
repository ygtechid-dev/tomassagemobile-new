import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Text, Button, Modal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const VerifikasiWhatsApp = ({ navigation }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [visibleSuccess, setVisibleSuccess] = useState(false)
  
  // Fungsi untuk menangani input OTP
  const handleOtpChange = (text, index) => {
    if (text.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
    }
  };


  return (
    <>
    <View style={styles.container}>
      {/* Tombol Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Judul */}
      <Text style={styles.title}>Verifikasi</Text>

      {/* Sub Judul */}
      <Text style={styles.subtitle}>
        Kode OTP sudah dikirim ke nomor{' '}
      </Text>
      <Text style={styles.phoneNumber}>(480) 555-0103</Text>

      {/* OTP Input Manual */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpBox}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
          />
        ))}
      </View>

      {/* Kirim Ulang */}
      <TouchableOpacity>
        <Text style={styles.resendText}>
          Belum mendapatkan kode? <Text style={styles.resendLink}>Kirim Ulang</Text>
        </Text>
      </TouchableOpacity>

      {/* Tombol Continue */}
      <Button
        mode="contained"
        style={styles.continueButton}
        onPress={() => setVisibleSuccess(true)}
      >
        Verifikasi
      </Button>
    </View>

    <Modal visible={visibleSuccess}>
        <View style={{backgroundColor: 'white', alignSelf: 'center', width: 300,  height: 300, borderRadius: 16, marginTop: -30, alignItems: 'center', padding: 20}}>
          <Image source={{uri: 'https://ygtechdev.my.id/files/photo-1740033172144-827796569.png'}} style={{width: 80, height: 80}}/>
          <Text style={[styles.title, {
            fontSize: 18
          }]}>Berhasil Masuk!</Text>
 <Text style={[styles.subtitle, {
            marginTop: -5
          }]}>Selamat Bekerja, Mitra!</Text>

<Button mode="contained" style={styles.button} onPress={() => navigation.push('Home')}>
    Masuk
      </Button>
        </View>
    </Modal>
    
    </>
  );
};

export default VerifikasiWhatsApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#2ABCB4',
    padding: 8,
    borderRadius: 20,
    marginTop: 12
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    marginTop: 10
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 40
  },
  phoneNumber: {
    color: '#20B2AA', // Warna Tosca
    fontWeight: 'bold',
    marginTop: -10,
    marginBottom: 24
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginBottom: 20,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#20B2AA',
    borderRadius: 8,
marginRight: 8,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#20B2AA',
    marginLeft: -5
  },
  resendText: {
    fontSize: 14,
    color: 'gray',
    marginTop: 20,
  },
  resendLink: {
    color: '#20B2AA',
    fontWeight: 'bold',
  },
  continueButton: {
    width: '100%',
    marginTop: 30,
    backgroundColor: '#20B2AA',
    borderRadius: 10,
    paddingVertical: 8,
  },
});

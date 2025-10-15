import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Image, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Text, Button, Modal, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_URL, API_URL_WA } from '../../context/APIUrl';

const VerifWAReg = ({ navigation, route }) => {
  // Ambil data dari parameter route yang dikirim dari halaman Register
  const { nomor_wa, user_id, otp } = route.params;
  
  // State untuk input OTP
  const [inputOtp, setInputOtp] = useState(['', '', '', '', '', '']);
  const [visibleSuccess, setVisibleSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Refs untuk TextInput OTP untuk navigasi otomatis
  const inputRefs = useRef([]);
  
  // Effect untuk countdown pada fitur resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);
  
  // Format nomor telepon untuk display
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Hapus awalan 62 dan tambahkan format (xxx) xxx-xxxx
    const cleaned = phone.replace(/^62/, '0');
    if (cleaned.length > 10) {
      const areaCode = cleaned.substring(0, 4);
      const middlePart = cleaned.substring(4, 7);
      const lastPart = cleaned.substring(7, 11);
      return `(${areaCode}) ${middlePart}-${lastPart}`;
    }
    return cleaned;
  };
  
  // Fungsi untuk menangani input OTP
  const handleOtpChange = (text, index) => {
    if (text.length <= 1) {
      const newOtp = [...inputOtp];
      newOtp[index] = text;
      setInputOtp(newOtp);
      
      // Auto focus ke input berikutnya jika ada input
      if (text !== '' && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };
  
  // Fungsi untuk handle backspace key pada input OTP
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && inputOtp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  
  // Fungsi untuk kirim ulang OTP
  const handleResendOTP = async () => {
    try {
      setResendDisabled(true);
      setCountdown(60); // Set countdown 60 detik
      
      // Generate OTP baru
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Kirim pesan WhatsApp dengan kode OTP baru
      await axios.post(`${API_URL_WA}/sendMessage`, {
        remoteJid: nomor_wa + "@s.whatsapp.net",
        text: `*PESAN VERIFIKASI TOMASSAGE APP*\n\nBerikut adalah Kode OTP anda ${newOTP}. Jangan Berikan Kode ini Kepada Siapapun!`
      });
      
      // Update OTP di route params (tidak bisa langsung, perlu state management)
      // Untuk sementara kita simpan di variabel global
      global.currentOTP = newOTP;
      
      Alert.alert('Sukses', 'Kode OTP baru telah dikirim ke WhatsApp Anda');
    } catch (error) {
      console.error('Error mengirim ulang OTP:', error);
      Alert.alert('Error', 'Gagal mengirim ulang kode OTP');
      setResendDisabled(false);
      setCountdown(0);
    }
  };
  
  // Fungsi untuk verifikasi OTP
  const verifyOTP = async () => {
    const enteredOtp = inputOtp.join('');
    
    // Validasi jika OTP belum lengkap
    if (enteredOtp.length !== 6) {
      Alert.alert('Error', 'Mohon masukkan 6 digit kode OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      // Periksa OTP dari route params atau dari global state jika ada resend
      const correctOtp = global.currentOTP || otp;
      
      if (enteredOtp === correctOtp) {
        // Jika OTP benar, tampilkan modal sukses
        setVisibleSuccess(true);
      } else {
        // Jika OTP salah, tampilkan pesan error
        Alert.alert('Error', 'Kode OTP yang Anda masukkan salah. Silakan coba lagi.');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat memverifikasi OTP');
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header dengan Tombol Back */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Verifikasi OTP</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.contentContainer}>
          {/* Ilustrasi OTP */}
          <Image 
            source={{uri: 'https://ygtechdev.my.id/uploads/otp-illustration.png'}}
            style={styles.otpIllustration}
            // defaultSource={require('../../assets/otp-placeholder.png')}
          />

          {/* Sub Judul */}
          <Text style={styles.subtitle}>
            Masukkan kode 6 digit yang dikirim ke nomor
          </Text>
          <Text style={styles.phoneNumber}>{formatPhoneNumber(nomor_wa)}</Text>

          {/* OTP Input Manual */}
          <View style={styles.otpContainer}>
            {inputOtp.map((digit, index) => (
              <TextInput
                key={index}
                ref={el => inputRefs.current[index] = el}
                style={[
                  styles.otpBox, 
                  digit ? styles.otpBoxFilled : null
                ]}
                keyboardType="numeric"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          {/* Kirim Ulang */}
          <TouchableOpacity 
            onPress={handleResendOTP}
            disabled={resendDisabled}
            style={styles.resendContainer}
          >
            <Text style={styles.resendText}>
              Belum mendapatkan kode? {' '}
              <Text style={[
                styles.resendLink, 
                resendDisabled && styles.resendDisabled
              ]}>
                {resendDisabled ? `Kirim Ulang (${countdown}s)` : 'Kirim Ulang'}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Tombol Continue */}
          <Button
            mode="contained"
            style={styles.continueButton}
            contentStyle={styles.buttonContent}
            onPress={verifyOTP}
            loading={loading}
            disabled={loading}
          >
            Verifikasi
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* Modal Sukses */}
      <Modal visible={visibleSuccess} dismissable={false}>
        <View style={styles.modalContainer}>
          <Image 
            source={{uri: 'https://ygtechdev.my.id/files/photo-1740033172144-827796569.png'}} 
            style={styles.successImage}
          />
          <Text style={styles.modalTitle}>
            Berhasil Daftar!
          </Text>
          <Text style={styles.modalSubtitle}>
            Selamat Datang di Aplikasi ToMassage
          </Text>

          <Button 
            mode="contained" 
            style={styles.modalButton}
            contentStyle={styles.buttonContent}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })}
          >
            Masuk
          </Button>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VerifWAReg;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginTop: -5
  },
  otpIllustration: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#20B2AA',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 30,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 12,
    marginHorizontal: 5,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#20B2AA',
    backgroundColor: '#F9F9F9',
  },
  otpBoxFilled: {
    borderColor: '#20B2AA',
    backgroundColor: 'rgba(32, 178, 170, 0.05)',
  },
  resendContainer: {
    marginTop: 10,
    padding: 10,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resendLink: {
    color: '#20B2AA',
    fontWeight: 'bold',
  },
  resendDisabled: {
    color: '#AAA',
  },
  continueButton: {
    width: '100%',
    marginTop: 30,
    backgroundColor: '#20B2AA',
    borderRadius: 12,
  },
  buttonContent: {
    
    height: 55,
  },
  modalContainer: {
    backgroundColor: 'white',
    alignSelf: 'center',
    width: 320,
    borderRadius: 20,
    alignItems: 'center',
    padding: 24,
    elevation: 5,
  },
  successImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#2ABCB4',
    borderRadius: 12,
  },
});
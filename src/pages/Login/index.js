import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, Linking } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../context/APIUrl';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Login = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Format nomor telepon (menambahkan 62 jika dimulai dengan 0)
  const formatPhone = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Hapus semua karakter non-digit
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // Jika dimulai dengan 0, ganti dengan 62
    if (digitsOnly.startsWith('0')) {
      return '62' + digitsOnly.substring(1);
    }
    
    // Jika dimulai dengan +62, ganti dengan 62
    if (digitsOnly.startsWith('62')) {
      return digitsOnly;
    }
    
    // Jika tidak dimulai dengan 0 atau 62, tambahkan 62 di depan
    return '62' + digitsOnly;
  };

  // Fungsi untuk validasi input
  const validateInput = () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Nomor handphone harus diisi');
      return false;
    }
    return true;
  };

  // Fungsi untuk memeriksa nomor handphone
  const checkPhoneNumber = async () => {
    if (!validateInput()) return;
    
    try {
      setLoading(true);
      const formattedPhone = formatPhone(phone);
      
      // Panggil API untuk memeriksa nomor
      const response = await axios.post(`${API_URL}/auth/login`, {
        nomor_wa: formattedPhone
      });
      
      if (response.data.success) {
        // Simpan data user sementara
        setUserData(response.data.data);
        
        // Jika mitra dengan status nonactive
        if (response.data.data.type === 'mitra' && response.data.data.status === 'nonactive') {
          Alert.alert(
            'Akun Belum Aktif',
            'Akun Mitra Anda sedang menunggu verifikasi admin. Silahkan cek status Anda nanti.'
          );
          setLoading(false);
          return;
        }
        
        // Tampilkan halaman password jika nomor ditemukan
        setShowPasswordModal(true);
      }
    } catch (error) {
      console.error('Error checking phone:', error.response);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat memeriksa nomor';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk login
  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Password harus diisi');
      return;
    }
    
    try {
      setLoading(true);
      const formattedPhone = formatPhone(phone);
      console.log('forphone', formattedPhone);
      
      // Panggil API login
      const response = await axios.post(`${API_URL}/auth/login`, {
        nomor_wa: formattedPhone,
        password: password
      });
      console.log('ressslog', response.data);
      
      if (response.data.success) {
        console.log('resss', response.data.data);
        
        // Simpan data user ke AsyncStorage
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data.data));
        
        // Navigasi ke halaman yang sesuai berdasarkan tipe user
        if (response.data.data.type === 'user') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomePageCust' }]
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error.response);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat login';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menangani lupa password
  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      const formattedPhone = formatPhone(phone);
      
      // Panggil API untuk cek nomor telepon terlebih dahulu
      const checkResponse = await axios.post(`${API_URL}/auth/check-phone`, {
        nomor_wa: formattedPhone
      });
      
      if (checkResponse.data.success) {
        // Jika nomor ditemukan, navigasi ke halaman reset password
        setShowPasswordModal(false);
        navigation.navigate('ForgotPassword', {
          phone: formattedPhone,
          userData: checkResponse.data.data
        });
      }
    } catch (error) {
      console.error('Error checking phone for reset:', error.response);
      const errorMessage = error.response?.data?.message || 'Nomor WhatsApp tidak terdaftar dalam sistem';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Tambahan: Fungsi untuk lupa password langsung dari halaman utama
  const handleDirectForgotPassword = () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Silahkan masukkan nomor handphone terlebih dahulu');
      return;
    }
    
    Alert.alert(
      'Reset Password',
      'Apakah Anda ingin mereset password untuk nomor ini?',
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Ya, Reset',
          onPress: async () => {
            try {
              setLoading(true);
              const formattedPhone = formatPhone(phone);
              
              // Cek nomor telepon terlebih dahulu
              const checkResponse = await axios.post(`${API_URL}/auth/check-phone`, {
                nomor_wa: formattedPhone
              });
              
              if (checkResponse.data.success) {
                // Navigasi ke halaman reset password
                navigation.navigate('ForgotPassword', {
                  phone: formattedPhone,
                  userData: checkResponse.data.data
                });
              }
            } catch (error) {
              console.error('Error:', error.response);
              const errorMessage = error.response?.data?.message || 'Nomor WhatsApp tidak terdaftar dalam sistem';
              Alert.alert('Error', errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Tampilan form nomor handphone
  const renderPhoneForm = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Selamat Datang</Text>
      <Text style={styles.infoTextAtas}>{'Silahkan Mengisi Nomor Handphone yang Sudah\nterdaftar'}</Text>

      {/* Input Nomor Handphone */}
      <Text style={styles.infoTextAtas}>{'Nomor Handphone'}</Text>

      <TextInput
        keyboardType="phone-pad"
        placeholder="Isi Nomor Handphone Anda"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
      />

      {/* Tombol Masuk */}
      <Button 
        mode="contained" 
        style={styles.button} 
        onPress={checkPhoneNumber}
        loading={loading}
        disabled={loading}
      >
        Masuk
      </Button>

      {/* Link Lupa Password */}
      <TouchableOpacity 
        onPress={handleDirectForgotPassword} 
        style={styles.forgotPasswordMainContainer}
        disabled={loading}
      >
        <Text style={styles.forgotPasswordMainText}>
          Lupa Password?
        </Text>
      </TouchableOpacity>
      
      {/* Link Register */}
      <TouchableOpacity 
        // onPress={() => navigation.push('Register')} 
        onPress={() => Linking.openURL('https://recruitment.tomassage.id')} 

        style={{flexDirection: 'row', alignSelf: 'center'}}
      >
        <Text style={[styles.infoTextAtas, {
          marginTop: 16,
          fontSize: 14
        }]}>{'Ingin Bergabung?'}</Text>
        <Text style={[styles.infoTextAtas, {
          marginTop: 16,
          fontSize: 14,
          marginLeft: 5,
          color: '#2ABCB4',
          fontWeight: 'bold'
        }]}>{'Daftar Sebagai Mitra'}</Text>
   

      </TouchableOpacity>
    </View>
  );

  // Tampilan form password
  const renderPasswordForm = () => (
    <View style={styles.container}>
      {/* Header dengan tombol back */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setShowPasswordModal(false)}
      >
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.passwordContainer}>
        <Text style={styles.title}>Masukkan Password</Text>
        
        <Text style={styles.infoTextAtas}>
          Silahkan masukkan password untuk akun{' '}
          <Text style={{color: '#2ABCB4', fontWeight: 'bold'}}>
            {userData?.nama_lengkap}
          </Text>
        </Text>
        
        <View style={styles.passwordInputContainer}>
          <TextInput
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Icon 
              name={passwordVisible ? 'visibility-off' : 'visibility'} 
              size={24} 
              color="#666"
            />
          </TouchableOpacity>
        </View>
        
        {/* Link Lupa Password di halaman password */}
        <TouchableOpacity 
          onPress={handleForgotPassword} 
          style={styles.forgotContainer}
          disabled={loading}
        >
          <Text style={styles.forgotText}>Lupa Password?</Text>
        </TouchableOpacity>
        
        <Button 
          mode="contained" 
          style={styles.button} 
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
        >
          Login
        </Button>
      </View>
    </View>
  );

  // Render kondisional berdasarkan state
  return showPasswordModal ? renderPasswordForm() : renderPhoneForm();
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 40,
    resizeMode: 'contain',
  },
  input: {
    width: '100%',
    marginBottom: 10,
    marginTop: -10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'grey',
    padding: 10
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 7,
    marginLeft: 10
  },
  infoText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 12,
    marginBottom: 20,
  },
  infoTextAtas: {
    color: 'gray',
    fontSize: 12,
    marginBottom: 20,
    marginLeft: 10, 
    marginTop: 8
  },
  button: {
    width: '100%',
    backgroundColor: '#2ABCB4',
    padding: 8,
    borderRadius: 20,
    marginTop: 12
  },
  loginText: {
    marginTop: 20,
    color: 'gray',
    fontSize: 14,
  },
  loginLink: {
    color: '#2ABCB4',
    fontWeight: 'bold',
  },
  passwordContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 30,
    width: '100%',
  },
  passwordInputContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'grey',
    padding: 10,
    marginTop: 10,
    paddingRight: 50, // Beri ruang untuk icon mata
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 17,
    padding: 5,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginRight: 10,
  },
  forgotText: {
    color: '#2ABCB4',
    fontSize: 12,
    fontWeight: 'bold',
  },
  forgotPasswordMainContainer: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  forgotPasswordMainText: {
    color: '#2ABCB4',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 10,
  },
});
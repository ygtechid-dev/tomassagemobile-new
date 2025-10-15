import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ScrollView, Dimensions, StatusBar } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, API_URL_WA } from '../../context/APIUrl';

const { width, height } = Dimensions.get('window');

const Register = ({navigation}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama_lengkap: '',
    nomor_wa: '',
    jenis_kelamin: 'Laki-laki',
    password: '',
    alamat_lengkap: '',
  });

  const handleRegister = async () => {
    // Validasi form
    if (!form.nama_lengkap.trim()) {
      Alert.alert('Peringatan', 'Nama lengkap wajib diisi');
      return;
    }
    
    if (!form.nomor_wa.trim()) {
      Alert.alert('Peringatan', 'Nomor WhatsApp wajib diisi');
      return;
    }
    
    if (!form.password.trim()) {
      Alert.alert('Peringatan', 'Password wajib diisi');
      return;
    }

    if (form.password.length < 6) {
      Alert.alert('Peringatan', 'Password minimal 6 karakter');
      return;
    }

    if (!form.alamat_lengkap.trim()) {
      Alert.alert('Peringatan', 'Alamat lengkap wajib diisi');
      return;
    }

    try {
      setLoading(true);
      
      // Format nomor WhatsApp (menambahkan 62 jika dimulai dengan 0)
      let formattedPhone = form.nomor_wa;
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.substring(1);
      }
      
      // Panggil API register (tidak mengirim alamat ke API)
      const response = await axios.post(`${API_URL}/users/register`, {
        nama_lengkap: form.nama_lengkap,
        jenis_kelamin: form.jenis_kelamin,
        nomor_wa: formattedPhone,
        password: form.password
      });
      
      setLoading(false);
      
      const generateOTP = () => {
        const digits = '0123456789';
        let OTP = '';
        
        for (let i = 0; i < 6; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        
        return OTP;
      };

      if (response.data.success) {
        const randomOTP = generateOTP();
        
        try {
          // Kirim pesan WhatsApp dengan kode OTP
          await axios.post(`${API_URL_WA}/sendMessage`, {
            remoteJid: formattedPhone + "@s.whatsapp.net",
            text: `*PESAN VERIFIKASI TOMASSAGE APP*\n\nBerikut adalah Kode OTP anda ${randomOTP}. Jangan Berikan Kode ini Kepada Siapapun!`
          });
        } catch (waError) {
          console.warn('WhatsApp service error:', waError);
          // Lanjutkan proses meskipun WA gagal
        }

        // Simpan data user ke AsyncStorage langsung
        const userData = {
          ...response.data.data,
          alamat_lengkap: form.alamat_lengkap,
          type: 'user' // Set sebagai user/customer
        };
        
        await AsyncStorage.setItem('user_data', JSON.stringify(userData));

        Alert.alert(
          '🎉 Pendaftaran Berhasil!', 
          'Selamat datang di ToMassage! Akun Anda telah berhasil dibuat.',
          [
            { 
              text: 'Mulai Sekarang', 
              onPress: () => {
                // Langsung navigasi ke HomePageCust
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'HomePageCust' }]
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Gagal', response.data.message || 'Pendaftaran gagal, silakan coba lagi');
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan pada server';
      Alert.alert('Error', errorMessage);
      console.error('Register error:', error);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1A7B76" />
      <View style={styles.container}>
        {/* Header dengan gradien visual */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Bergabung dengan ToMassage</Text>
            <Text style={styles.headerSubtitle}>Nikmati layanan massage terbaik di rumah Anda</Text>
          </View>
          
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </View>

        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            {/* Welcome Card */}
            <View style={styles.welcomeCard}>
              <Icon name="spa" size={48} color="#2ABCB4" style={styles.welcomeIcon} />
              <Text style={styles.welcomeTitle}>Mari Mulai!</Text>
              <Text style={styles.welcomeSubtitle}>Lengkapi informasi untuk membuat akun baru</Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              {/* Nama Lengkap */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Icon name="person-outline" size={18} color="#2ABCB4" /> Nama Lengkap
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Contoh: John Doe"
                    value={form.nama_lengkap}
                    onChangeText={(text) => setForm({ ...form, nama_lengkap: text })}
                    style={styles.input}
                    mode="flat"
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    theme={{
                      colors: {
                        primary: '#2ABCB4',
                        background: '#F8FFFE'
                      }
                    }}
                  />
                </View>
              </View>

              {/* Nomor WhatsApp */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Icon name="phone" size={18} color="#2ABCB4" /> Nomor WhatsApp
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Contoh: 08123456789"
                    keyboardType="phone-pad"
                    value={form.nomor_wa}
                    onChangeText={(text) => setForm({ ...form, nomor_wa: text })}
                    style={styles.input}
                    mode="flat"
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    theme={{
                      colors: {
                        primary: '#2ABCB4',
                        background: '#F8FFFE'
                      }
                    }}
                  />
                </View>
                <Text style={styles.inputHint}>Nomor ini akan digunakan untuk verifikasi akun</Text>
              </View>

              {/* Alamat Lengkap */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Icon name="location-on" size={18} color="#2ABCB4" /> Alamat Lengkap
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Jl. Contoh No. 123, RT/RW 01/02, Kelurahan, Kecamatan, Kota"
                    value={form.alamat_lengkap}
                    onChangeText={(text) => setForm({ ...form, alamat_lengkap: text })}
                    style={[styles.input, styles.addressInput]}
                    mode="flat"
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    multiline={true}
                    numberOfLines={3}
                    theme={{
                      colors: {
                        primary: '#2ABCB4',
                        background: '#F8FFFE'
                      }
                    }}
                  />
                </View>
              </View>

              {/* Jenis Kelamin */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Icon name="wc" size={18} color="#2ABCB4" /> Jenis Kelamin
                </Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.genderOption,
                      form.jenis_kelamin === 'Laki-laki' && styles.genderOptionSelected
                    ]}
                    onPress={() => setForm({ ...form, jenis_kelamin: 'Laki-laki' })}
                  >
                    <RadioButton
                      value="Laki-laki"
                      status={form.jenis_kelamin === 'Laki-laki' ? 'checked' : 'unchecked'}
                      color="#2ABCB4"
                    />
                    
                    <Text style={[
                      styles.genderText,
                      form.jenis_kelamin === 'Laki-laki' && styles.genderTextSelected
                    ]}>
                      Laki-laki
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.genderOption,
                      form.jenis_kelamin === 'Perempuan' && styles.genderOptionSelected
                    ]}
                    onPress={() => setForm({ ...form, jenis_kelamin: 'Perempuan' })}
                  >
                    <RadioButton
                      value="Perempuan"
                      status={form.jenis_kelamin === 'Perempuan' ? 'checked' : 'unchecked'}
                      color="#2ABCB4"
                    />
                  
                    <Text style={[
                      styles.genderText,
                      form.jenis_kelamin === 'Perempuan' && styles.genderTextSelected
                    ]}>
                      Perempuan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Icon name="lock-outline" size={18} color="#2ABCB4" /> Kata Sandi
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="Minimal 6 karakter"
                      secureTextEntry={!passwordVisible}
                      value={form.password}
                      onChangeText={(text) => setForm({ ...form, password: text })}
                      style={[styles.input, styles.passwordInput]}
                      mode="flat"
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      theme={{
                        colors: {
                          primary: '#2ABCB4',
                          background: '#F8FFFE'
                        }
                      }}
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
                </View>
                <View style={styles.passwordStrengthContainer}>
                  <Icon name="info-outline" size={14} color="#666" />
                  <Text style={styles.passwordHint}>
                    Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal
                  </Text>
                </View>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.registerButtonText}>Sedang Mendaftar...</Text>
                </View>
              ) : (
                <>
                  <Icon name="person-add" size={22} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.registerButtonText}>Daftar Sekarang</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Icon name="security" size={16} color="#666" />
              <Text style={styles.footerText}>
                Dengan mendaftar, Anda menyetujui{' '}
                <Text style={styles.linkText}>Syarat & Ketentuan</Text>
                {' '}dan{' '}
                <Text style={styles.linkText}>Kebijakan Privasi</Text>
                {' '}kami
              </Text>
            </View>

            {/* Login Link */}
            <TouchableOpacity 
              style={styles.loginLinkContainer}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Sudah punya akun? <Text style={styles.loginLink}>Masuk di sini</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F9',
  },
  header: {
    backgroundColor: '#2ABCB4',
    paddingTop: 16,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#2ABCB4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    zIndex: 2,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formContainer: {
    paddingHorizontal: 25,
    marginTop: 20,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeIcon: {
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  input: {
    backgroundColor: '#F8FFFE',
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E8F5F4',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  addressInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 55,
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 18,
    padding: 8,
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FFFE',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E8F5F4',
    flex: 1,
    justifyContent: 'center',
  },
  genderOptionSelected: {
    borderColor: '#2ABCB4',
    backgroundColor: 'rgba(42, 188, 180, 0.1)',
  },
  genderIcon: {
    marginLeft: 8,
    marginRight: 4,
  },
  genderText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: '#2ABCB4',
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#2ABCB4',
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2ABCB4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 25,
    marginTop: 10,
  },
  registerButtonDisabled: {
    backgroundColor: '#B0BEC5',
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 12,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 25,
    paddingHorizontal: 15,
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginLeft: 6,
    flex: 1,
  },
  linkText: {
    color: '#2ABCB4',
    fontWeight: 'bold',
    fontSize: 13,
  },
  loginLinkContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 30,
    backgroundColor: 'rgba(42, 188, 180, 0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(42, 188, 180, 0.2)',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    color: '#2ABCB4',
    fontWeight: 'bold',
  },
});

export default Register;
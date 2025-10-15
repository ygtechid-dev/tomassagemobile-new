import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../../context/APIUrl';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ForgotPassword = ({ navigation, route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Ambil data dari route params
  const { phone, userData } = route.params;

  // Validasi input
  const validateInput = () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Password baru harus diisi');
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi password tidak sama');
      return false;
    }

    return true;
  };

  // Fungsi untuk reset password
  const handleResetPassword = async () => {
    if (!validateInput()) return;

    Alert.alert(
      'Konfirmasi Reset Password',
      `Apakah Anda yakin ingin mereset password untuk akun ${userData?.nama_lengkap}?`,
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
              
              // Panggil API reset password
              const response = await axios.post(`${API_URL}/auth/reset-password`, {
                nomor_wa: phone,
                new_password: newPassword
              });

              if (response.data.success) {
                Alert.alert(
                  'Berhasil',
                  'Password berhasil direset. Silahkan login dengan password baru.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Kembali ke halaman login
                        navigation.navigate('Login');
                      }
                    }
                  ]
                );
              }
            } catch (error) {
              console.error('Reset password error:', error.response);
              const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat mereset password';
              Alert.alert('Error', errorMessage);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header dengan tombol back */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        
        <Text style={styles.infoText}>
          Reset password untuk akun{' '}
          <Text style={{color: '#2ABCB4', fontWeight: 'bold'}}>
            {userData?.nama_lengkap}
          </Text>
          {'\n'}
          Tipe: {userData?.type === 'user' ? 'Customer' : 'Mitra'}
        </Text>

        {/* Input Password Baru */}
        <Text style={styles.label}>Password Baru</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            placeholder="Masukkan password baru (minimal 6 karakter)"
            secureTextEntry={!passwordVisible}
            style={styles.passwordInput}
            value={newPassword}
            onChangeText={setNewPassword}
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

        {/* Input Konfirmasi Password */}
        <Text style={styles.label}>Konfirmasi Password Baru</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            placeholder="Masukkan ulang password baru"
            secureTextEntry={!confirmPasswordVisible}
            style={styles.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            <Icon 
              name={confirmPasswordVisible ? 'visibility-off' : 'visibility'} 
              size={24} 
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Informasi keamanan */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityTitle}>Tips Keamanan Password:</Text>
          <Text style={styles.securityText}>• Minimal 6 karakter</Text>
          <Text style={styles.securityText}>• Kombinasi huruf dan angka</Text>
          <Text style={styles.securityText}>• Jangan gunakan password yang mudah ditebak</Text>
        </View>

        {/* Tombol Reset Password */}
        <Button 
          mode="contained" 
          style={styles.resetButton} 
          onPress={handleResetPassword}
          loading={loading}
          disabled={loading}
        >
          Reset Password
        </Button>

        {/* Link kembali ke login */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')} 
          style={styles.backToLoginContainer}
        >
          <Text style={styles.backToLoginText}>
            Kembali ke Halaman Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    color: 'gray',
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20,
  },
  label: {
    color: 'gray',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  passwordInputContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 20,
  },
  passwordInput: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: 'grey',
    padding: 12,
    paddingRight: 50,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  securityInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#2ABCB4',
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  resetButton: {
    width: '100%',
    backgroundColor: '#2ABCB4',
    padding: 8,
    borderRadius: 12,
    marginBottom: 20,
  },
  backToLoginContainer: {
    alignSelf: 'center',
    marginTop: 10,
  },
  backToLoginText: {
    color: '#2ABCB4',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Switch } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SetPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [nik, setNik] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');

  const [isInvestor, setIsInvestor] = useState(false);
  const [alamat, setAlamat] = useState('');
  const [noRekening, setNoRekening] = useState('');
  const [bank, setBank] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  const [secureText, setSecureText] = useState(true);

  const handleSignup = () => {
    if(isEnabled == true) {
     navigation.push('InvestorSignup')
    } else {
     navigation.push('RegisterCust')
      
    }
  }
  return (
    <View style={styles.container}>
      {/* Tombol Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Judul */}
      <Text style={styles.title}>Set Password</Text>

      {/* Sub Judul */}
      <Text style={styles.subtitle}>
        Silakan buat kata sandi yang aman dengan memenuhi kriteria berikut.
      </Text>

     

      {/* Input Password */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.input}
            secureTextEntry={secureText}
            placeholder="********"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.icon}>
            <MaterialCommunityIcons name={secureText ? 'eye-off' : 'eye'} size={24} color="gray" />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Harus berisi 8 karakter</Text>
      </View>

      {/* Switch Daftar Sebagai Investor */}
      <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 12,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name="credit-card" size={24} color="#20B2AA" />
        <Text style={{ marginLeft: 8, fontSize: 16, color: '#20B2AA', fontWeight: '600' }}>
          Daftar Sebagai Investor
        </Text>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={() => setIsEnabled(!isEnabled)}
        color="#20B2AA"
      />
    </View>

      {/* Tombol Lanjutkan */}
       <View style={{ flex: 1 }} />
       <Button mode="contained" style={styles.continueButton} onPress={handleSignup}>
        Lanjutkan
      </Button>
    </View>
     
  );
};

export default SetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  icon: {
    padding: 10,
  },
  hint: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  switchLabel: {
    flex: 1,
    fontSize: 16,
    color: 'black',
    marginLeft: 10,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#20B2AA',
    borderRadius: 10,
    paddingVertical: 10,
  },
});

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Text, Button, Switch } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';



const InvestorSignUp = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [isInvestor, setIsInvestor] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [image, setImage] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selectedBank, setSelectedBank] = useState('Ketuk untuk pilih Bank');
  const [alamat, setAlamat] = useState('');
  const [noRekening, setNoRekening] = useState('');
  const [bank, setBank] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nik, setNik] = useState('');



  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        setImage(response.assets[0].uri);
      }
    });
  };


  
  return (
    <View style={styles.container}>
      {/* Tombol Back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Judul */}
      <Text style={styles.title}>Daftar Investor</Text>
<ScrollView showsVerticalScrollIndicator={false}>

<View>
<Text style={styles.subtitle}>
      Silhkan Isi Data Berikut
      </Text>

   
      <TouchableOpacity 
        style={{
          borderWidth: 1,
          borderColor: '#20B2AA',
          borderStyle: 'dashed',
          padding: 20,
          alignItems: 'center',
          borderRadius: 10,
          marginBottom: 20,
        }}
        onPress={pickImage}
      >
        {image ? (
          <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />
        ) : (
          <>
            <Icon name="image" size={50} color="teal" />
            <Text>Unggah Foto KTP</Text>
            <Button mode="outlined" onPress={pickImage} style={{ marginTop: 12, borderColor: '#20B2AA' }} textColor="#20B2AA">
              Pilih Foto
            </Button>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nomor Induk Kependudukan</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Isi NIK"
            value={nik}
            onChangeText={setNik}
          />
         
        </View>

        </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nama Lengkap</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Isi Nama Lengkap"
            value={namaLengkap}
            onChangeText={setNamaLengkap}
          />
         
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Alamat</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Isi Alamat Lengkap"
            value={alamat}
            onChangeText={setAlamat}
          />
         
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nomor Rekening</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Isi Nomor Rekening"
            value={noRekening}
            onChangeText={setNoRekening}
          />
         
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bank</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Isi Nama Bank"
            value={bank}
            onChangeText={setBank}
          />
         
        </View>
      </View>
      {/* Input Password */}
    

      {/* Switch Daftar Sebagai Investor */}
     

      {/* Tombol Lanjutkan */}
      <Button mode="contained" style={styles.continueButton} onPress={() => navigation.push('VerifPage')}>
        Lanjutkan
      </Button>
</View>
</ScrollView>
      {/* Sub Judul */}
      
    </View>
  );
};

export default InvestorSignUp;

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
    marginTop: 7,
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

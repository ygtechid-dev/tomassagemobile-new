import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Text, Button, Switch, RadioButton, Dropdown } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';

const RegisterCust = ({ navigation }) => {
  const [form, setForm] = useState({
    NamaLengkap: '', TempatLahir: '', TanggalLahir: '', JenisKelamin: '', NIK: '',
    StatusPernikahan: '', NamaIbu: '', Pendidikan: '', Email: '', NomorWA: '',
    NomorHPKeluarga: '', HubunganKeluarga: '', ProvinsiKTP: '', KotaKTP: '',
    KelurahanKTP: '', KodePosKTP: '', AlamatKTP: '', DomisiliSesuaiKTP: true,
    ProvinsiDomisili: '', KotaDomisili: '', KelurahanDomisili: '', KodePosDomisili: '',
    GmapsTempatTinggal: '', JenisPekerjaan: '', NamaInstansi: '', AlamatKantor: '',
    LamaBekerja: '', Penghasilan: '', MemilikiCicilan: false, InstansiCicilan: '',
    CicilanPerBulan: '', SisaCicilan: '', TahuBerkaDari: ''
  });
  
  const [fotoKTP, setFotoKTP] = useState(null);
  const [fotoSelfie, setFotoSelfie] = useState(null);
  const [kartuPegawai, setKartuPegawai] = useState(null);

  const handleImagePick = (setImage) => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        setImage(response.assets[0].uri);
      }
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Daftar Akun</Text>
      <Text style={styles.subtitle}>Silakan Isi Data Berikut</Text>

      {/* Inputan */}
      {Object.keys(form).map((key) => (
        key !== 'domisiliSesuaiKTP' && key !== 'memilikiCicilan' ? (
          <View key={key} style={styles.inputContainer}>
            <Text style={styles.label}>{key.replace(/([A-Z])/g, ' $1')}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Isi ${key.replace(/([A-Z])/g, ' $1')}`}
              value={form[key]}
              onChangeText={(text) => setForm({ ...form, [key]: text })}
            />
          </View>
        ) : null
      ))}

      {/* Switch Domisili Sesuai KTP */}
      <View style={styles.switchContainer}>
        <Text>Domisili Sesuai KTP</Text>
        <Switch value={form.domisiliSesuaiKTP} onValueChange={() => setForm({ ...form, domisiliSesuaiKTP: !form.domisiliSesuaiKTP })} />
      </View>

      {/* Switch Memiliki Cicilan */}
      <View style={styles.switchContainer}>
        <Text>Memiliki Cicilan Lain</Text>
        <Switch value={form.memilikiCicilan} onValueChange={() => setForm({ ...form, memilikiCicilan: !form.memilikiCicilan })} />
      </View>

      {/* Upload Foto */}
      {[{ label: 'Foto KTP', image: fotoKTP, setter: setFotoKTP }, { label: 'Foto Selfie', image: fotoSelfie, setter: setFotoSelfie }, { label: 'Kartu Pegawai', image: kartuPegawai, setter: setKartuPegawai }].map((item) => (
        <TouchableOpacity key={item.label} style={styles.uploadContainer} onPress={() => handleImagePick(item.setter)}>
          {item.image ? <Image source={{ uri: item.image }} style={{ width: 100, height: 100 }} /> : <>
            <Icon name="image" size={50} color="teal" />
            <Text>Unggah {item.label}</Text>
          </>}
        </TouchableOpacity>
      ))}

      <Button mode="contained" style={styles.continueButton} onPress={() => navigation.push('VerifPageCust')}>Lanjutkan</Button>
    </ScrollView>
  );
};

export default RegisterCust;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  backButton: { position: 'absolute', top: 10,  padding: 10, borderRadius: 50, backgroundColor: '#F5F5F5', zIndex: 10 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 7 },
  subtitle: { fontSize: 14, color: 'gray', textAlign: 'center', marginTop: 10, marginBottom: 20 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: 'black', marginBottom: 5 },
  input: { height: 50, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 10, fontSize: 16 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  uploadContainer: { borderWidth: 1, borderColor: '#20B2AA', borderStyle: 'dashed', padding: 20, alignItems: 'center', borderRadius: 10, marginBottom: 20 },
  continueButton: { width: '100%', backgroundColor: '#20B2AA', borderRadius: 10, paddingVertical: 10, marginBottom: 30 }
});
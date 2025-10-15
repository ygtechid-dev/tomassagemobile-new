import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider  from '@react-native-community/slider';

const Pengajuan = ({ navigation }) => {
  const [bulan, setBulan] = useState(3);
  const [hargaBarang, setHargaBarang] = useState(5000000);
  const uangMuka = 1000000;
  const cicilanPerBulan = Math.floor((hargaBarang - uangMuka) / bulan);

  const formatRupiah = (value) => {
    return `Rp${value.toLocaleString('id-ID')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Pengajuan Cicilan</Text>
        <Text style={styles.title}></Text>

      </View>
      <Text style={styles.subtitle}>Silahkan isi data berikut dengan benar</Text>
      
      <Text style={styles.label}>Nama Barang</Text>
      <TextInput style={styles.input} placeholder="Masukkan nama barang" />
      
      <Text style={styles.label}>Harga Barang</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={formatRupiah(hargaBarang)}
        onChangeText={(text) => setHargaBarang(Number(text.replace(/[^0-9]/g, '')) || 0)}
      />
      
      <Text style={styles.label}>Durasi Cicilan</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={6}
        step={1}
        value={bulan}
        onValueChange={setBulan}
        minimumTrackTintColor="#2D9CDB"
        maximumTrackTintColor="#E0E0E0"
      />
      <View style={styles.sliderLabels}>
        <Text>1 Bulan</Text>
        <Text sty>{bulan}Bulan</Text>
        <Text>6 Bulan</Text>
      </View>
      
      <Text style={styles.label}>Jumlah Cicilan per Bulan</Text>
      <TextInput
        style={[styles.input, styles.centeredText]}
        editable={false}
        value={formatRupiah(cicilanPerBulan)}
      />
      
      <Text style={styles.infoText}>
        Setelah melanjutkan, admin akan melakukan proses verifikasi.
        Anda akan diberikan informasi selanjutnya dalam 2 Hari Kerja.
      </Text>
      
      <Button mode="contained" style={styles.submitButton} onPress={() => navigation.push('PengajuanSuccess')}>
        Proses Pengajuan
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  subtitle: { color: 'gray', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, color: '#4F4F4F', marginTop: 10 },
  input: { borderBottomWidth: 1, borderBottomColor: '#2D9CDB', fontSize: 18, color: '#333333', paddingBottom: 5, marginBottom: 15 },
  centeredText: { textAlign: 'center' },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  infoText: { textAlign: 'center', color: 'gray', marginTop: 20 },
  submitButton: { marginTop: 30, backgroundColor: '#20B2AA', padding: 10, borderRadius: 10 },
});

export default Pengajuan;

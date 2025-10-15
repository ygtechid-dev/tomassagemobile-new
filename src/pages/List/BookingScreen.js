import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Text, TextInput, RadioButton, Button, Card, Divider } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookingScreen = ({route, navigation}) => {
    const {dataProperties, tglCheckin, tglCheckout} = route.params
    console.log('dpro', dataProperties.content.informationSummary.address);
    
  const [firstName, setFirstName] = useState('');
  const [nik, setNik] = useState('');
  const [noHp, setNoHp] = useState('');


  const [lastName, setLastName] = useState('');
  const [nationality, setNationality] = useState('');
  const [gender, setGender] = useState('');
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleSave = () => {
    const bookingData = {
      firstName,
      lastName,  
      dateOfBirth: date.toDateString(),
      gender,
      nationality,
      nik
    };
    Alert.alert('Data Disimpan', JSON.stringify(bookingData, null, 2));
  };

  const trimSlashes = (url) => {

    return url.replace(/^\/\//, 'https://');
    
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  const handleBooking = async () => {
    setLoading(true)
    if (!firstName || !lastName || !gender || !nationality) {
      Alert.alert("Peringatan", "Harap isi semua data pemesan!");
      return;
    }
  

    const userData = await AsyncStorage.getItem('profile');
    console.log('ccc', userData);
    
    if (!userData) return;

    const usrs  = JSON.parse(userData);


    const bookingData = {
      id_user: usrs.id_user, // Ganti dengan ID user dari state atau auth
      nama_pemesan: `${firstName} ${lastName}`,
      nik: `${nik}`,
      contact_phone: `${noHp}`,
      nama_hotel: dataProperties.content.informationSummary.defaultName,
      lokasi_hotel: `${dataProperties.content.informationSummary.address.area.name}, ${dataProperties.content.informationSummary.address.city.name}`,
      jumlah_tamu: 1, // Sesuaikan jumlah tamu
      tanggal_checkin: tglCheckin,
      tanggal_checkout: tglCheckout,
      totalharga: dataProperties.pricing.offers[0].roomOffers[0].room.pricing[0].price.perNight.inclusive.crossedOutPrice,
    };
  
    try {
      const response = await axios.post("https://ygtechdev.my.id/hotels", bookingData);
      console.log("Booking Response:", response.data);
    setLoading(false)

      Alert.alert("Sukses", "Pemesanan berhasil!");
      navigation.navigate("SuccessSubmissionScreen"); // Kembali ke home setelah sukses
    } catch (error) {
      console.error("Booking Error:", error);
      Alert.alert("Gagal", "Terjadi kesalahan saat booking.");
    }
  };


  return (
    <>
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerContainer}>
        <TouchableOpacity>
          <FontAwesome5 name="chevron-left" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.header}>Selesaikan Pemesananmu</Text>
      </TouchableOpacity>
      
      <Text style={styles.sectionTitle}>Detail Pemesan</Text>
      <Divider style={styles.divider} />
      <TextInput label="NIK" placeholder="E.g. 32424" value={nik} onChangeText={setNik} style={styles.input} mode="outlined" />
      <TextInput label="Nomor Handphone" placeholder="E.g. 0823432432" value={noHp} onChangeText={setNoHp} style={styles.input} mode="outlined" />
      
      <TextInput label="Nama Depan" placeholder="E.g. YOGI" value={firstName} onChangeText={setFirstName} style={styles.input} mode="outlined" />
      <TextInput label="Nama Belakang" placeholder="E.g. KURNIAWAN" value={lastName} onChangeText={setLastName} style={styles.input} mode="outlined" />
      
      <Text style={styles.label}>Tanggal Lahir</Text>
      <TextInput
        placeholder="dd/mm/yyyy"
        value={date.toLocaleDateString('id-ID')}
        style={styles.input}
        mode="outlined"
        onPressIn={() => setOpenDatePicker(true)}
        editable={false}
        right={<TextInput.Icon name={() => <FontAwesome5 name="calendar" size={16} color="black" />} />}
      />
      <DatePicker
        modal
        open={openDatePicker}
        date={date}
        mode="date"
        onConfirm={(selectedDate) => {
          setOpenDatePicker(false);
          setDate(selectedDate);
        }}
        onCancel={() => setOpenDatePicker(false)}
      />
      
      <Text style={styles.label}>Jenis Kelamin</Text>
      <RadioButton.Group onValueChange={setGender} value={gender}>
        <View style={styles.radioGroup}>
          <RadioButton value="pria" /><Text>Pria</Text>
          <RadioButton value="wanita" style={{ marginLeft: 16 }} /><Text>Wanita</Text>
        </View>
      </RadioButton.Group>
      
      <TextInput label="Nationality" placeholder="Select your nationality" value={nationality} onChangeText={setNationality} style={styles.input} mode="outlined" />
      
      <Text style={styles.sectionTitle}>Detail Menginap</Text>
      <Divider style={styles.divider} />
      <Card style={styles.card}>
        <Card.Title title={dataProperties.content.informationSummary.defaultName} subtitle={tglCheckin + " - " + tglCheckout} left={() => 
             <Image
             source={{ uri: trimSlashes(dataProperties.content.images.hotelImages[1].urls[0].value) }} // Ganti dengan URL gambar asli
             style={{ width: 50, height: 50 }}
           />

        } />
        <Card.Content>
          <Text>{dataProperties.content.informationSummary.address.area.name}, {dataProperties.content.informationSummary.address.city.name}</Text>
        
        </Card.Content>
      </Card>
      
      <Text style={styles.total}>Total: {formatRupiah(dataProperties.pricing.offers[0].roomOffers[0].room.pricing[0].price.perNight.inclusive.crossedOutPrice)}</Text>
      
      <Button mode="contained" style={styles.submitButton} onPress={handleBooking}>
        Lanjut
      </Button>
    </ScrollView>
    <Modal visible={loading}>
      <ActivityIndicator size="large" color="black" />
    </Modal>
    
    </>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F9FAFB' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  header: { fontWeight: 'bold', fontSize: 18, color: 'black', textAlign: 'center', flex: 1 },
  sectionTitle: { fontWeight: 'bold', fontSize: 18, color: 'black', marginTop: 16 },
  divider: { marginVertical: 8 },
  input: { marginTop: 8, backgroundColor: 'white' },
  label: { marginTop: 16, fontWeight: 'bold', color: 'black' },
  radioGroup: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  card: { marginTop: 8, backgroundColor: 'white', borderRadius: 10, padding: 10 },
  iconRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  total: { marginTop: 16, fontWeight: 'bold', fontSize: 18, color: '#007AFF', textAlign: 'right' },
  submitButton: { marginTop: 16, backgroundColor: '#007AFF', marginBottom: 30 }
});

export default BookingScreen;

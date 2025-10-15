import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Fire from '../../config/Fire'; // Ensure this path is correct
import axios from 'axios'; // Make sure to install axios
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal } from 'react-native-paper';
import { ActivityIndicator } from 'react-native';

const GantiOli = ({ navigation }) => {
  const [outlet, setOutlet] = useState('');
  const [oli, setOli] = useState('');
  const [motorType, setMotorType] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleSave = async () => {
    try {
        setLoading(true)
        const uid = await AsyncStorage.getItem('@token');
      const data = {
        outlet,
        oli,
        motorType,
        waNumber,
        date: date.toISOString(), // Store date as ISO string
        type: 'gantioli',
        uid
      };
     
      // Save to Firebase
      await Fire.database().ref('/dataTransaksi').push(data);

      // Send WhatsApp message using Fonnte API
      const message = "Halo, Kami dari Ladju Repair. Permintaan Ganti Oli anda berhasil. Silahkan ditunggu tim kami akan menghubungi anda sesaat lagi.";
      const url = 'https://api.fonnte.com/send';
      const headers = {
        'Authorization': 'zHuAQRPCo6bc37Gb5NQA',
        'Content-Type': 'application/json',
      };
      const body = JSON.stringify({
        target: waNumber, // Use the WA number input
        message: message,
      });

      await axios.post(url, body, { headers });
      setLoading(false)

      alert('Berhasil Kirim Permintaan Ganti Oli');
      // Navigate back or show success message
      navigation.goBack();
    } catch (error) {
      console.error('Error saving data or sending WhatsApp message: ', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row' }}>
        <FontAwesome5Icon name="chevron-left" size={22} color={'white'} />
        <Text style={styles.txtDesc}>Ganti Oli | LadjuRepair.</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Outlet yang dituju:</Text>
        <Picker
          selectedValue={outlet}
          onValueChange={(itemValue) => setOutlet(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Pilih Outlet" value="" />
          <Picker.Item label="Jember" value="Jember" />
          <Picker.Item label="Semarang" value="Semarang" />
          <Picker.Item label="Yogyakarta" value="Yogyakarta" />
        </Picker>

        <Text style={styles.label}>Oli yang dipilih:</Text>
        <Picker
          selectedValue={oli}
          onValueChange={(itemValue) => setOli(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Pilih Oli" value="" />
          <Picker.Item label="Yamalube" value="Yamalube" />
          <Picker.Item label="Shell" value="Shell" />
          <Picker.Item label="Enduro" value="Enduro" />
        </Picker>

        <Text style={styles.label}>Jenis Motor Anda:</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan jenis motor"
          value={motorType}
          onChangeText={setMotorType}
        />

        <Text style={styles.label}>Nomor WA yang dapat dihubungi:</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan nomor WA"
          value={waNumber}
          onChangeText={setWaNumber}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Tanggal Ganti Oli:</Text>
        <TouchableOpacity onPress={() => setOpen(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <DatePicker
          modal
          open={open}
          date={date}
          mode="date"
          onConfirm={(date) => {
            setOpen(false);
            setDate(date);
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Simpan</Text>
        </TouchableOpacity>

        <Modal visible={loading}>
            <ActivityIndicator size="large" color="black" />
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2c94df',
  },
  inputContainer: {
    backgroundColor: 'white',
    marginTop: 30,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  txtDesc: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
    fontSize: 16,
  },
  datePickerButton: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    marginBottom: 15,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
    paddingLeft: 10,
  },
  saveButton: {
    backgroundColor: '#2c94df',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GantiOli;

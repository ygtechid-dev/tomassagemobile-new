import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, TextInput, Button, Card, RadioButton, Checkbox } from "react-native-paper";
import DatePicker from "react-native-date-picker";
import Icon from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PassengerForm = ({ route, navigation }) => {
  const { penumpang, itemFlight } = route.params;
  const [dataProf, setDataProf] = useState({})
  const [checked, setChecked] = useState(false);
  console.log('dcc', dataProf);
  
  const getDataLocal = async () => {
    const userData = await AsyncStorage.getItem('profile');
    
    if (!userData) return;

    const usrs  = JSON.parse(userData);
    setDataProf(usrs)
    
  }

  useEffect(() => {
    getDataLocal()
  }, [])
  
  // State utama untuk semua input
  const [formData, setFormData] = useState({
    namaDepan:  "",
    namaBelakang: "",
    tanggalLahir:  new Date()  ,
    jenisKelamin:  "",
    nationality: "Indonesia",
    contactNamaDepan: "",
    contactNamaBelakang: "",
    contactPhone: "",
    contactEmail: "",
    nik: ""
  });

  const [openDatePicker, setOpenDatePicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(number);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID");
  };


  const handleCheckout = () => {
    
    if(checked == true) {
      setFormData({
        ...formData,
        namaDepan: dataProf.nama_lengkap,
        nik: dataProf.nik
      })
    }
  
   navigation.push("CheckoutScreen", {
    dataForm: formData,
    penumpang: penumpang,
    itemFlight: itemFlight
   })
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.header}>
        <Icon name="chevron-left" size={20} />
        <Text style={styles.airportCode}>FORM PENUMPANG</Text>
        <Text style={styles.airportCode}></Text>
      </TouchableOpacity>

      {/* Form */}
      <ScrollView style={{ padding: 16, backgroundColor: "#F5F5F5" }}>
        <Card style={{ marginBottom: 10 }}>
          <Card.Title title={`Penumpang ${penumpang} - Dewasa`} />
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
      <Checkbox
        status={checked ? "checked" : "unchecked"}
        onPress={() => setChecked(!checked)}
      />
      <Text onPress={() => setChecked(!checked)} style={{ fontSize: 16 }}>
        Sama seperti pengguna
      </Text>
    </View>

    {checked == false &&
      <Card.Content>
      <TextInput 
        label="Nama Depan" 
        placeholder="E.g. YOGI" 
        mode="outlined" 
        value={formData.namaDepan}
        onChangeText={(text) => handleInputChange("namaDepan", text)}
      />
      <TextInput 
        label="Nama Belakang" 
        placeholder="E.g. KURNIAWAN" 
        mode="outlined" 
        style={{ marginTop: 10 }} 
        value={formData.namaBelakang}
        onChangeText={(text) => handleInputChange("namaBelakang", text)}
      />
      <TextInput
        label="Tanggal Lahir"
        value={formatDate(formData.tanggalLahir)}
        mode="outlined"
        style={{ marginTop: 10 }}
        onPressIn={() => setOpenDatePicker(true)}
      />
       <TextInput 
        label="NIK" 
        placeholder="E.g. 234324324324" 
        mode="outlined" 
        style={{ marginTop: 10 }} 
        value={formData.nik}
        onChangeText={(text) => handleInputChange("nik", text)}
      />
      <DatePicker
        modal
        open={openDatePicker}
        date={formData.tanggalLahir}
        onConfirm={(selectedDate) => {
          setOpenDatePicker(false);
          handleInputChange("tanggalLahir", selectedDate);
        }}
        onCancel={() => setOpenDatePicker(false)}
        mode="date"
      />
      <Text style={{ marginTop: 10 }}>Jenis Kelamin</Text>
      <RadioButton.Group
        onValueChange={(newValue) => handleInputChange("jenisKelamin", newValue)}
        value={formData.jenisKelamin}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <RadioButton value="pria" />
          <Text>Pria</Text>
          <RadioButton value="wanita" style={{ marginLeft: 20 }} />
          <Text>Wanita</Text>
        </View>
      </RadioButton.Group>
      <TextInput
        label="Nationality"
        placeholder="Select your nationality"
        mode="outlined"
        style={{ marginTop: 10 }}
        value={formData.nationality}
        onChangeText={(text) => handleInputChange("nationality", text)}
      />
        <TextInput
        label="NIK"
        placeholder="Isi Nik"
        mode="outlined"
        style={{ marginTop: 10 }}
        value={formData.nik}
        onChangeText={(text) => handleInputChange("nik", text)}
      />
    </Card.Content>
    }
        
        </Card>

        {/* Contact Info */}
        <Text style={styles.sectionTitle}>Contact info</Text>
        <TextInput
          label="Nama Depan"
          placeholder="E.g. YOGI"
          mode="outlined"
          style={{ marginTop: 10 }}
          value={formData.contactNamaDepan}
          onChangeText={(text) => handleInputChange("contactNamaDepan", text)}
        />
        <TextInput
          label="Nama Belakang"
          placeholder="E.g. KURNIAWAN"
          mode="outlined"
          style={{ marginTop: 10 }}
          value={formData.contactNamaBelakang}
          onChangeText={(text) => handleInputChange("contactNamaBelakang", text)}
        />
        <TextInput
          label="Nomor Handphone"
          placeholder="E.g. 0900123456"
          mode="outlined"
          style={{ marginTop: 10 }}
          value={formData.contactPhone}
          onChangeText={(text) => handleInputChange("contactPhone", text)}
        />
        <TextInput
          label="Email"
          placeholder="E.g. nguyenvananh@gmail.com"
          mode="outlined"
          style={{ marginTop: 10 }}
          value={formData.contactEmail}
          onChangeText={(text) => handleInputChange("contactEmail", text)}
        />

        {/* Total Harga */}
        <Text style={styles.totalPriceText}>
          Total Harga:{" "}
          <Text style={{ color: "#007BFF" }}>
            {formatRupiah(itemFlight.itineraries[0].itineraryInfo.price.idr.display.averagePerPax.allInclusive)}
          </Text>
        </Text>

        {/* Tombol Lanjut */}
        <Button 
          mode="contained" 
          buttonColor="#007bff" 
          style={styles.button} 
          onPress={handleCheckout}
        >
          Lanjut
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 22,
    backgroundColor: "white",
    width: "100%",
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  airportCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  button: {
    marginTop: 20,
    marginBottom: 30,
  },
});

export default PassengerForm;

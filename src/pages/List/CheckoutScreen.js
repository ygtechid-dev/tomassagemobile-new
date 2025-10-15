import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Modal, ActivityIndicator, TouchableOpacity } from "react-native";
import { Text, Card, Button, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome5";

const CheckoutScreen = ({ route, navigation }) => {
  const { itemFlight, penumpang, dataForm } = route.params;
  console.log('daa', itemFlight.outboundSlice.segments[0].airportContent);
  
  const [loading, setLoading] = useState(false);

  console.log('ifl',dataForm);
  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };


  const formatTanggalDanWaktu = (dateTime) => {
    return new Date(dateTime).toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };


  const handlePengajuan = async () => {
  
    const userData = await AsyncStorage.getItem('profile');
    console.log('ccc', userData);
    
    if (!userData) return;

    const usrs  = JSON.parse(userData);



const dataKirim = {
  id_user: usrs.id_user, // ID user dari sistem autentikasi
  destination: itemFlight.outboundSlice.segments[0].airportContent.arrivalCityName,
  airline: itemFlight.outboundSlice.segments[0].carrierContent.carrierName,
  flight_class: itemFlight.outboundSlice.segments[0].cabinClassContent.cabinClass,
  flight_number: `${itemFlight.outboundSlice.segments[0].carrierContent.carrierCode} - ${itemFlight.outboundSlice.segments[0].flightNumber}`,
  origin: itemFlight.outboundSlice.segments[0].airportContent.departureCityName,
  departure_time: formatTanggalDanWaktu(itemFlight.outboundSlice.segments[0].departDateTime), // Format sudah dalam ISO 8601
  destination_airport: itemFlight.outboundSlice.segments[0].destinationAirport,
  arrival_time: formatTanggalDanWaktu(itemFlight.outboundSlice.segments[0].arrivalDateTime),
  duration: `${itemFlight.itineraries[0].itineraryInfo.totalTripDuration}m`,
  total_price: itemFlight.itineraries[0].itineraryInfo.price.idr.display.averagePerPax.allInclusive,
  passenger_name: `${dataForm.namaDepan} ${dataForm.namaBelakang}`,
  contact_name: dataForm.contactNamaDepan,
  contact_phone: dataForm.contactPhone,
  contact_email: dataForm.contactEmail,
  status: "Pending",
  nik: dataForm.nik,
};

console.log('datkir', dataKirim);


// Fungsi untuk melakukan POST request

  try {
    setLoading(true)
    const response = await axios.post("https://ygtechdev.my.id/flights", dataKirim, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.data.success) {
    setLoading(false)

      console.log("Pemesanan berhasil:", response.data);
      navigation.push('SuccessSubmissionScreen')
    } else {
    setLoading(false)

      console.error("Gagal melakukan pemesanan:", response.data.message);
    }
  } catch (error) {
    setLoading(false)

    console.error("Error saat mengirim data:", error);
  }


   

  }

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };
  return (
    <>
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.header}>
        <Icon name="chevron-left" size={20} onPress={() => navigation.goBack()} />
        <Text style={styles.headerText}>Checkout</Text>
        <View style={{ width: 20 }} />
      </TouchableOpacity>

      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Order Summary" left={(props) => <Icon {...props} name="plane" size={20} color="#007BFF" />} />
          <Card.Content>
            <Text style={styles.flightTitle}>Departure flight To {itemFlight.outboundSlice.segments[0].airportContent.arrivalCityName}</Text>
            <Divider style={{ marginVertical: 10 }} />
            <Text style={styles.flightInfo}>{itemFlight.outboundSlice.segments[0].carrierContent.carrierName + " - " + itemFlight.outboundSlice.segments[0].cabinClassContent.cabinClass}</Text>
            <Text>{itemFlight.outboundSlice.segments[0].carrierContent.carrierCode + " - " + itemFlight.outboundSlice.segments[0].flightNumber}</Text>
            <View style={styles.rowBetween}>
              <Text>{itemFlight.outboundSlice.segments[0].originAirport + " - " + formatTime(itemFlight.outboundSlice.segments[0].departDateTime)}</Text>
              <Text>{itemFlight.outboundSlice.segments[0].destinationAirport + " - " + formatTime(itemFlight.outboundSlice.segments[0].arrivalDateTime)}</Text>

            </View>
            <Text style={styles.flightDuration}>{itemFlight.itineraries[0].itineraryInfo.totalTripDuration + "m"}</Text>
          
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Total Harga" left={(props) => <Icon {...props} name="dollar-sign" size={20} color="#28A745" />} />
          <Card.Content>
            <Text style={styles.totalPrice}>{formatRupiah(itemFlight.itineraries[0].itineraryInfo.price.idr.display.averagePerPax.allInclusive)}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Informasi Penumpang" left={(props) => <Icon {...props} name="user" size={20} color="#6C757D" />} />
          <Card.Content>
            <Text>1. {dataForm.namaDepan + " " + dataForm.namaBelakang}</Text>
         
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Contact Info" left={(props) => <Icon {...props} name="phone" size={20} color="#FFC107" />} />
          <Card.Content>
            <Text>Nama: {dataForm.contactNamaDepan}</Text>
            <Text>Nomor Telepon:  {dataForm.contactPhone}</Text>
            <Text>Email: {dataForm.contactEmail}</Text>
          </Card.Content>
        </Card>

        <Button mode="contained" buttonColor="#007bff" style={styles.button} onPress={handlePengajuan}>
          Ajukan Perjalanan
        </Button>
      </ScrollView>
    </View>
    <Modal visible={loading}>
      <ActivityIndicator size="large" color="black" />
    </Modal>
    
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  card: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  flightTitle: {
    backgroundColor: "#007BFF",
    color: "white",
    padding: 10,
    borderRadius: 5,
    fontWeight: "bold",
    textAlign: "center",
  },
  flightInfo: {
    fontWeight: "bold",
  },
  flightDuration: {
    textAlign: "center",
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
  alertText: {
    backgroundColor: "#EEE",
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
 marginLeft: 60,
    marginTop: -10
  },
  button: {
    marginTop: 20,
    marginBottom: 30,
    padding: 10,
  },
});

export default CheckoutScreen;

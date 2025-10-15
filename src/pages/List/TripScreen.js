import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Badge } from 'react-native-paper';
import { formatRupiah } from '../../context/DateTimeServices';

// COMPONENT FlightsTab
const FlightsTab = ({ dataFlight }) => (
    
  <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: 'white', flex: 1 }}>
    <Text variant="headlineLarge" style={{ fontWeight: 'bold', marginBottom: 20 }}>
      Flights
    </Text>

    {dataFlight.length > 0 ? (
      dataFlight.map((flight, index) => (
        <Card key={index} style={{ borderRadius: 12, padding: 16, elevation: 3, backgroundColor: 'white', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>
              {flight.origin} - {flight.destination}
            </Text>
            {flight.status == "Pending" ?
              <Badge style={{ backgroundColor: 'yellow', color: 'black', paddingHorizontal: 10 }}>
              {flight.status}
            </Badge>
            : 
            flight.status == "Approved" ?
            <Badge style={{ backgroundColor: 'green', color: 'white', paddingHorizontal: 10 }}>
            {flight.status}
          </Badge>
          :
          <Badge style={{ backgroundColor: 'red', color: 'white', paddingHorizontal: 10 }}>
          {flight.status}
        </Badge>
            }
          
          </View>

          <Text variant="bodyMedium" style={{ marginTop: 8 }}>✈️ {flight.airline}</Text>
          <Text variant="bodyMedium" style={{ color: 'gray' }}>{flight.departure_time} - {flight.arrival_time}</Text>
          <Text variant="bodyMedium" style={{ color: 'gray' }}>{flight.flight_class}</Text>

          <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 8 }}>
            {formatRupiah(flight.total_price)}
          </Text>
        </Card>
      ))
    ) : (
      <Text style={{ textAlign: 'center', color: 'gray' }}>Belum ada data penerbangan</Text>
    )}
  </ScrollView>
);

// COMPONENT HotelsTab
const HotelsTab = ({ dataHotel }) => (
  <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: 'white', }}>
    <Text variant="headlineLarge" style={{ fontWeight: 'bold', marginBottom: 20 }}>
      Hotels
    </Text>

   {dataHotel.length > 0 ?
   dataHotel.map((i, index) => {
    return (
        <Card style={{ borderRadius: 12, padding: 16, elevation: 3, backgroundColor: 'white', marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="bodyLarge" style={{ fontWeight: 'bold', width: 150 }}>
          {i.nama_hotel}
          </Text>
          {i.status_approval == "pending" ?
          <Badge style={{ backgroundColor: 'yellow', color: 'black', paddingHorizontal: 10 }}>
          {i.status_approval}
           </Badge>
           :
        
        i.status_approval == "Approved" ?
        <Badge style={{ backgroundColor: 'green', color: 'white', paddingHorizontal: 10 }}>
        {i.status_approval}
         </Badge>
    :
    <Badge style={{ backgroundColor: 'red', color: 'white', paddingHorizontal: 10 }}>
    {i.status_approval}
     </Badge>
}
          
        </View>
    
        <Text variant="bodyMedium" style={{ marginTop: 8 }}>{i.lokasi_hotel}</Text>
        <Text variant="bodyMedium" style={{ color: 'gray' }}>{i.tanggal_checkin + " - " + i.tanggal_checkout}</Text>
    
        <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 8 }}>
          {formatRupiah(i.totalharga)}
        </Text>
      </Card>
    )
  
   })
:
<Text style={{ textAlign: 'center', color: 'gray' }}>Belum ada data Hotel</Text>
}

  </ScrollView>
);

// COMPONENT TripScreen
const TripScreen = () => {
  const [selectedTab, setSelectedTab] = useState('flights');
  const [dataFlight, setDataFlight] = useState([]);
  const [dataHotel, setDataHotel] = useState([]);


  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const userData = await AsyncStorage.getItem('profile');
        console.log('ccc', userData);
        
        if (!userData) return;

        const usrs  = JSON.parse(userData);
         // Ambil id_user dari AsyncStorage
        const response = await axios.get(`https://ygtechdev.my.id/flights/${usrs.id_user}`);

        if (response.data) {
            console.log('cccc', response.data);
            
          setDataFlight(response.data.data); // Simpan hasil API ke state
        }
      } catch (error) {
        console.error('Error fetching flights:', error);
      }
      
    };

    const fetchHotel = async () => {
        try {
          const userData = await AsyncStorage.getItem('profile');
          console.log('ccc', userData);
          
          if (!userData) return;
  
          const usrs  = JSON.parse(userData);
           // Ambil id_user dari AsyncStorage
          const response = await axios.get(`https://ygtechdev.my.id/hotels/${usrs.id_user}`);
  
          if (response.data) {
              console.log('cccc', response.data.data);
              
            setDataHotel(response.data.data); // Simpan hasil API ke state
          }
        } catch (error) {
          console.error('Error fetching flights:', error);
        }
    }

    fetchHotel();
    fetchFlights();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
        <TouchableOpacity
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderBottomWidth: selectedTab === 'flights' ? 3 : 0,
            borderBottomColor: selectedTab === 'flights' ? 'black' : 'transparent',
          }}
          onPress={() => setSelectedTab('flights')}
        >
          <Text style={{ fontWeight: 'bold', color: selectedTab === 'flights' ? 'black' : 'gray' }}>
            Flights
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderBottomWidth: selectedTab === 'hotels' ? 3 : 0,
            borderBottomColor: selectedTab === 'hotels' ? 'black' : 'transparent',
          }}
          onPress={() => setSelectedTab('hotels')}
        >
          <Text style={{ fontWeight: 'bold', color: selectedTab === 'hotels' ? 'black' : 'gray' }}>
            Hotels
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === 'flights' ? <FlightsTab dataFlight={dataFlight} /> : <HotelsTab dataHotel={dataHotel}/>}
    </View>
  );
};

export default TripScreen;

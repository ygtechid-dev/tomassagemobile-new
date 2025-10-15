import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Fire from '../../config/Fire'; // Ensure this path is correct
import { Calendar } from 'react-native-calendars';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const IntegrasiKalendar = ({ navigation }) => {
  const [serviceData, setServiceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = await AsyncStorage.getItem('@token'); // Get UID from AsyncStorage
        if (uid) {
          const snapshot = await Fire.database().ref('dataTransaksi').once('value');
          const data = snapshot.val();
          const filteredData = Object.entries(data)
            .filter(([key, value]) => value.uid === uid) // Filter based on UID
            .map(([key, value]) => ({ id: key, ...value })); // Format data

          setServiceData(filteredData);
          markDates(filteredData);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const markDates = (data) => {
    const marked = {};
    data.forEach(item => {
      const dateKey = item.date.split('T')[0]; // Get the date part from ISO string
      marked[dateKey] = {
        marked: true,
        dotColor: 'blue', // Color of the dot
        // Optional: You can add a custom style for the marked date
      };
    });
    setMarkedDates(marked);
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  const renderMarkedDates = () => {
    return Object.keys(markedDates).map(date => (
      <Text key={date} style={styles.dateDetail}>
        {date}: {serviceData.find(item => item.date.split('T')[0] === date)?.type || 'No service'} 
      </Text>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5Icon name="chevron-left" size={22} color={'white'} />
        </TouchableOpacity>
        <Text style={styles.header}>Jadwal Servis</Text>
      </View>
      <Calendar
        style={styles.calendar}
        markedDates={markedDates}
        onDayPress={(day) => console.log('Selected day', day)}
      />
      <View style={styles.detailsContainer}>
        {renderMarkedDates()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2c94df',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1, // To push the header text to the center
  },
  calendar: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    marginBottom: 20,
  },
  detailsContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  dateDetail: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
});

export default IntegrasiKalendar;

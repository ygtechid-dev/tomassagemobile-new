import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const JadwalBukaBengkel = ({ navigation }) => {
  const locations = [
    {
      city: 'Jember',
      openingHours: '08:00 - 22:00 WIB',
    },
    {
      city: 'Semarang',
      openingHours: '08:00 - 22:00 WIB',
    },
    {
      city: 'Yogyakarta',
      openingHours: '08:00 - 22:00 WIB',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5Icon name="chevron-left" size={22} color={'white'} />
        </TouchableOpacity>
        <Text style={styles.header}>Jadwal Buka Bengkel</Text>
      </View>

      {locations.map((location, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.city}>{location.city}</Text>
          <Text style={styles.hours}>Setiap Hari - {location.openingHours}</Text>
        </View>
      ))}
    </ScrollView>
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
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  city: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  hours: {
    fontSize: 16,
    color: '#666',
  },
});

export default JadwalBukaBengkel;

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';

const CardFlight = ({logo, code, pressed, duration, flightTime, arriveTime, iatadari, iatake, namedari, nameke, kelas, harga}) => {
  return (
    <Card style={styles.card} onPress={pressed}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: logo }} style={styles.airlineLogo} />
        <Text style={styles.flightNumber}>{code}</Text>
        <Text style={styles.duration}>{duration}</Text>
      </View>

      {/* Flight Details */}
      <View style={styles.flightDetails}>
        <View style={styles.flightTime}>
          <Text style={styles.time}>{flightTime}</Text>
          <Text style={styles.airportCode}>{iatadari}</Text>
          <Text style={styles.airportName}>{namedari}l</Text>
        </View>

        <View style={styles.iconContainer}>
          <Icon name="plane" size={20} color="#007bff" />
        </View>

        <View style={styles.flightTime}>
          <Text style={styles.time}>{arriveTime}</Text>
          <Text style={styles.airportCode}>{iatake}</Text>
          <Text style={styles.airportName}>{nameke}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.classText}>{kelas}</Text>
        <Text style={styles.price}>{harga}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 10,
    margin: 10,
    elevation: 3,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  airlineLogo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  flightNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 14,
    color: 'gray',
  },
  flightDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  flightTime: {
    alignItems: 'center',
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  airportCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  airportName: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    width: 100,
    flexWrap: 'wrap'
  },
  iconContainer: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 50,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
  },
  classText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'gray',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
});

export default CardFlight;

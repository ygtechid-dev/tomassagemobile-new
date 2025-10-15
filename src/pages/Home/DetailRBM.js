import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DetailRBM = ({ route }) => {
  const { rbm, longitude, latitude } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detail RBM</Text>
      <Text>RBM: {rbm}</Text>
      <Text>Longitude: {longitude}</Text>
      <Text>Latitude: {latitude}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default DetailRBM;

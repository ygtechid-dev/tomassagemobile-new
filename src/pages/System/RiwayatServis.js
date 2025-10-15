import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Fire from '../../config/Fire'; // Ensure this path is correct

const RiwayatServis = () => {
  const [servisData, setServisData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
          
          setServisData(filteredData);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Riwayat Servis</Text>
      {servisData.length === 0 ? (
        <Text style={styles.noDataText}>Belum ada riwayat servis.</Text>
      ) : (
        servisData.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.type === 'gantioli' ? 'Ganti Oli' : 'Servis Kendaraan'}</Text>
            <Text style={styles.cardDetail}>Motor Type: {item.motorType}</Text>
            {item.type === 'gantioli' && <Text style={styles.cardDetail}>Oli: {item.oli}</Text>}
            <Text style={styles.cardDetail}>Outlet: {item.outlet}</Text>
            <Text style={styles.cardDetail}>Tanggal: {new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.cardDetail}>Nomor WA: {item.waNumber}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2c94df',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 16,
    color: '#666',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});

export default RiwayatServis;

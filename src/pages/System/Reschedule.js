import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Fire from '../../config/Fire'; // Ensure this path is correct
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import DatePicker from 'react-native-date-picker';
import { Modal } from 'react-native-paper';

const Reschedule = ({ navigation }) => {
  const [servisData, setServisData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentItem, setCurrentItem] = useState(null); // Track the current item being rescheduled

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

  const handleReschedule = async (item) => {
    if (item) {
      const newDate = selectedDate.toISOString();
      try {
        // Update the item in Firebase
        await Fire.database().ref(`dataTransaksi/${item.id}`).update({ date: newDate });
        alert('Tanggal berhasil diubah!');
        navigation.replace('System')
      } catch (error) {
        console.error('Error updating date: ', error);
      }
    }
    setModalVisible(false); // Close the modal
  };

  const renderCard = (item) => (
    <View key={item.id} style={styles.card}>
      <Text style={styles.cardTitle}>{item.type === 'gantioli' ? 'Ganti Oli' : 'Servis Kendaraan'}</Text>
      <Text style={styles.cardDetail}>Motor Type: {item.motorType}</Text>
      {item.type === 'gantioli' && <Text style={styles.cardDetail}>Oli: {item.oli}</Text>}
      <Text style={styles.cardDetail}>Outlet: {item.outlet}</Text>
      <Text style={styles.cardDetail}>Tanggal: {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.cardDetail}>Nomor WA: {item.waNumber}</Text>
      {/* Check if the date is not today to show the Reschedule button */}
      {new Date(item.date).toLocaleDateString() !== new Date().toLocaleDateString() && (
        <TouchableOpacity style={styles.rescheduleButton} onPress={() => { setCurrentItem(item); setModalVisible(true); }}>
          <Text style={styles.rescheduleButtonText}>Reschedule</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <>
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5Icon name="chevron-left" size={22} color={'white'} />
        </TouchableOpacity>
        <Text style={styles.header}>Reschedule</Text>
      </View>

      <View style={{marginBottom: 100}}>
      {servisData.length === 0 ? (
        <Text style={styles.noDataText}>Belum ada riwayat servis.</Text>
      ) : (
        servisData.map(renderCard)
      )}
      </View>
   

      {/* Modal for Date Picker */}
      
    </ScrollView>
    {modalVisible && (
        <Modal visible={modalVisible}>
 <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Pilih Tanggal Reschedule</Text>
          <DatePicker
            date={selectedDate}
            onDateChange={setSelectedDate}
            mode="date"
          />
          <TouchableOpacity style={styles.saveButton} onPress={() => handleReschedule(currentItem)}>
            <Text style={styles.saveButtonText}>Simpan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>
        </View>
        </Modal>
       
      )}
    
    </>
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
  rescheduleButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFA500',
    borderRadius: 5,
    alignItems: 'center',
  },
  rescheduleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
   width: 300,
   height: 400,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Reschedule;

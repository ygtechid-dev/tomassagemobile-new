import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Provider, Avatar, Text, TextInput, Button, IconButton, Menu, Dialog, Portal } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PersonalDataScreenCust = ({navigation}) => {
  const [userData, setUserData] = useState({
    name: '',
    spid: '',
    phone: '',
    birthdate: '',
    gender: '',
    profile_photo: null
  });
  const [loading, setLoading] = useState(true);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to fetch user data from AsyncStorage
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const storedUserData = await AsyncStorage.getItem('user_data');
      
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        
        console.log('dddd', parsedUserData);
        
        // Set the user data to state with proper format
        setUserData({
          name: parsedUserData.nama_lengkap || 'Tidak Ada Data',
          spid: parsedUserData.id.toString() || parsedUserData.id || 'Tidak Ada Data',
          phone: parsedUserData.nomor_wa || 'Tidak Ada Data',
          alamat: parsedUserData.alamat || 'Tidak Ada Data',
          gender: parsedUserData.jenis_kelamin,
          profile_photo: parsedUserData.profile_photo || null
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete account request
  const handleDeleteAccountRequest = () => {
    // Show confirmation dialog
    setConfirmDialogVisible(true);
  };

  // Confirm delete account
  const confirmDeleteAccount = async () => {
    try {
      // Close dialog
      setConfirmDialogVisible(false);
      
      // Here you would typically make an API call to request account deletion
      // For this demo, we'll just show a success message
      
      // You could also set a flag in AsyncStorage to indicate the request
      await AsyncStorage.setItem('delete_account_requested', 'true');
      
      // Show success alert
      Alert.alert(
        "Permintaan Diterima",
        "Penghapusan Akun sudah diajukan, menunggu konfirmasi admin selama 1-3 Hari kerja",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      Alert.alert('Error', 'Gagal mengajukan permintaan penghapusan akun');
    }
  };

  // Function to render field with label and value
  const renderField = (label, value) => {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.fieldValueContainer}>
          <Text style={styles.fieldValue}>{value || 'Tidak Ada Data'}</Text>
        </View>
      </View>
    );
  };

  return (
    <Provider>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
          <Text variant="titleLarge" style={styles.headerTitle}>
            Data Pribadi
          </Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {/* <Avatar.Image 
            size={100} 
            source={getProfilePhoto()} 
          /> */}
          {/* Removed edit button since data is not editable */}
        </View>

        {/* Data fields */}
        <View style={styles.dataSection}>
          {renderField("Nama Lengkap", userData.name)}
          {/* {renderField("SPID", userData.spid)} */}
          {renderField("Nomor Handphone", userData.phone)}
          {renderField("Jenis Kelamin", userData.gender)}
        </View>

        {/* Delete Account Button */}
        <Button 
          mode="outlined" 
          style={styles.deleteButton} 
          textColor="#FF3B30"
          onPress={handleDeleteAccountRequest}
        >
          Ajukan Hapus Akun
        </Button>

        {/* Back Button */}
        <Button 
          mode="contained" 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          Kembali
        </Button>

        {/* Confirmation Dialog */}
        <Portal>
          <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
            <Dialog.Title>Konfirmasi Hapus Akun</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">
                Apakah Anda yakin ingin mengajukan penghapusan akun? Tindakan ini tidak dapat dibatalkan setelah diproses.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmDialogVisible(false)}>Batal</Button>
              <Button textColor="#FF3B30" onPress={confirmDeleteAccount}>Konfirmasi</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dataSection: {
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  fieldValueContainer: {
    backgroundColor: '#F0F8FF', // Light blue background
    borderWidth: 1,
    borderColor: '#009688',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  deleteButton: {
    marginTop: 20,
    paddingVertical: 8,
    borderColor: '#FF3B30',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  backButton: {
    marginTop: 12,
    marginBottom: 30,
    paddingVertical: 10,
    backgroundColor: '#009688',
    borderRadius: 8,
  },
});

export default PersonalDataScreenCust;
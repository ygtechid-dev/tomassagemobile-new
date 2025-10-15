import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Avatar, Text, List, Divider } from 'react-native-paper';

const ProfileCust = ({navigation}) => {

  const [userData, setUserData] = useState(null);



  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        
        // Fetch additional data
       
      }
    } catch (error) {
      console.error('Error fetching user data:', error.response);
    } finally {
    }
  };


  useFocusEffect(
    React.useCallback(() => {
      // Setup kode yang dijalankan saat screen mendapat fokus
      fetchUserData();
      
      // Event listener atau timer yang mungkin perlu dibersihkan
      
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileContainer}>
        {/* <Avatar.Image size={70} source={{ uri: 'https://ygtechdev.my.id/files/photo-1740151130177-456855645.png' }} /> */}
       {userData &&
         <View style={styles.profileText}>
         <Text variant="titleMedium" style={styles.name}>
         {userData.nama_lengkap}
         </Text>
         <Text variant="bodyMedium" style={styles.spid}>
         Customer
         </Text>
       </View>
       }
      
      </View>

      <Divider style={styles.divider} />

      {/* Personal Info Section */}
      <Text variant="titleSmall" style={styles.sectionTitle}>Personal Info</Text>
      <List.Item
        title="Personal Data"
        left={() => <List.Icon icon="account" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => navigation.push('PersonalDataScreenCust')}
      />
      {/* <List.Item
        title="Akun Pembayaran"
        left={() => <List.Icon icon="credit-card" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {}}
      />
      <List.Item
        title="Keamanan Akun"
        left={() => <List.Icon icon="shield-check" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {}}
      /> */}

      <Divider style={styles.divider} />

      {/* About Section */}
      <Text variant="titleSmall" style={styles.sectionTitle}>About</Text>
      <List.Item
        title="Pusat Bantuan"
        left={() => <List.Icon icon="help-circle-outline" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => Linking.openURL('https://wa.me/6282322000037')}
      
      />
      {/* <List.Item
        title="Privacy & Policy"
        left={() => <List.Icon icon="lock-outline" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {}}
      />
      <List.Item
        title="Tentang Aplikasi"
        left={() => <List.Icon icon="information-outline" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {}}
      />
      <List.Item
        title="Syarat dan Ketentuan"
        left={() => <List.Icon icon="file-document-outline" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={() => {}}
      /> */}
       <List.Item
        title="Logout"
        left={() => <List.Icon icon="account" />}
        right={() => <List.Icon icon="chevron-right" />}
        onPress={async() => {
          await AsyncStorage.clear()
          navigation.replace('Login')
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileText: {
    marginLeft: 16,
  },
  name: {
    fontWeight: 'bold',
  },
  spid: {
    color: 'gray',
  },
  sectionTitle: {
    marginVertical: 10,
    fontWeight: 'bold',
    color: 'gray',
  },
  divider: {
    marginVertical: 10,
  },
});

export default ProfileCust;

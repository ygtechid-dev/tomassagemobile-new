import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Provider, Avatar, Text, Card, Button, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PersonalDataScreen = ({navigation}) => {
  const [userData, setUserData] = useState({
    name: '',
    spid: '',
    phone: '',
    birthdate: '',
    gender: '',
    profile_photo: null
  });
  const [loading, setLoading] = useState(true);

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
          gender: parsedUserData.jenis_kelamin || 'Tidak Ada Data',
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

  // Function to render field with label and value
  const renderField = (label, value, icon) => {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.fieldHeader}>
            {icon && <IconButton icon={icon} size={20} style={styles.fieldIcon} />}
            <Text style={styles.fieldLabel}>{label}</Text>
          </View>
          <View style={styles.fieldValueContainer}>
            <Text style={styles.fieldValue}>{value || 'Tidak Ada Data'}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <Provider>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton 
            icon="arrow-left" 
            size={24} 
            onPress={() => navigation.goBack()} 
          />
          <Text variant="titleLarge" style={styles.headerTitle}>
            Data Pribadi
          </Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <Avatar.Text 
            size={100} 
            label={userData.name ? userData.name.substring(0, 2).toUpperCase() : "NA"} 
            backgroundColor="#009688"
          />
          <Text style={styles.userName}>{userData.name}</Text>
        </View>

        {/* Data Fields */}
        <View style={styles.dataSection}>
          {renderField("Nama Lengkap", userData.name, "account")}
          {renderField("SPID", userData.spid, "card-account-details")}
          {renderField("Nomor Handphone", userData.phone, "phone")}
          {renderField("Alamat", userData.alamat, "map-marker")}
          {renderField("Jenis Kelamin", userData.gender, "gender-male-female")}
        </View>

        {/* Back Button */}
        <Button 
          mode="contained" 
          style={styles.backButton} 
          icon="keyboard-return"
          onPress={() => navigation.goBack()}
        >
          Kembali
        </Button>
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 22,
    color: '#333',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    color: '#333',
  },
  dataSection: {
    marginVertical: 8,
    gap: 12,
  },
  card: {
    marginBottom: 8,
    borderRadius: 10,
    elevation: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldIcon: {
    margin: 0,
    padding: 0,
    marginRight: 4,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  fieldValueContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#009688',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  backButton: {
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 8,
    backgroundColor: '#009688',
    borderRadius: 8,
  },
});

export default PersonalDataScreen;
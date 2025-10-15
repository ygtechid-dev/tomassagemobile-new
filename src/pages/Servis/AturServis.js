import React, { useState, useEffect } from 'react';
import { View, ScrollView, Switch, Image, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Appbar, Snackbar, TextInput, Card } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../context/APIUrl';
import Icon from 'react-native-vector-icons/FontAwesome5';

// Data Gender
const genderOptions = [
  { id: 1, name: 'Pria', icon: require('../../assets/maless.png') },
  { id: 2, name: 'Wanita', icon: require('../../assets/woman.png') },
];

// Radius preset options
const radiusPresets = [
  { value: 1000, label: '1 km' },
  { value: 2000, label: '2 km' },
  { value: 3000, label: '3 km' },
  { value: 5000, label: '5 km' },
  { value: 10000, label: '10 km' },
];

const AturServis = ({navigation}) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingService, setUpdatingService] = useState(null);
  const [updatingGender, setUpdatingGender] = useState(false);
  const [updatingRadius, setUpdatingRadius] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [mitraId, setMitraId] = useState(null);
  const [selectedGenders, setSelectedGenders] = useState({
    'Pria': true,
    'Wanita': true
  });
  const [radius, setRadius] = useState(2000);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user_data');
        const userToken = await AsyncStorage.getItem('userToken');
        
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setMitraId(userData.id);
          
          if (userData.radius) {
            setRadius(parseInt(userData.radius));
          }
        } else {
          setMitraId('1');
        }
        
        if (userToken) {
          setToken(userToken);
        }
      } catch (error) {
        setMitraId('1');
      }
    };

    getUserData();
  }, []);

  useEffect(() => {
    if (mitraId) {
      fetchMitraServices();
      fetchMitraGenderPreferences();
    }
  }, [mitraId]);

  const fetchMitraServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const mitraServicesResponse = await axios.get(`${API_URL}/${mitraId}/services`);
      
      if (mitraServicesResponse.data && mitraServicesResponse.data.success) {
        const servicesData = mitraServicesResponse.data.data || [];
        setServices(servicesData);
      } else {
        throw new Error('Failed to fetch services data');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat layanan');
    } finally {
      setLoading(false);
    }
  };

  const fetchMitraGenderPreferences = async () => {
    try {
      const response = await axios.get(`${API_URL}/mitra/${mitraId}/preferences`);
      
      if (response.data && response.data.success) {
        const prefs = response.data.data;
        if (prefs && prefs.gender_preferences) {
          setSelectedGenders({
            'Pria': prefs.gender_preferences.includes('Pria'),
            'Wanita': prefs.gender_preferences.includes('Wanita')
          });
        }
      }
    } catch (err) {
      // Silent fail
    }
  };

  const toggleService = async (service) => {
    if (!mitraId) {
      Alert.alert('Error', 'Tidak dapat mengidentifikasi akun mitra');
      return;
    }
    
    setUpdatingService(service.id);

    try {
      const endpoint = `${API_URL}/${mitraId}/services/${service.id}`;
      const payload = { 
        is_active: !service.is_active,
        harga_kustom: service.harga_kustom || service.harga_dasar
      };
      
      const response = await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setServices(services.map(s => 
          s.id === service.id 
            ? { ...s, is_active: !s.is_active } 
            : s
        ));
        
        setSnackbarMessage(`${service.nama_layanan} ${service.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
        setSnackbarVisible(true);
      } else {
        throw new Error(response.data?.message || 'Gagal memperbarui layanan');
      }
    } catch (err) {
      Alert.alert('Error', `Tidak dapat memperbarui ${service.nama_layanan}`);
    } finally {
      setUpdatingService(null);
    }
  };

  const toggleGender = async (gender) => {
    const newGenderPrefs = { ...selectedGenders, [gender]: !selectedGenders[gender] };
    setSelectedGenders(newGenderPrefs);
    
    setUpdatingGender(true);
    
    try {
      const selectedGenderArray = Object.entries(newGenderPrefs)
        .filter(([_, isSelected]) => isSelected)
        .map(([genderName, _]) => genderName);
      
      if (selectedGenderArray.length === 0) {
        Alert.alert('Peringatan', 'Anda harus memilih setidaknya satu gender');
        setSelectedGenders({...selectedGenders});
        setUpdatingGender(false);
        return;
      }
      
      const response = await axios.put(`${API_URL}/mitra/${mitraId}/preferences`, {
        gender_preferences: selectedGenderArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setSnackbarMessage('Preferensi gender diperbarui');
        setSnackbarVisible(true);
        
        try {
          const userDataString = await AsyncStorage.getItem('user_data');
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            if (!userData.preferences) userData.preferences = {};
            userData.preferences.gender = selectedGenderArray;
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));
          }
        } catch (storageErr) {
          // Silent fail
        }
      } else {
        throw new Error(response.data?.message || 'Gagal memperbarui preferensi');
      }
    } catch (err) {
      setSelectedGenders(selectedGenders);
      Alert.alert('Error', 'Tidak dapat memperbarui preferensi gender');
    } finally {
      setUpdatingGender(false);
    }
  };

  const updateRadius = async (newRadius) => {
    if (!mitraId) {
      Alert.alert('Error', 'Tidak dapat mengidentifikasi akun mitra');
      return;
    }
    
    setUpdatingRadius(true);
    
    try {
      const endpoint = `${API_URL}/mitra/${mitraId}/radius`;
      const payload = { radius: newRadius };
      
      const response = await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        const userDataString = await AsyncStorage.getItem('user_data');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          userData.radius = newRadius;
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        }
        
        setSnackbarMessage('Radius diperbarui');
        setSnackbarVisible(true);
      } else {
        throw new Error(response.data?.message || 'Gagal memperbarui radius');
      }
    } catch (err) {
      setRadius(radius);
      Alert.alert('Error', 'Tidak dapat memperbarui radius');
    } finally {
      setUpdatingRadius(false);
    }
  };

  const handleRadiusPreset = (value) => {
    setRadius(value);
    updateRadius(value);
  };

  const handleRadiusInput = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    let value = parseInt(numericValue) || 0;
    setRadius(value);
  };

  const handleRadiusInputBlur = () => {
    let validRadius = radius;
    if (validRadius < 500) {
      validRadius = 500;
      setRadius(validRadius);
    } else if (validRadius > 20000) {
      validRadius = 20000;
      setRadius(validRadius);
    }
    
    updateRadius(validRadius);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Atur Servis" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#14A49C" />
            <Text style={styles.loadingText}>Memuat layanan...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="exclamation-circle" size={40} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              mode="contained" 
              style={styles.retryButton}
              onPress={fetchMitraServices}
            >
              Coba Lagi
            </Button>
          </View>
        )}

        {!loading && !error && (
          <>
            {/* Radius Setting Section */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Icon name="map-marked-alt" size={20} color="#14A49C" />
                  <Text style={styles.cardTitle}>Radius Penerimaan Order</Text>
                </View>
                
                <View style={styles.radiusInputContainer}>
                  <TextInput
                    style={styles.radiusInput}
                    value={radius.toString()}
                    onChangeText={handleRadiusInput}
                    onBlur={handleRadiusInputBlur}
                    keyboardType="numeric"
                    mode="outlined"
                    outlineColor="#14A49C"
                    activeOutlineColor="#14A49C"
                    disabled={updatingRadius}
                    right={<TextInput.Affix text="meter" />}
                  />
                  
                  {updatingRadius && (
                    <ActivityIndicator size="small" color="#14A49C" style={styles.loader} />
                  )}
                </View>
                
                <Text style={styles.description}>
                  Jarak maksimal untuk menerima pesanan
                </Text>
                
                <View style={styles.radiusVisual}>
                  <Icon name="location-arrow" size={16} color="#14A49C" />
                  <View style={styles.radiusLine}>
                    <View style={[styles.radiusBar, { width: `${Math.min(radius / 100, 100)}%` }]} />
                  </View>
                  <Text style={styles.radiusValue}>{(radius / 1000).toFixed(1)} km</Text>
                </View>
                
                <View style={styles.presetButtons}>
                  {radiusPresets.map((preset) => (
                    <TouchableOpacity
                      key={preset.value}
                      style={[
                        styles.presetButton,
                        radius === preset.value && styles.presetButtonActive
                      ]}
                      onPress={() => handleRadiusPreset(preset.value)}
                      disabled={updatingRadius}
                    >
                      <Text style={[
                        styles.presetButtonText,
                        radius === preset.value && styles.presetButtonTextActive
                      ]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card.Content>
            </Card>

            {/* Services Section */}
            {/* <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Icon name="concierge-bell" size={20} color="#14A49C" />
                  <Text style={styles.cardTitle}>Layanan Anda</Text>
                </View>
                
                {services.length === 0 ? (
                  <Text style={styles.emptyText}>Tidak ada layanan tersedia</Text>
                ) : (
                  services.map((service) => (
                    <View key={service.id} style={styles.serviceItem}>
                      <Image 
                        source={{ uri: service.icon_url }} 
                        style={[
                          styles.serviceIcon, 
                          { opacity: service.is_active ? 1 : 0.5 }
                        ]} 
                      />
                      <View style={styles.serviceInfo}>
                        <Text style={[
                          styles.serviceName,
                          { color: service.is_active ? '#333' : '#999' }
                        ]}>
                          {service.nama_layanan}
                        </Text>
                        <Text style={styles.serviceCategory}>
                          {service.kategori || 'Layanan'}
                        </Text>
                      </View>
                      {updatingService === service.id ? (
                        <ActivityIndicator size="small" color="#14A49C" />
                      ) : (
                        <Switch 
                          value={service.is_active} 
                          onValueChange={() => toggleService(service)}
                          trackColor={{ false: '#d0d0d0', true: '#a5e3e0' }}
                          thumbColor={service.is_active ? '#14A49C' : '#f0f0f0'}
                        />
                      )}
                    </View>
                  ))
                )}
              </Card.Content>
            </Card> */}

            {/* Gender Preferences Section */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Icon name="user-friends" size={20} color="#14A49C" />
                  <Text style={styles.cardTitle}>Preferensi Gender Customer</Text>
                </View>
                
                {genderOptions.map((gender) => (
                  <View key={gender.id} style={styles.genderItem}>
                    <Image source={gender.icon} style={styles.genderIcon} />
                    <Text style={styles.genderName}>{gender.name}</Text>
                    {updatingGender ? (
                      <ActivityIndicator size="small" color="#14A49C" />
                    ) : (
                      <Switch 
                        value={selectedGenders[gender.name]} 
                        onValueChange={() => toggleGender(gender.name)}
                        trackColor={{ false: '#d0d0d0', true: '#a5e3e0' }}
                        thumbColor={selectedGenders[gender.name] ? '#14A49C' : '#f0f0f0'}
                      />
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    margin: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginVertical: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#14A49C',
    marginTop: 8,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  radiusInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radiusInput: {
    flex: 1,
    backgroundColor: 'white',
  },
  loader: {
    marginLeft: 10,
  },
  radiusVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F0F9F9',
    borderRadius: 8,
  },
  radiusLine: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0F0F0',
    marginHorizontal: 10,
    borderRadius: 2,
  },
  radiusBar: {
    height: 4,
    backgroundColor: '#14A49C',
    borderRadius: 2,
  },
  radiusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14A49C',
    width: 50,
    textAlign: 'right',
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#14A49C',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  presetButtonActive: {
    backgroundColor: '#14A49C',
  },
  presetButtonText: {
    fontSize: 12,
    color: '#14A49C',
  },
  presetButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceCategory: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  genderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  genderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
  },
  genderName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
    color: '#333',
  },
  snackbar: {
    backgroundColor: '#333',
  },
});

export default AturServis;
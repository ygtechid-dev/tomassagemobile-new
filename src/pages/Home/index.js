import React, {useState, useEffect, useRef, useCallback} from 'react';
import { 
  Image, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Linking,
  ActivityIndicator,
  Platform,
  NativeEventEmitter,
  Alert,
  SafeAreaView,
  RefreshControl,
  ToastAndroid,
  NativeModules,
  AppState
} from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../context/APIUrl';
import Geolocation from '@react-native-community/geolocation';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { EnhancedBackgroundOrderModule } = NativeModules;

const FloatingOrderCard = ({ order, onPress }) => {
  if (!order) return null;
  
  return (
    <TouchableOpacity 
      style={styles.floatingCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.floatingCardContent}>
        <View style={styles.floatingCardHeader}>
          <View style={styles.pulseContainer}>
            <View style={styles.pulse} />
            <Icon name="motorcycle" size={20} color="#4CAF50" />
          </View>
          <View style={styles.floatingCardInfo}>
            <Text style={styles.floatingCardTitle}>Order Sedang Berjalan</Text>
            <Text style={styles.floatingCardSubtitle}>
              {order.nama_service}
            </Text>
          </View>
        </View>
        
        <View style={styles.floatingCardFooter}>
          <Text style={styles.floatingCardCustomer} numberOfLines={1}>
            {order.user?.nama_lengkap}
          </Text>
          <View style={styles.floatingCardAction}>
            <Text style={styles.floatingCardActionText}>Lihat Peta</Text>
            <Icon name="chevron-right" size={14} color="#14A49C" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Home = ({navigation}) => {
  const [userData, setUserData] = useState(null);
  const [saldo, setSaldo] = useState({
    current_balance: 0,
    total_earned: 0,
    total_withdrawn: 0
  });
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Tangerang');
  const [locationCoords, setLocationCoords] = useState({
    latitude: null,
    longitude: null
  });
  const [ongoingOrder, setOngoingOrder] = useState(null);
  const [backgroundServiceActive, setBackgroundServiceActive] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const isFocused = useIsFocused();

  // Test function untuk clear order ID dan trigger overlay
  const testClearAndShowOverlay = async () => {
    try {
      if (!EnhancedBackgroundOrderModule) {
        Alert.alert('Error', 'Module tidak tersedia');
        return;
      }

      // 1. Cek current order ID
      const currentId = await EnhancedBackgroundOrderModule.getCurrentOrderId();
      console.log('Current Order ID:', currentId);

      // 2. Clear order ID
      await EnhancedBackgroundOrderModule.clearCurrentOrderId();
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Order ID cleared! Tunggu 10 detik...', ToastAndroid.LONG);
      }

      Alert.alert(
        'Order ID Cleared', 
        `Previous ID: ${currentId}\n\nTunggu 10 detik untuk polling berikutnya.\nOverlay akan muncul jika ada order baru.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message);
    }
  };

  // Test function untuk show overlay manual
  const testShowOverlayManual = async () => {
    try {
      if (!EnhancedBackgroundOrderModule) {
        Alert.alert('Error', 'Module tidak tersedia');
        return;
      }

      const testOrderData = {
        id: "TEST_" + Date.now(),
        nama_customer: "Test Customer",
        nama_service: "Test Service - Body Massage",
        harga: 150000,
        alamat: "Jl. Test No. 123, Jakarta",
        durasi: "90 menit",
        metode_bayar: "Bayar di Tempat"
      };

      console.log('Showing test overlay with data:', testOrderData);

      await EnhancedBackgroundOrderModule.showTestOrderModal(testOrderData);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Test overlay ditampilkan!', ToastAndroid.SHORT);
      }

      console.log('Test overlay called successfully');
    } catch (error) {
      console.error('Error showing test overlay:', error);
      Alert.alert('Error', error.message);
    }
  };

  const initializeNativeModule = async () => {
    try {
      if (!EnhancedBackgroundOrderModule) return false;
      await requestOverlayPermission();
      
      if (userData?.id && locationCoords?.latitude && locationCoords?.longitude) {
        const config = {
          apiUrl: String(API_URL || ''),
          userId: String(userData.id),
          latitude: Number(locationCoords.latitude),
          longitude: Number(locationCoords.longitude)
        };

        await EnhancedBackgroundOrderModule.setConfig(config);
        return true;
      }
      return false;
    } catch (error) {
      if (error.message && !error.message.includes('cast')) {
        Alert.alert('Error', 'Gagal menginisialisasi layanan background');
      }
      return false;
    }
  };

  const requestOverlayPermission = async () => {
    try {
      if (!EnhancedBackgroundOrderModule) return false;
      await EnhancedBackgroundOrderModule.requestOverlayPermission();
      return true;
    } catch (error) {
      Alert.alert(
        'Izin Diperlukan',
        'Aplikasi membutuhkan izin untuk menampilkan notifikasi order.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() }
        ]
      );
      return false;
    }
  };

  const getServiceStatus = async () => {
    try {
      if (!EnhancedBackgroundOrderModule) return;
      const status = await EnhancedBackgroundOrderModule.getServiceStatus();
      setServiceStatus(status);
      setBackgroundServiceActive(status.isRunning);
    } catch (error) {
      console.error('Error getting service status:', error);
    }
  };

  const startBackgroundService = async () => {
    try {
      if (!userData?.id || !locationCoords?.latitude) {
        Alert.alert('Error', 'Data belum lengkap. Mohon tunggu sebentar.');
        return;
      }

      if (!EnhancedBackgroundOrderModule) {
        Alert.alert('Error', 'Layanan tidak tersedia di perangkat ini.');
        return;
      }

      const initialized = await initializeNativeModule();
      if (!initialized) {
        Alert.alert('Error', 'Gagal menginisialisasi layanan.');
        return;
      }

      await EnhancedBackgroundOrderModule.startBackgroundService();
      setBackgroundServiceActive(true);
      await getServiceStatus();
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Layanan background aktif', ToastAndroid.SHORT);
      }
      
      Alert.alert('Berhasil', 'Anda sekarang siap menerima pesanan baru');
    } catch (error) {
      let errorMessage = 'Gagal mengaktifkan layanan';
      if (error.message?.includes('OVERLAY_PERMISSION')) {
        errorMessage = 'Izin overlay diperlukan. Mohon berikan izin di pengaturan.';
      } else if (error.message?.includes('CONFIG_MISSING')) {
        errorMessage = 'Konfigurasi belum lengkap. Mohon refresh aplikasi.';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const stopBackgroundService = async () => {
    try {
      if (!EnhancedBackgroundOrderModule) return;
      await EnhancedBackgroundOrderModule.stopBackgroundService();
      setBackgroundServiceActive(false);
      await getServiceStatus();
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Layanan background berhenti', ToastAndroid.SHORT);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal menghentikan layanan');
    }
  };

  const refreshAllData = useCallback(async (isManual = false) => {
    if (isManual) setManualRefreshing(true);
    setRefreshing(true);
    
    try {
      await fetchUserData();
      getCurrentLocation();
      
      if (userData?.id) {
        await Promise.all([
          fetchSaldoData(userData.id),
          fetchMitraServices(userData.id),
          fetchOrderHistory(userData.id)
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memperbarui data');
    } finally {
      setRefreshing(false);
      if (isManual) setManualRefreshing(false);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Data diperbarui', ToastAndroid.SHORT);
      }
    }
  }, [userData, locationCoords]);

  const onRefresh = useCallback(() => {
    refreshAllData(false);
  }, [refreshAllData]);

  const fetchUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        
        await Promise.all([
          fetchSaldoData(parsedUserData.id),
          fetchMitraServices(parsedUserData.id),
          fetchOrderHistory(parsedUserData.id)
        ]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

 const MAPBOX_TOKEN = 'pk.eyJ1IjoieWdzcGFjZXNoaXAiLCJhIjoiY21nYWpsZ2dlMHZjczJrb2MzaDJ4b2kxZiJ9.xovhNU8rxyslka-YC1Y8sQ';

// Replace fungsi getCurrentLocation dengan yang baru ini:
const getCurrentLocation = () => {
  Geolocation.getCurrentPosition(
    async (info) => {
      const { latitude, longitude } = info.coords;
      setLocationCoords({ latitude, longitude });
      
      try {
        // Menggunakan Mapbox Geocoding API untuk reverse geocoding
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&language=id`
        );
        
        if (response.data?.features && response.data.features.length > 0) {
          // Mencari locality/place atau district dari features
          const features = response.data.features;
          
          // Prioritas pencarian: locality > place > district > region
          let locationName = 'Tangerang'; // default
          
          // Cari berdasarkan place_type
          const locality = features.find(f => f.place_type.includes('locality'));
          const place = features.find(f => f.place_type.includes('place'));
          const district = features.find(f => f.place_type.includes('district'));
          const region = features.find(f => f.place_type.includes('region'));
          
          if (locality) {
            locationName = locality.text;
          } else if (place) {
            locationName = place.text;
          } else if (district) {
            locationName = district.text;
          } else if (region) {
            locationName = region.text;
          } else if (features[0]) {
            // Fallback ke feature pertama
            locationName = features[0].text;
          }
          
          setLocation(locationName);
          
          console.log('Location detected:', locationName);
          console.log('Full address:', features[0]?.place_name);
        } else {
          setLocation('Tangerang');
        }
        
        // Update location ke backend
        const storedUserData = await AsyncStorage.getItem('user_data');
        const parsedUserData = JSON.parse(storedUserData);
      
        if (parsedUserData?.id) {
          // Dapatkan nama lokasi yang sudah di-set
          const currentLocation = response.data?.features?.[0]?.place_name || 'Tangerang';
          updateMitraLocation(parsedUserData.id, latitude, longitude, currentLocation);
        }
      } catch (error) {
        console.error('Error getting location name from Mapbox:', error);
        setLocation('Tangerang');
      }
    },
    (error) => {
      console.error('Geolocation error:', error);
      setLocation('Tangerang');
      Alert.alert(
        "Izin Lokasi Dibutuhkan",
        "Aplikasi membutuhkan akses lokasi untuk menampilkan pesanan terdekat.",
        [
          { text: "Nanti", style: "cancel" },
          { text: "Buka Pengaturan", onPress: () => Linking.openSettings() }
        ]
      );
    },
    { 
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000
    }
  );
};


  const checkLocationPermission = async () => {
    try {
      const locationPermission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      
      const permissionStatus = await check(locationPermission);
      
      if (permissionStatus === RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        const requestResult = await request(locationPermission);
        if (requestResult === RESULTS.GRANTED) {
          getCurrentLocation();
        }
      }
    } catch (error) {
      setLocation('Tangerang');
    }
  };

  const updateMitraLocation = async (mitraId, latitude, longitude, locationName) => {
    try {
      await axios.put(`${API_URL}/mitra/${mitraId}/location`, {
        latitude,
        longitude,
        location_name: locationName
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const fetchSaldoData = async (mitraId) => {
    try {
      const response = await axios.get(`${API_URL}/${mitraId}/balance`);
      if (response.data?.balance_summary) {
        setSaldo(response.data.balance_summary);
      }
    } catch (error) {
      try {
        await axios.post(`${API_URL}/balance/initialize`, { mitra_id: mitraId });
      } catch (initError) {
        console.error('Error initializing balance:', initError);
      }
    }
  };

  const fetchMitraServices = async (mitraId) => {
    try {
      const response = await axios.get(`${API_URL}/${mitraId}/services`);
      if (response.data?.success) {
        const services = response.data.data.filter(service => service.is_active === true) || [];
        setServices(services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchOrderHistory = async (mitraId) => {
    try {
      const response = await axios.get(`${API_URL}/mitra/${mitraId}/bookings`);
      if (response.data) {
        console.log('====================================');
        console.log('data', response.data);
        console.log('====================================');
        const allOrders = response.data.data || [];
        setOrders(response.data.data || []);
        const ongoing = allOrders.find(order => order.status === 'On Progress');
        setOngoingOrder(ongoing || null);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#FF9800';
      case 'On Progress': return '#2196F3';
      case 'Completed': return '#4CAF50';
      case 'Cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await fetchUserData();
      await checkLocationPermission();
    };
    initializeApp();

    // Setup event listener untuk response dari native module
    if (EnhancedBackgroundOrderModule) {
      const eventEmitter = new NativeEventEmitter(NativeModules.EnhancedBackgroundOrderModule);
      
      const subscription = eventEmitter.addListener('EnhancedBackgroundOrderEvent', (event) => {
        console.log('Event received:', event);
        
        if (event.type === 'ACCEPT_SUCCESS') {
          Alert.alert(
            'Berhasil!',
            `Order #${event.orderId} telah diterima!`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Refresh data orders
                  if (userData?.id) {
                    fetchOrderHistory(userData.id);
                  }
                  // Navigate ke halaman detail order atau history
                  navigation.navigate('History');
                }
              }
            ]
          );
          
          if (Platform.OS === 'android') {
            ToastAndroid.show('Order berhasil diterima!', ToastAndroid.LONG);
          }
        } 
        else if (event.type === 'ACCEPT_FAILED') {
          Alert.alert(
            'Gagal Menerima Order',
            event.error || 'Terjadi kesalahan saat menerima order',
            [{ text: 'OK' }]
          );
        }
        else if (event.type === 'DECLINE_SUCCESS') {
          Alert.alert(
            'Order Diabaikan',
            `Order #${event.orderId} telah diabaikan`,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (userData?.id) {
                    fetchOrderHistory(userData.id);
                  }
                }
              }
            ]
          );
          
          if (Platform.OS === 'android') {
            ToastAndroid.show('Order diabaikan', ToastAndroid.SHORT);
          }
        }
        else if (event.type === 'DECLINE_FAILED') {
          Alert.alert(
            'Gagal Mengabaikan Order',
            event.error || 'Terjadi kesalahan',
            [{ text: 'OK' }]
          );
        }
      });

      // Cleanup
      return () => {
        subscription.remove();
      };
    }
  }, []);

 useEffect(() => {
  const autoStartBackgroundService = async () => {
    if (
      userData &&
      locationCoords?.latitude &&
      locationCoords?.longitude &&
      EnhancedBackgroundOrderModule
    ) {
      await initializeNativeModule();
      await getServiceStatus();

      // ✅ Otomatis nyalakan service kalau belum aktif
      const status = await EnhancedBackgroundOrderModule.getServiceStatus();
      if (!status.isRunning) {
        console.log('🔄 Auto-start background service...');
        try {
          await EnhancedBackgroundOrderModule.startBackgroundService();
          setBackgroundServiceActive(true);
          if (Platform.OS === 'android') {
            ToastAndroid.show('Layanan background otomatis aktif ✅', ToastAndroid.SHORT);
          }
        } catch (err) {
          console.error('❌ Auto-start failed:', err);
        }
      }
    }
  };

  autoStartBackgroundService();
}, [userData, locationCoords]);


  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        if (EnhancedBackgroundOrderModule) {
          getServiceStatus();
        }
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState]);

  useFocusEffect(
    useCallback(() => {
      if (EnhancedBackgroundOrderModule) {
        getServiceStatus();
      }
    }, [])
  );

  if (loading || manualRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14A49C" />
        <Text style={{marginTop: 10}}>
          {manualRefreshing ? 'Memperbarui data...' : 'Memuat data...'}
        </Text>
      </View>
    );
  }

  const handleViewMap = () => {
    if (ongoingOrder) {
      navigation.navigate('OrderMap', { order: ongoingOrder });
    }
  };

  return (
    <>
      {ongoingOrder && (
        <FloatingOrderCard 
          order={ongoingOrder} 
          onPress={handleViewMap}
        />
      )}
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#14A49C']}
              tintColor="#14A49C"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            {/* Badge Aplikasi Terbaru */}
            <View style={styles.appVersionBadge}>
              <View style={styles.sparkle}>
                <Text style={styles.sparkleText}>✨</Text>
              </View>
              <Text style={styles.appVersionText}>APLIKASI VERSI TERBARU v2.3</Text>
              <View style={styles.sparkle}>
                <Text style={styles.sparkleText}>✨</Text>
              </View>
            </View>
            
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('LocationScreen')} 
                  style={styles.locationButton}
                >
                  <Icon name="map-marker-alt" size={16} color="white" />
                  <Text style={styles.locationText}>{location}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ProfileScreen')}
                >
                  {userData?.foto_profil ? (
                    <Image 
                      source={{ uri: userData.foto_profil }} 
                      style={styles.profileImage} 
                    />
                  ) : (
                    <View style={styles.profilePlaceholder}>
                      <Icon name="user" size={24} color="#888" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              
              <Text style={styles.greetingText}>
                Selamat Bekerja, Mitra {userData?.nama_lengkap}!
              </Text>
            </View>

            {/* Saldo Container */}
            <View style={styles.saldoContainer}>
              <View>
                <Text style={styles.saldoLabel}>Saldo Anda</Text>
                <Text style={styles.saldoAmount}>
                  {formatCurrency(saldo.current_balance)}
                </Text>
              </View>
            </View>
          </View>

          {/* Background Service Status */}
          {/* <View style={styles.serviceContainer}>
            <View style={styles.serviceHeader}>
              <View style={styles.serviceInfo}>
                <Icon 
                  name={backgroundServiceActive ? "check-circle" : "times-circle"} 
                  size={20} 
                  color={backgroundServiceActive ? '#4CAF50' : '#F44336'} 
                />
                <View style={styles.serviceTextContainer}>
                  <Text style={styles.serviceTitle}>
                    {backgroundServiceActive ? 'Siap Menerima Pesanan' : 'Belum Aktif'}
                  </Text>
                  <Text style={styles.serviceSubtitle}>
                    {backgroundServiceActive 
                      ? 'Sistem sedang mencari pesanan untuk Anda' 
                      : 'Aktifkan untuk mulai menerima pesanan'}
                  </Text>
                </View>
              </View>
            </View>
            
            <Button
              mode="contained"
              style={[
                styles.serviceButton, 
                { backgroundColor: backgroundServiceActive ? '#F44336' : '#4CAF50' }
              ]}
              icon={backgroundServiceActive ? "stop" : "play"}
              onPress={backgroundServiceActive ? stopBackgroundService : startBackgroundService}
            >
              {backgroundServiceActive ? 'Berhenti' : 'Mulai Bekerja'}
            </Button>
          </View> */}

          {/* TEST OVERLAY SECTION */}
          <View style={styles.testSection}>
            <Text style={styles.testSectionTitle}>🔧 Refresh Data</Text>
            <View style={styles.testButtonRow}>
              <Button
                mode="outlined"
                style={styles.testButton}
                onPress={testClearAndShowOverlay}
                icon="refresh"
              >
               Refresh Sekarang
              </Button>
            </View>
          </View>

          {/* Services Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Layanan Anda</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AturServis')}>
                <Text style={styles.viewAllText}>Atur Servis</Text>
              </TouchableOpacity>
            </View>
            
            {services.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="concierge-bell" size={40} color="#ccc" />
                <Text style={styles.emptyText}>Belum ada layanan aktif</Text>
                <Button 
                  mode="outlined" 
                  onPress={() => navigation.navigate('AturServis')}
                  style={styles.addButton}
                >
                  Tambah Layanan
                </Button>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.servicesScrollContent}
              >
                {services.map((service, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.serviceCardCompact}
                    activeOpacity={0.7}
                  >
                    <Image 
                      source={{ uri: service.icon_url }} 
                      style={styles.serviceIconCompact}
                      resizeMode="cover"
                    />
                    <Text style={styles.serviceNameCompact} numberOfLines={2}>
                      {service.nama_layanan}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Order History Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Riwayat Pesanan</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.viewAllText}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>
            
            {orders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="clipboard-list" size={40} color="#ccc" />
                <Text style={styles.emptyText}>Belum ada riwayat pesanan</Text>
              </View>
            ) : (
              orders.slice(0, 3).map((order, index) => (
                <View key={index} style={styles.orderCardCompact}>
                  <View style={styles.orderRowTop}>
                    <View style={styles.orderLeftSection}>
                      <Text style={styles.orderIdCompact}>#{order.id}</Text>
                      <Text style={styles.orderCustomerCompact} numberOfLines={1}>
                        {order.user.nama_lengkap}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadgeCompact, 
                      { backgroundColor: getStatusColor(order.status) }
                    ]}>
                      <Text style={styles.statusTextCompact}>{order.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderRowBottom}>
                    <Text style={styles.orderPriceCompact}>
                      {formatCurrency(order.harga_service)}
                    </Text>
                    <Text style={styles.orderDateCompact}>
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Important Notice */}
          {!backgroundServiceActive && (
            <View style={styles.noticeContainer}>
              <View style={styles.noticeHeader}>
                <Icon name="info-circle" size={20} color="#FF9800" />
                <Text style={styles.noticeTitle}>Penting</Text>
              </View>
              <Text style={styles.noticeText}>
                Aktifkan layanan untuk mulai menerima pesanan baru secara otomatis
              </Text>
              <Button
                mode="contained"
                style={styles.activateButton}
                icon="play"
                onPress={startBackgroundService}
              >
                Aktifkan Sekarang
              </Button>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#14A49C',
    paddingBottom: 20,
    paddingTop: 10,
  },
  appVersionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  appVersionText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginHorizontal: 6,
  },
  sparkle: {
    transform: [{ scale: 1.2 }],
  },
  sparkleText: {
    fontSize: 14,
  },
  headerContent: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  profilePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  saldoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saldoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  saldoAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  topupButton: {
    backgroundColor: '#14A49C',
    borderRadius: 8,
  },
  serviceContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceHeader: {
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  serviceButton: {
    borderRadius: 8,
  },
  testSection: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
  },
  testSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 12,
  },
  testButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  testButton: {
    flex: 1,
    borderColor: '#FF9800',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#14A49C',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
  },
  addButton: {
    borderColor: '#14A49C',
    borderRadius: 8,
  },
  servicesScrollContent: {
    paddingRight: 16,
  },
  serviceCardCompact: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  serviceIconCompact: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  serviceNameCompact: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
  orderCardCompact: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#14A49C',
  },
  orderRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderLeftSection: {
    flex: 1,
  },
  orderIdCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  orderCustomerCompact: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusTextCompact: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  orderRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderPriceCompact: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14A49C',
  },
  orderDateCompact: {
    fontSize: 11,
    color: '#999',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  noticeContainer: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  activateButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  floatingCardContent: {
    padding: 16,
  },
  floatingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pulseContainer: {
    position: 'relative',
    marginRight: 12,
  },
  pulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    opacity: 0.3,
    top: -10,
    left: -10,
  },
  floatingCardInfo: {
    flex: 1,
  },
  floatingCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  floatingCardSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  floatingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  floatingCardCustomer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  floatingCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingCardActionText: {
    fontSize: 13,
    color: '#14A49C',
    fontWeight: '500',
    marginRight: 4,
  },
});

export default Home;
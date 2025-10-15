import React, { useState, useEffect } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Linking,
  Platform,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { Button, Text, useTheme, Modal as PaperModal, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../context/APIUrl';

// Import images (Keep your existing imports)
import BodMes from '../../assets/bodmes.png';
import MesLur from '../../assets/meslur.png';
import TokWa from '../../assets/tokwa.png';
import SlimpLimp from '../../assets/slimlimp.png';
import Bumil from '../../assets/bumil.png';
import PasLa from '../../assets/pascalahir.png';
import Bayi from '../../assets/bayi.png';
import Anak from '../../assets/anak.png';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get screen width
const { width } = Dimensions.get('window');
const bannerWidth = width * 0.9;

// --- OrderModal Component (Keep your existing OrderModal component) ---
const OrderModal = ({ visible, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [showWinModal, setShowWinModal] = useState(false);

  useEffect(() => {
    if (!visible) {
      setTimeLeft(30);
      setShowWinModal(false);
      return;
    };

    if (timeLeft === 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, visible, onClose]);

  const handleAccept = () => {
    setShowWinModal(true);
  };

  const handleCloseWinModal = () => {
    setShowWinModal(false);
    onClose();
    Linking.openURL('https://maps.google.com/');
  };

  return (
    <>
      <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainerOrder}>
            <View style={styles.modalHeaderOrder}>
              <View>
                <Text style={styles.modalTitleOrder}>Order Masuk</Text>
                <Text style={styles.orderId}>ID #5443545</Text>
              </View>
              <View style={styles.countdownCircle}>
                <Text style={styles.countdownText}>{timeLeft}</Text>
              </View>
            </View>

            <View style={styles.sectionOrder}>
              <Text style={styles.labelOrder}>Tempat</Text>
              <Text style={styles.infoOrder}>Jl Kebayoran Baru No. 18 Melawai, Kota Jakarta Selatan, DKI Jakarta 12160</Text>
            </View>

            <View style={styles.sectionOrder}>
              <Text style={styles.labelOrder}>Nama Customer</Text>
              <Text style={styles.infoOrder}>Rudi Kawilarang</Text>
            </View>

            <View style={styles.sectionOrder}>
              <Text style={styles.labelOrder}>Paket/Produk</Text>
              <Text style={styles.infoOrder}>Full Body Massage Reflexy 60 menit</Text>
            </View>

            <View style={styles.sectionOrder}>
              <Text style={styles.labelOrder}>Keterangan Waktu</Text>
              <Text style={styles.infoOrder}>60 Menit</Text>
            </View>

            <View style={styles.sectionOrder}>
              <Text style={styles.labelOrder}>Total Pendapatan</Text>
              <Text style={styles.infoOrder}>Rp 95.000</Text>
            </View>

            <View style={styles.sectionOrder}>
              <Text style={styles.labelOrder}>Metode Bayar</Text>
              <Text style={styles.infoOrder}>Bayar di Tempat</Text>
            </View>

            <TouchableOpacity style={styles.acceptButtonOrder} onPress={handleAccept}>
              <Text style={styles.acceptButtonTextOrder}>Terima Pekerjaan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rejectButtonOrder} onPress={onClose}>
              <Text style={styles.rejectButtonTextOrder}>Abaikan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showWinModal} animationType="fade" onRequestClose={handleCloseWinModal}>
        <View style={styles.overlay}>
          <View style={[styles.modalContainerOrder, { backgroundColor: 'white', alignItems: 'center' }]}>
            <Image source={{uri: 'https://ygtechdev.my.id/files/photo-1740150761646-377136460.png'}} style={{ width: 200, height: 200, marginVertical: 20, resizeMode: 'contain' }} />
            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center'}}>Anda Mendapatkan Order!</Text>
            <TouchableOpacity style={styles.acceptButtonOrder} onPress={handleCloseWinModal}>
              <Text style={styles.acceptButtonTextOrder}>Navigasikan Ke Alamat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// --- Active Booking Component ---
const ActiveBookingCard = ({ booking, onPress }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FF9800';
      case 'On Progress':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending':
        return 'Menunggu Konfirmasi';
      case 'On Progress':
        return 'Sedang Berlangsung';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={styles.activeBookingCard} onPress={onPress}>
      <View style={styles.activeBookingHeader}>
        <View style={styles.activeBookingInfo}>
          <Text style={styles.activeBookingTitle}>Pesanan Aktif</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color="#666" />
      </View>
      
      <View style={styles.activeBookingDetails}>
        <Text style={styles.serviceName}>{booking.nama_service}</Text>
        <Text style={styles.serviceVariant}>{booking.varian_service}</Text>
        <Text style={styles.bookingDate}>📅 {booking.tanggal_booking}</Text>
        {/* Display therapist name with proper fallback */}
        <Text style={styles.therapistName}>
          👤 {booking.nama_terapis || 'Belum ditentukan'}
        </Text>
        <Text style={styles.totalPrice}>{formatPrice(booking.harga_service + (booking.biaya_tambahan || 0))}</Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Service Disabled Overlay Component ---
const ServiceDisabledOverlay = () => (
  <View style={styles.disabledOverlay}>
    <Icon name="lock" size={20} color="#666" />
    <Text style={styles.disabledText}>Selesaikan pesanan aktif terlebih dahulu</Text>
  </View>
);

const HomeCust = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('Mengambil lokasi...');
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [services, setServices] = useState([]);
  const [beautyServices, setBeautyServices] = useState([]);
  const [gaspolServices, setGaspolServices] = useState([]);

  const [banner, setBanner] = useState(null);
  const [isAllServicesModalVisible, setIsAllServicesModalVisible] = useState(false);
  const [isBeautyServicesModalVisible, setIsBeautyServicesModalVisible] = useState(false);
  
  // New states for active booking
  const [activeBooking, setActiveBooking] = useState(null);
  const [checkingBooking, setCheckingBooking] = useState(true);

  // --- Function to check active bookings ---
  const checkActiveBookings = async () => {
    try {
      setCheckingBooking(true);
      const userDataJson = await AsyncStorage.getItem('user_data');
      
      if (!userDataJson) {
        console.log('No user data found');
        setCheckingBooking(false);
        return;
      }

      const parsedUserData = JSON.parse(userDataJson);
      const userId = parsedUserData.id;

      // Fetch user's bookings using the API endpoint from backend
      const response = await axios.get(`${API_URL}/users/${userId}/bookings`);

      if (response.data) {
        // Find active booking (Pending or On Progress)
        const activeBookingData = response.data.data.find(booking => 
          booking.status === 'Pending' || booking.status === 'On Progress'
        );

        if (activeBookingData) {
          // If there's an active booking and it has a mitra assigned, fetch mitra data
          if (activeBookingData.id_mitra) {
            try {
              const mitraResponse = await axios.get(`${API_URL}/mitra/${activeBookingData.id_mitra}`);
              if (mitraResponse.data.success) {
                // Add mitra data to booking object
                activeBookingData.nama_terapis = mitraResponse.data.data.nama_lengkap;
                activeBookingData.foto_terapis = mitraResponse.data.data.foto_profil;
                console.log('Mitra data added to booking:', mitraResponse.data.data.nama_lengkap);
              }
            } catch (mitraError) {
              console.error('Error fetching mitra data:', mitraError);
              // Continue without mitra data
              activeBookingData.nama_terapis = 'Belum ditentukan';
            }
          } else {
            activeBookingData.nama_terapis = 'Menunggu konfirmasi terapis';
          }
        }

        setActiveBooking(activeBookingData || null);
        console.log('Active booking found:', activeBookingData);
      } else {
        console.log('No bookings found or unexpected response format');
        setActiveBooking(null);
      }
    } catch (error) {
      console.error('Error checking active bookings:', error);
      setActiveBooking(null);
    } finally {
      setCheckingBooking(false);
    }
  };

  // --- getCurrentLocation function ---
  const getCurrentLocation = () => {
    setLoading(true);
    
    Geolocation.getCurrentPosition(
      async (info) => {
        console.log('====================================');
        console.log('');
        console.log('====================================');
        const { latitude, longitude } = info.coords;
        console.log('Lokasi Pengguna:', latitude, longitude);
        
        try {
          const response = await axios.get(
            `https://api-bdc.net/data/reverse-geocode?latitude=${latitude}&longitude=${longitude}&localityLanguage=id&key=bdc_d081193b116d47d996b4e3802fbe4761`
          );
          
          console.log('Data Lokasi:', response.data);
          if (response.data && response.data.locality) {
            setLocation(response.data.locality);
          } else {
            setLocation('Tangerang');
          }
        } catch (error) {
          console.error('Error mendapatkan lokasi dari APIs:', error);
          setLocation('Tangerang');
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Error mendapatkan lokasi:', error);
        setLocation('Tangerang');
        setLoading(false);
      },
      { 
        enableHighAccuracy: false,
        timeout: 10000,
      }
    );
  };

  // --- fetchUserData function ---
  const fetchUserData = async () => {
    try {
      const userDataJson = await AsyncStorage.getItem('user_data');
      if (userDataJson) {
        const parsedUserData = JSON.parse(userDataJson);
        setUserData(parsedUserData);
        
        if (parsedUserData.id) {
          try {
            const response = await axios.get(`${API_URL}/users/${parsedUserData.id}`);
            if (response.data.success) {
              setUserData(response.data.data);
              await AsyncStorage.setItem('user_data', JSON.stringify(response.data.data));
            }
          } catch (apiError) {
            console.error('Error refreshing user data from API:', apiError);
          }
        }
      } else {
        console.log('No user data found in AsyncStorage');
        setUserData({ nama_lengkap: 'Pengguna' });
      }
    } catch (error) {
      console.error('Error fetching user data from AsyncStorage:', error);
      setUserData({ nama_lengkap: 'Pengguna' });
    }
  };

  // --- fetchServices function ---
  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/services`);
      console.log('Fetched services:', response.data);

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setServices(response.data.data);
        const filteredBeautyServices = response.data.data.filter(service => service.kategori === 'Beauty Care');
        setBeautyServices(filteredBeautyServices);
        const filteredGaspolServices =  response.data.data.filter(service => service.kategori === 'Gaspol');
        setGaspolServices(filteredGaspolServices);
     
      } else {
        console.warn('Unexpected API response format for services, using empty array');
        setServices([]);
        setBeautyServices([]);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setBeautyServices([]);
    }
  };

  // --- fetchBanner function ---
  const fetchBanner = async () => {
    try {
      const response = await axios.get(`${API_URL}/banners`);
      console.log('Fetched banners:', response.data);

      if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        setBanner(response.data.data[0]);
      } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setBanner(response.data[0]);
      } else {
        console.warn('No banners found or unexpected format.');
        setBanner({
          id: 'default',
          nama_banner: 'Promo Default',
          url_foto_banner: 'https://ygtechdev.my.id/files/photo-1740153283538-15414201.png'
        });
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
      setBanner({
        id: 'default-error',
        nama_banner: 'Promo Default',
        url_foto_banner: 'https://ygtechdev.my.id/files/photo-1740153283538-15414201.png'
      });
    }
  };

  // --- Handle service item press ---
  const handleServicePress = (item) => {
    if (activeBooking) {
      Alert.alert(
        'Pesanan Aktif Ditemukan',
        'Anda memiliki pesanan yang sedang berlangsung. Silakan selesaikan pesanan tersebut terlebih dahulu sebelum membuat pesanan baru.',
        [
          {
            text: 'Lihat Pesanan',
            onPress: () => navigation.navigate('OrderSummaryCust', { bookingId: activeBooking.id })
          },
          { text: 'Tutup', style: 'cancel' }
        ]
      );
      return;
    }
    console.log('====================================');
    console.log('itemser', item);
    console.log('====================================');
    
    if(item.kategori == "Gaspol") {
navigation.push('GaspolDelivery',);
    } else {
navigation.push('ServiceDetail', { 
      serviceId: item.id, 
      serviceName: item.nama_layanan_utama 
    });
    }
    
  };

  // --- Handle active booking press ---
  const handleActiveBookingPress = () => {
    if (activeBooking) {
      navigation.navigate('OrderSummaryCust', { bookingId: activeBooking.id });
    }
  };

  // --- useEffect for initial data fetching ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      getCurrentLocation();
      await Promise.all([
        fetchUserData(),
        fetchServices(),
        fetchBanner(),
        checkActiveBookings()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // --- Focus listener to refresh active booking ---
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkActiveBookings();
    });

    return unsubscribe;
  }, [navigation]);

  // Filter services
  const nonBeautyServices = services.filter(s => s.kategori !== 'Beauty Care' && s.kategori !== 'Gaspol');
  const displayedServices = nonBeautyServices.slice(0, 4);
  const displayedBeautyServices = beautyServices.slice(0, 4);
  const displayedGaspolServices = gaspolServices.slice(0, 4);


  // Reusable render function for service items
  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleServicePress(item)}
      style={[
        styles.serviceItem,
        activeBooking && styles.serviceItemDisabled
      ]}
      disabled={activeBooking !== null}
    >
      <View style={styles.serviceIconContainer}>
        <Image
          source={item.icon_url ? { uri: item.icon_url } : BodMes}
          style={[
            styles.serviceIcon,
            activeBooking && styles.serviceIconDisabled
          ]}
          resizeMode='contain'
        />
        {activeBooking && <ServiceDisabledOverlay />}
      </View>
      <Text style={[
        styles.serviceName,
        activeBooking && styles.serviceNameDisabled
      ]} numberOfLines={2}>
        {item.nama_layanan || 'Layanan'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                source={{uri: 'https://ygtechdev.my.id/files/photo-1742080655518-601765960.png'}}
                style={styles.logo}
                resizeMode='contain'
              />
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>
                  Hi, {userData ? userData.nama_lengkap : 'Pengguna'}
                </Text>
                <TouchableOpacity
                  style={styles.locationContainer}
                  onPress={getCurrentLocation}
                >
                  <Icon name='map-marker' size={20} color='#FF69B4' />
                  <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
                </TouchableOpacity>
              </View>
            </View>
          
          </View>

          {/* Banner Section */}
          <View style={styles.bannerSection}>
            {banner ? (
              <Image
                source={{ uri: banner.url_foto_banner }}
                style={styles.banner}
                resizeMode='cover'
              />
            ) : (
              <View style={[styles.banner, styles.bannerPlaceholder]}>
                <ActivityIndicator size="small" color="#888" />
              </View>
            )}
          </View>

          {/* Active Booking Section */}
          {activeBooking && (
            <View style={styles.activeBookingSection}>
              <ActiveBookingCard 
                booking={activeBooking} 
                onPress={handleActiveBookingPress}
              />
            </View>
          )}

          {/* Service Categories - Non-Beauty Care */}
          <View style={styles.servicesContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Layanan Massage</Text>
              {nonBeautyServices.length > 4 && !activeBooking && (
                <TouchableOpacity onPress={() => setIsAllServicesModalVisible(true)}>
                  <Text style={styles.seeAllText}>Lihat Semua</Text>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#2B8E87" style={styles.loader} />
            ) : displayedServices.length > 0 ? (
              <FlatList
                data={displayedServices}
                numColumns={4}
                scrollEnabled={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderServiceItem}
                columnWrapperStyle={styles.serviceRow}
              />
            ) : (
              !loading && <Text style={styles.noDataText}>Layanan tidak tersedia saat ini.</Text>
            )}
          </View>

          {/* Beauty Care Services Section */}
          <View style={styles.servicesContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Beauty Care</Text>
              {beautyServices.length > 4 && !activeBooking && (
                <TouchableOpacity onPress={() => setIsBeautyServicesModalVisible(true)}>
                  <Text style={styles.seeAllText}>Lihat Semua</Text>
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#FF69B4" style={styles.loader} />
            ) : displayedBeautyServices.length > 0 ? (
              <FlatList
                data={displayedBeautyServices}
                numColumns={4}
                scrollEnabled={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderServiceItem}
                columnWrapperStyle={styles.serviceRow}
              />
            ) : (
              !loading && <Text style={styles.noDataText}>Layanan Beauty Care tidak tersedia saat ini.</Text>
            )}
          </View>

          {/*Gaspol Services */}
     <View style={styles.servicesContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gaspol Delivery</Text>
              {/* {beautyServices.length > 4 && !activeBooking && (
                <TouchableOpacity onPress={() => setIsBeautyServicesModalVisible(true)}>
                  <Text style={styles.seeAllText}>Lihat Semua</Text>
                </TouchableOpacity>
              )} */}
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#FF69B4" style={styles.loader} />
            ) : displayedGaspolServices.length > 0 ? (
              <FlatList
                data={displayedGaspolServices}
                numColumns={4}
                scrollEnabled={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderServiceItem}
                columnWrapperStyle={styles.serviceRow}
              />
            ) : (
              !loading && <Text style={styles.noDataText}>Layanan Beauty Care tidak tersedia saat ini.</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Modal to show Order */}
      <OrderModal visible={orderModalVisible} onClose={() => setOrderModalVisible(false)} />

      {/* Modal for Loading */}
      <PaperModal visible={loading && (!banner || services.length === 0)} contentContainerStyle={styles.loadingModalContainer}>
        <ActivityIndicator size="large" color="#2B8E87" />
      </PaperModal>

      {/* Modal for All Services (Non-Beauty Care) */}
      <Modal
        visible={isAllServicesModalVisible && !activeBooking}
        animationType="slide"
        onRequestClose={() => setIsAllServicesModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalContainerAllServices}>
            <View style={styles.modalHeaderAllServices}>
              <Text style={styles.modalTitleAllServices}>Semua Layanan</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setIsAllServicesModalVisible(false)}
                style={styles.closeButton}
              />
            </View>
            <FlatList
              data={nonBeautyServices}
              numColumns={4}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderServiceItem}
              contentContainerStyle={styles.modalListContainer}
              ListEmptyComponent={<Text style={styles.noDataText}>Tidak ada layanan lain.</Text>}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal for All Beauty Care Services */}
      <Modal
        visible={isBeautyServicesModalVisible && !activeBooking}
        animationType="slide"
        onRequestClose={() => setIsBeautyServicesModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalContainerAllServices}>
            <View style={styles.modalHeaderAllServices}>
              <Text style={[styles.modalTitleAllServices, { color: '#FF69B4' }]}>Semua Layanan Beauty Care</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setIsBeautyServicesModalVisible(false)}
                style={styles.closeButton}
              />
            </View>
            <FlatList
              data={beautyServices}
              numColumns={4}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderServiceItem}
              contentContainerStyle={styles.modalListContainer}
              ListEmptyComponent={<Text style={styles.noDataText}>Tidak ada layanan Beauty Care lain.</Text>}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  
  // Header styles
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : 10,
    marginBottom: 10,
    height: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
    padding: 5,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    marginLeft: 5,
    color: '#555',
    flexShrink: 1,
  },

  // Banner Section styles
  bannerSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  banner: {
    width: bannerWidth,
    height: 150,
    borderRadius: 12,
  },
  bannerPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Active Booking styles
  activeBookingSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  activeBookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2B8E87',
  },
  activeBookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeBookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeBookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeBookingDetails: {
    gap: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceVariant: {
    fontSize: 14,
    color: '#666',
  },
  bookingDate: {
    fontSize: 13,
    color: '#666',
  },
  therapistName: {
    fontSize: 13,
    color: '#666',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B8E87',
    marginTop: 4,
  },

  // Disabled service styles
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  disabledText: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  serviceItemDisabled: {
    opacity: 0.6,
  },
  serviceIconDisabled: {
    opacity: 0.5,
  },
  serviceNameDisabled: {
    color: '#999',
  },

  // Services styles
  servicesContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2B8E87',
    fontWeight: '500',
  },
  loader: {
    marginTop: 20,
    marginBottom: 20,
  },
  serviceRow: {
    // justifyContent: 'space-between',
  },
  serviceItem: {
    flex: 1,
    maxWidth: '25%',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#E0F7FA',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    position: 'relative',
  },
  serviceIcon: {
    width: 30,
    height: 30,
  },
  serviceName: {
    fontSize: 11,
    textAlign: 'center',
    color: '#444',
    marginTop: 2,
    minHeight: 30,
  },
  noDataText: {
    textAlign: 'center',
    paddingVertical: 30,
    color: '#777',
    fontSize: 14,
  },

  // Loading Modal styles
  loadingModalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  // All Services Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalContainerAllServices: {
    flex: 1,
  },
  modalHeaderAllServices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitleAllServices: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    margin: -8,
  },
  modalListContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },

  // Order Modal styles
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainerOrder: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeaderOrder: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  modalTitleOrder: {
    fontSize: 19,
    fontWeight: "bold",
    color: '#333',
  },
  countdownCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  orderId: {
    color: "gray",
    fontSize: 13,
    marginBottom: 10,
  },
  sectionOrder: {
    width: "100%",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  labelOrder: {
    fontSize: 13,
    fontWeight: "600",
    color: '#555',
    marginBottom: 3,
  },
  infoOrder: {
    fontSize: 14,
    color: "#333",
  },
  acceptButtonOrder: {
    backgroundColor: "#2B8E87",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
  },
  acceptButtonTextOrder: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  rejectButtonOrder: {
    marginTop: 12,
    padding: 5,
    width: "100%",
    alignItems: "center",
  },
  rejectButtonTextOrder: {
    color: "#E53935",
    fontSize: 14,
    fontWeight: '500',
  }
})

export default HomeCust
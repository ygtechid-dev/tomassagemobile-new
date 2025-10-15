import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Modal, 
  Image, 
  ScrollView, 
  Animated, 
  Easing,
  Dimensions,
  Linking,
  Platform,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { 
  Text, 
  Button, 
  Surface, 
  Avatar, 
  Card, 
  IconButton, 
  ActivityIndicator,
  Divider,
  RadioButton 
} from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../../context/APIUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const BookingSearchScreen = ({ route, navigation }) => {
  // Get data from previous screen
  const { 
    service, 
    selectedVariant, 
    selectedDate, 
    totalPrice, 
    therapistGender, 
    location 
  } = route.params || {};

  console.log('therapistLoc', location);
  
  // States
  const [searching, setSearching] = useState(true);
  const [searchFailed, setSearchFailed] = useState(false);
  const [availableMitras, setAvailableMitras] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [spinValue] = useState(new Animated.Value(0));
  const [bookingId, setBookingId] = useState(null);
  const [creatingBooking, setCreatingBooking] = useState(false);

  // Get user ID from AsyncStorage
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserId(parsedData.id);
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    };

    getUserId();
  }, []);

  // Start rotation animation
  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    };

    if (searching) {
      startAnimation();
    }
  }, [searching, spinValue]);

  // Convert rotation value to degrees
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Fetch nearby mitra on component mount
  useEffect(() => {
    if (location && location.latitude && location.longitude) {
      searchNearbyMitra();
    } else {
      setSearchFailed(true);
      setSearching(false);
    }
  }, []);

  // Simulate search progress
  useEffect(() => {
    let timer;
    if (searching && searchCount < 100) {
      timer = setTimeout(() => {
        setSearchCount(prev => prev + 1);
      }, 100);
    }
    return () => clearTimeout(timer);
  }, [searching, searchCount]);

  // Create Google Maps URL for user's location
  const createGoogleMapsUrl = (latitude, longitude) => {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  // Search for nearby mitra
  const searchNearbyMitra = async () => {
    try {
      console.log('tmit', therapistGender);
      
      setSearching(true);
      setSearchFailed(false);
      console.log('Sending mitra search request with params:', {
        longitude: location.longitude,
        latitude: location.latitude,
        service_id: service?.id,
        customer_gender: therapistGender,
        totalPrice: totalPrice
      });
      
      // Make API call to get nearby mitra
      const response = await axios.get(`${API_URL}/mitras/nearbymitra`, {
        params: {
          longitude: location.longitude,
          latitude: location.latitude,
          service_id: service?.id,
          customer_gender: therapistGender,
          totalPrice: totalPrice
        }
      });
      
      console.log('Mitra search response:', response.data.data);
      
      // Simulate delay for better UX (remove in production)
      setTimeout(() => {
        if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
          // Store all available mitras
          setAvailableMitras(response.data.data);
          setSearching(false);
          
          // Show modal with mitra info after a short delay
          setTimeout(() => {
            setModalVisible(true);
          }, 500);
        } else {
          setSearchFailed(true);
          setSearching(false);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error searching for mitra:', error.response?.data || error);
      setSearchFailed(true);
      setSearching(false);
    }
  };

  // Create booking transaction
  const createBookingTransaction = async () => {
    if (!userId) return null;
    
    setCreatingBooking(true);
    
    try {
      const mapsUrl = createGoogleMapsUrl(location.latitude, location.longitude);
      
      const bookingData = {
        id_user: userId,
        id_mitra: null, // Will be filled when a mitra accepts the booking
        nama_service: service?.nama_layanan || 'Full Body Massage',
        harga_service: totalPrice,
        varian_service: `${selectedVariant?.durasi_menit || 60} menit`,
        url_maps_user: mapsUrl,
        status: 'Pending', // Changed to Pending from On Progress
        gender_select: therapistGender === 'male' ? 'Pria' : 'Wanita',
        progress_tracking: 'Menunggu konfirmasi terapis',
        tanggal_booking: selectedDate,
        alamat_user: location.address,
        latitude_user: location.latitude,
        longitude_user: location.longitude
      };
      console.log('KIRIIR URL:', bookingData);
      
      const response = await axios.post(`${API_URL}/bookings`, bookingData);
      
      console.log('Booking created:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        setBookingId(response.data.data.id);
        return response.data.data.id;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating booking:', error.response);
      return null;
    } finally {
      setCreatingBooking(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'Rp0';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate distance in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d.toFixed(1);
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  // Open location in Google Maps
  const openLocationInMaps = () => {
    const url = createGoogleMapsUrl(location.latitude, location.longitude);
    Linking.openURL(url);
  };

  // Handle booking confirmation
  const confirmBooking = async () => {
    // Create booking transaction first
    const booking_id = await createBookingTransaction();
    
    if (booking_id) {
      // Navigate to success screen
      navigation.navigate('BookingSuccess', {
        service,
        selectedVariant,
        selectedDate,
        totalPrice,
        therapistGender,
        location,
        booking_id
      });
    } else {
      // Show error (in a real app, you'd have a proper error handling UI)
      alert('Failed to create booking. Please try again.');
    }
  };

  // Retry search
  const retrySearch = () => {
    setSearchCount(0);
    searchNearbyMitra();
  };

  // Render a single mitra item
  const renderMitraItem = ({ item }) => (
    <Card style={styles.mitraCard}>
      <Card.Content style={styles.mitraCardContent}>
        <Avatar.Image 
          source={{ uri: item.foto_profil || 'https://ygtechdev.my.id/files/photo-1740153200831-184538136.png' }} 
          size={50} 
          style={styles.mitraCardAvatar}
        />
        <View style={styles.mitraCardInfo}>
          <Text style={styles.mitraCardName}>{item.nama_lengkap || 'Terapis'}</Text>
          <Text style={styles.mitraCardDistance}>{item.distance} km dari lokasi Anda</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Searching View */}
      {searching && (
        <View style={styles.searchingContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Avatar.Icon 
              icon="magnify" 
              size={80} 
              color="#FFF" 
              style={styles.searchIcon} 
            />
          </Animated.View>
          
          <Text style={styles.searchingTitle}>Mencari Terapis Terdekat</Text>
          <Text style={styles.searchingSubtitle}>
            Mohon tunggu sebentar, kami sedang mencarikan terapis terbaik untuk Anda
          </Text>
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${searchCount}%` }]} />
          </View>
          <Text style={styles.progressText}>{searchCount}%</Text>
          
          <View style={styles.bookingDetails}>
            <Text style={styles.bookingTitle}>Detail Booking:</Text>
            <Text style={styles.bookingItem}>
              Layanan: {service?.nama_layanan || 'Full Body Massage'}
            </Text>
            <Text style={styles.bookingItem}>
              Durasi: {selectedVariant?.durasi_menit || 60} menit
            </Text>
            <Text style={styles.bookingItem}>
              Tanggal: {selectedDate || 'Hari Ini'}
            </Text>
            <Text style={styles.bookingItem}>
              Total: {formatPrice(totalPrice)}
            </Text>
            <Text style={styles.bookingItem}>
              Terapis: {therapistGender === 'male' ? 'Pria' : 'Wanita'}
            </Text>
            <TouchableOpacity onPress={openLocationInMaps}>
              <Text style={styles.locationLink}>
                Lihat Lokasi di Google Maps
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Failed View */}
      {searchFailed && (
        <View style={styles.failedContainer}>
          <Avatar.Icon 
            icon="close-circle" 
            size={80} 
            color="#FFF" 
            style={styles.failedIcon} 
          />
          
          <Text style={styles.failedTitle}>Pencarian Gagal</Text>
          <Text style={styles.failedSubtitle}>
            Maaf, kami tidak dapat menemukan terapis yang tersedia pada saat ini. Silakan coba lagi nanti atau ubah lokasi Anda.
          </Text>
          
          <Button 
            mode="contained" 
            onPress={retrySearch}
            style={styles.retryButton}
            contentStyle={styles.buttonContent}
          >
            Coba Lagi
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            contentStyle={styles.buttonContent}
          >
            Kembali
          </Button>
          
          <TouchableOpacity onPress={openLocationInMaps} style={styles.mapsLink}>
            <Text style={styles.mapsLinkText}>
              Lihat Lokasi di Google Maps
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mitra Found Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terapis Ditemukan!</Text>
              <IconButton 
                icon="close" 
                size={24} 
                onPress={() => setModalVisible(false)} 
              />
            </View>
            
            <ScrollView>
              {/* Available Therapists Section */}
              <View style={styles.availableMitrasSection}>
                <Text style={styles.sectionTitle}>Berikut terapis yang berada di dekat Anda</Text>
                
                <FlatList
                  data={availableMitras}
                  renderItem={renderMitraItem}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.mitraList}
                  scrollEnabled={false} // Disable scroll inside FlatList as we're inside ScrollView
                />
              </View>
              
              <Divider style={styles.divider} />
              
              {(
                <>
                  <View style={styles.bookedService}>
                    <Text style={styles.sectionTitle}>Layanan yang Dipesan</Text>
                    <Card style={styles.serviceCard}>
                      <Card.Content style={styles.serviceCardContent}>
                        <Image 
                          source={{ uri: service?.icon_url || 'https://ygtechdev.my.id/files/photo-1740154263678-788610960.png' }} 
                          style={styles.serviceImage} 
                        />
                        <View style={styles.serviceDetails}>
                          <Text style={styles.serviceName}>{service?.nama_layanan || 'Full Body Massage'}</Text>
                          <Text style={styles.serviceDuration}>{selectedVariant?.durasi_menit || 60} menit</Text>
                          <Text style={styles.servicePrice}>{formatPrice(totalPrice)}</Text>
                        </View>
                      </Card.Content>
                    </Card>
                  </View>
                  
                  <View style={styles.locationSection}>
                    <Text style={styles.sectionTitle}>Lokasi Anda</Text>
                    <Card style={styles.locationCard}>
                      <Card.Content>
                        <View style={styles.addressRow}>
                          <IconButton icon="map-marker" size={20} style={styles.addressIcon} />
                          <Text style={styles.addressText}>{location?.address || 'Lokasi Anda'}</Text>
                        </View>
                        <TouchableOpacity onPress={openLocationInMaps} style={styles.viewInMaps}>
                          <Text style={styles.viewInMapsText}>
                            Lihat di Google Maps
                          </Text>
                        </TouchableOpacity>
                      </Card.Content>
                    </Card>
                  </View>
                  
                  <View style={styles.bookingTimeSection}>
                    <Text style={styles.sectionTitle}>Waktu Booking</Text>
                    <Card style={styles.timeCard}>
                      <Card.Content>
                        <View style={styles.timeRow}>
                          <IconButton icon="calendar" size={20} style={styles.timeIcon} />
                          <Text style={styles.timeText}>{selectedDate || 'Hari Ini'}</Text>
                        </View>
                      </Card.Content>
                    </Card>
                  </View>
                </>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button 
                mode="contained" 
                onPress={confirmBooking}
                style={styles.confirmButton}
                contentStyle={styles.buttonContent}
                loading={creatingBooking}
                disabled={creatingBooking}
              >
                Konfirmasi Booking
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  searchIcon: {
    backgroundColor: '#00a699',
    marginBottom: 24,
  },
  searchingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00a699',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  bookingDetails: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bookingItem: {
    fontSize: 14,
    marginBottom: 8,
  },
  locationLink: {
    color: '#00a699',
    textDecorationLine: 'underline',
    marginTop: 12,
    fontSize: 14,
  },
  failedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  failedIcon: {
    backgroundColor: '#d32f2f',
    marginBottom: 24,
  },
  failedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  failedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#00a699',
  },
  backButton: {
    width: '100%',
    borderRadius: 12,
    borderColor: '#00a699',
    marginBottom: 16,
  },
  mapsLink: {
    padding: 8,
  },
  mapsLinkText: {
    color: '#00a699',
    textDecorationLine: 'underline',
  },
  buttonContent: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  availableMitrasSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  mitraList: {
    width: '100%',
    marginBottom: 8,
  },
  mitraCard: {
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mitraCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mitraCardAvatar: {
  },
  mitraCardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  mitraCardName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mitraCardDistance: {
    fontSize: 14,
    color: '#00a699',
  },
  divider: {
    marginHorizontal: 16,
    height: 1,
    marginVertical: 8,
  },
  bookedService: {
    padding: 16,
  },
  serviceCard: {
    borderRadius: 12,
  },
  serviceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  serviceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  serviceDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00a699',
    marginTop: 4,
  },
  locationSection: {
    padding: 16,
  },
  locationCard: {
    borderRadius: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIcon: {
    margin: 0,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
  },
  viewInMaps: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  viewInMapsText: {
    color: '#00a699',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  bookingTimeSection: {
    padding: 16,
    paddingTop: 0,
  },
  timeCard: {
    borderRadius: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    margin: 0,
  },
  timeText: {
    flex: 1,
    fontSize: 14,
  },
  modalActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  confirmButton: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#00a699',
  },
});

export default BookingSearchScreen;
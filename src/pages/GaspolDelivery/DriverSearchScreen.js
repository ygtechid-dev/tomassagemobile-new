import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../context/APIUrl';

const { width } = Dimensions.get('window');

const DriverSearchScreen = ({ navigation, route }) => {
  const { pickupData, dropoffData, detailData } = route.params || {};

  // States
  const [searching, setSearching] = useState(true);
  const [searchFailed, setSearchFailed] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
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
    if (searching) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [searching]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Search for nearby drivers
  useEffect(() => {
    if (pickupData?.pickupPoint?.coordinates) {
      searchNearbyDrivers();
    } else {
      setSearchFailed(true);
      setSearching(false);
    }
  }, []);

  // Simulate search progress
  useEffect(() => {
    let timer;
    if (searching && searchProgress < 100) {
      timer = setTimeout(() => {
        setSearchProgress((prev) => prev + 2);
      }, 50);
    }
    return () => clearTimeout(timer);
  }, [searching, searchProgress]);

  const formatPrice = (price) => {
    return `Rp ${price?.toLocaleString('id-ID') || '0'}`;
  };

  // Create Google Maps URL
  const createGoogleMapsUrl = (latitude, longitude) => {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  // Map vehicle type to match database format
  const mapVehicleType = (vehicleTitle) => {
    const vehicleMap = {
      'Motor': 'motor',
      'Mobil MPV': 'mobil_mpv',
      'Pickup': 'pickup',
      'Truk': 'truk'
    };
    return vehicleMap[vehicleTitle] || 'motor';
  };

  const searchNearbyDrivers = async () => {
    try {
      setSearching(true);
      setSearchFailed(false);

      const { latitude, longitude } = pickupData.pickupPoint.coordinates;
      const vehicleType = mapVehicleType(detailData?.vehicleDetails?.title);

      console.log('Searching drivers with params:', {
        latitude,
        longitude,
        totalPrice: detailData?.price || 0,
        service_id: '37', // ID service untuk Gaspol
        vehicle_type: vehicleType
      });

      const response = await axios.get(`${API_URL}/mitras/nearbymitragaspol`, {
        params: {
          latitude,
          longitude,
          totalPrice: detailData?.price || 0,
          service_id: '37',
          vehicle_type: vehicleType
        },
      });

      console.log('Driver search response:', response.data);

      // Simulate delay for better UX
      setTimeout(() => {
        if (
          response.data &&
          response.data.success &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          setAvailableDrivers(response.data.data);
          setSearching(false);
          setTimeout(() => setModalVisible(true), 500);
        } else {
          setSearchFailed(true);
          setSearching(false);
        }
      }, 2500);
    } catch (error) {
      console.error('Error searching drivers:', error.response?.data || error);
      setSearchFailed(true);
      setSearching(false);
    }
  };

  const createDeliveryBooking = async () => {
    if (!userId) {
      console.error('User ID not found');
      return null;
    }

    setCreatingBooking(true);

    try {
      // Generate Google Maps URL for pickup location
      const mapsUrl = createGoogleMapsUrl(
        pickupData.pickupPoint.coordinates.latitude,
        pickupData.pickupPoint.coordinates.longitude
      );

      // Format tanggal booking (sekarang)
      const now = new Date();
      const bulanIndo = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const tanggalBooking = `${now.getDate()} ${bulanIndo[now.getMonth()]} ${now.getFullYear()}`;

      const bookingData = {
        id_user: userId,
        id_mitra: null, // Will be assigned when driver accepts
        nama_service: 'Gaspol Delivery',
        harga_service: detailData?.price + 3000, // Total including admin fee
        varian_service: `${detailData?.vehicleDetails?.title} - ${detailData?.distance} km`,
        url_maps_user: mapsUrl,
        status: 'Pending',
        gender_select: 'Pria', // Gaspol tidak perlu pilih gender
        progress_tracking: 'Mencari driver terdekat',
        tanggal_booking: tanggalBooking,
        
        // Pickup location
        alamat_user: pickupData.pickupPoint.address,
        latitude_user: pickupData.pickupPoint.coordinates.latitude,
        longitude_user: pickupData.pickupPoint.coordinates.longitude,
        
        // Driver location (will be filled when driver accepts)
        longitude_mitra: null,
        latitude_mitra: null,
        
        // Drop-off location (tujuan)
        longitude_tujuan: dropoffData.dropoffPoint.coordinates.longitude,
        latitude_tujuan: dropoffData.dropoffPoint.coordinates.latitude,
        alamat_tujuan: dropoffData.dropoffPoint.address,
        
        // Delivery details
        nama_barang: detailData?.itemDetails?.title || 'Paket',
        jarak_kirim: detailData?.distance,
        kendaraan: detailData?.vehicleDetails?.title
      };

      console.log('Creating booking with data:', bookingData);

      const response = await axios.post(`${API_URL}/bookings`, bookingData);

      console.log('Booking created:', response.data);

      if (response.data && response.data.success && response.data.data) {
        setBookingId(response.data.data.id);
        return response.data.data.id;
      }

      return null;
    } catch (error) {
      console.error('Error creating booking:', error.response?.data || error);
      return null;
    } finally {
      setCreatingBooking(false);
    }
  };

  const handleConfirmOrder = async () => {
    const booking_id = await createDeliveryBooking();

    if (booking_id) {
      // Navigate to success/tracking screen
      navigation.navigate('OrderSuccess', {
        bookingId: booking_id,
        pickupData,
        dropoffData,
        detailData,
        availableDrivers
      });
    } else {
      Alert.alert('Error', 'Gagal membuat pesanan. Silakan coba lagi.');
    }
  };

  const retrySearch = () => {
    setSearchProgress(0);
    searchNearbyDrivers();
  };

  const renderDriverItem = ({ item }) => (
    <View style={styles.driverCard}>
      <Image
        source={{
          uri:
            item.foto_profil ||
            'https://ui-avatars.com/api/?name=' + (item.nama_lengkap || 'Driver'),
        }}
        style={styles.driverAvatar}
      />
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{item.nama_lengkap || 'Driver Gaspol'}</Text>
        <View style={styles.driverMeta}>
          <Icon name="map-marker-distance" size={14} color="#26d0ce" />
          <Text style={styles.driverDistance}>{item.distance} km dari Anda</Text>
        </View>
        {item.vehicle_type && (
          <View style={styles.driverVehicle}>
            <Icon name="motorbike" size={12} color="#999" />
            <Text style={styles.driverVehicleText}>
              {item.vehicle_type.charAt(0).toUpperCase() + item.vehicle_type.slice(1).replace('_', ' ')}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.driverBadge}>
        <Icon name="check-circle" size={20} color="#26d0ce" />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Searching View */}
      {searching && (
        <View style={styles.searchingContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <View style={styles.searchIconContainer}>
              <Icon name="truck-fast" size={60} color="#26d0ce" />
            </View>
          </Animated.View>

          <Text style={styles.searchingTitle}>Mencari Driver Terdekat</Text>
          <Text style={styles.searchingSubtitle}>
            Mohon tunggu, kami sedang mencarikan driver terbaik untuk Anda
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${searchProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{searchProgress}%</Text>

          {/* Order Summary */}
          <View style={styles.orderSummaryCard}>
            <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>

            <View style={styles.summaryRow}>
              <Icon name="package-variant" size={20} color="#666" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Jenis Barang</Text>
                <Text style={styles.summaryValue}>{detailData?.itemDetails?.title}</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Icon name={detailData?.vehicleDetails?.icon || 'motorbike'} size={20} color="#666" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Kendaraan</Text>
                <Text style={styles.summaryValue}>{detailData?.vehicleDetails?.title}</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Icon name="map-marker-distance" size={20} color="#666" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Jarak</Text>
                <Text style={styles.summaryValue}>{detailData?.distance} km</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Icon name="cash" size={20} color="#26d0ce" />
              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>Total Biaya</Text>
                <Text style={[styles.summaryValue, styles.priceHighlight]}>
                  {formatPrice(detailData?.price + 3000)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Search Failed View */}
      {searchFailed && (
        <View style={styles.failedContainer}>
          <View style={styles.failedIconContainer}>
            <Icon name="truck-remove" size={60} color="#ff4757" />
          </View>

          <Text style={styles.failedTitle}>Driver Tidak Tersedia</Text>
          <Text style={styles.failedSubtitle}>
            Maaf, saat ini tidak ada driver yang tersedia di lokasi Anda. Silakan coba lagi
            dalam beberapa saat.
          </Text>

          <TouchableOpacity style={styles.retryButton} onPress={retrySearch}>
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Driver Found Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Driver Ditemukan!</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Available Drivers */}
              <View style={styles.driversSection}>
                <Text style={styles.sectionTitle}>Driver Terdekat</Text>
                <Text style={styles.sectionSubtitle}>
                  {availableDrivers.length} driver siap mengantar pesanan Anda
                </Text>

                <FlatList
                  data={availableDrivers}
                  renderItem={renderDriverItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              </View>

              {/* Route Info */}
              <View style={styles.routeSection}>
                <Text style={styles.sectionTitle}>Rute Pengiriman</Text>

                <View style={styles.routeCard}>
                  <View style={styles.routeItem}>
                    <View style={[styles.routeDot, { backgroundColor: '#26d0ce' }]} />
                    <View style={styles.routeContent}>
                      <Text style={styles.routeLabel}>Pickup</Text>
                      <Text style={styles.routeAddress}>
                        {pickupData?.pickupPoint?.address}
                      </Text>
                      <Text style={styles.routeContact}>
                        {pickupData?.senderName} • {pickupData?.senderPhone}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.routeLine} />

                  <View style={styles.routeItem}>
                    <View style={[styles.routeDot, { backgroundColor: '#ff4757' }]} />
                    <View style={styles.routeContent}>
                      <Text style={styles.routeLabel}>Drop-off</Text>
                      <Text style={styles.routeAddress}>
                        {dropoffData?.dropoffPoint?.address}
                      </Text>
                      <Text style={styles.routeContact}>
                        {dropoffData?.receiverName} • {dropoffData?.receiverPhone}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.distanceBadge}>
                  <Icon name="map-marker-distance" size={16} color="#26d0ce" />
                  <Text style={styles.distanceText}>
                    Jarak: {detailData?.distance} km
                  </Text>
                </View>
              </View>

              {/* Order Details */}
              <View style={styles.orderDetailsSection}>
                <Text style={styles.sectionTitle}>Detail Pesanan</Text>

                <View style={styles.detailCard}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Jenis Barang</Text>
                    <Text style={styles.detailValue}>
                      {detailData?.itemDetails?.title}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Kendaraan</Text>
                    <Text style={styles.detailValue}>
                      {detailData?.vehicleDetails?.title}
                    </Text>
                  </View>

                  {detailData?.notes && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Catatan</Text>
                      <Text style={styles.detailValue}>{detailData.notes}</Text>
                    </View>
                  )}

                  <View style={styles.detailDivider} />

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Biaya Pengiriman</Text>
                    <Text style={styles.detailValue}>
                      {formatPrice(detailData?.price)}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Biaya Admin</Text>
                    <Text style={styles.detailValue}>Rp 3.000</Text>
                  </View>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      {formatPrice(detailData?.price + 3000)}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Confirm Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmOrder}
                disabled={creatingBooking}
              >
                {creatingBooking ? (
                  <Text style={styles.confirmButtonText}>Memproses...</Text>
                ) : (
                  <>
                    <Icon name="check-circle" size={20} color="#fff" />
                    <Text style={styles.confirmButtonText}>Konfirmasi Pesanan</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  searchIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e6f9f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  searchingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  searchingSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#26d0ce',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#26d0ce',
    fontWeight: '600',
    marginBottom: 32,
  },
  orderSummaryCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryContent: {
    marginLeft: 12,
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  priceHighlight: {
    color: '#26d0ce',
    fontSize: 18,
  },
  failedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  failedIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffe6e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  failedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  failedSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#26d0ce',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#26d0ce',
  },
  backButtonText: {
    color: '#26d0ce',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  driversSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  driverDistance: {
    fontSize: 13,
    color: '#26d0ce',
    marginLeft: 4,
  },
  driverVehicle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverVehicleText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  driverBadge: {
    marginLeft: 8,
  },
  routeSection: {
    marginBottom: 24,
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  routeItem: {
    flexDirection: 'row',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeContent: {
    flex: 1,
    marginLeft: 12,
  },
  routeLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  routeContact: {
    fontSize: 12,
    color: '#666',
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#e0e0e0',
    marginLeft: 5,
    marginVertical: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f9f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  distanceText: {
    fontSize: 14,
    color: '#26d0ce',
    fontWeight: '600',
    marginLeft: 8,
  },
  orderDetailsSection: {
    marginBottom: 24,
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26d0ce',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#26d0ce',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default DriverSearchScreen;
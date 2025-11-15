import React, { useState, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  Image, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Linking,
  Alert
} from "react-native";
import { 
  Text, 
  Button, 
  Divider
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../context/APIUrl';

const { width, height } = Dimensions.get('window');

const OrderSummary = ({ route, navigation }) => {
  const { bookingId } = route.params || {};

  const [booking, setBooking] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [timerState, setTimerState] = useState({
    isRunning: false,
    remainingSeconds: 0,
    totalSeconds: 0
  });
  const timerIntervalRef = React.useRef(null);

  const isGaspolService = () => {
    return booking?.nama_service?.toLowerCase().includes('gaspol');
  };

  // Parse durasi dari varian_service (contoh: "90 menit" -> 90)
  const parseDurationFromVariant = (variantService) => {
    if (!variantService) return 0;
    const match = variantService.match(/(\d+)\s*menit/i);
    return match ? parseInt(match[1]) : 0;
  };

  // Load timer state dari AsyncStorage
  const loadTimerState = async () => {
    try {
      const timerKey = `timer_booking_${bookingId}`;
      const savedTimer = await AsyncStorage.getItem(timerKey);
      
      if (savedTimer) {
        const { startTime, totalSeconds, isRunning } = JSON.parse(savedTimer);
        
        if (isRunning) {
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);
          const remaining = Math.max(0, totalSeconds - elapsed);
          
          setTimerState({
            isRunning: remaining > 0,
            remainingSeconds: remaining,
            totalSeconds
          });
          
          // Jika timer sudah habis, clear dari storage
          if (remaining === 0) {
            await AsyncStorage.removeItem(timerKey);
          }
        } else {
          setTimerState({
            isRunning: false,
            remainingSeconds: totalSeconds,
            totalSeconds
          });
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  };

  // Save timer state ke AsyncStorage
  const saveTimerState = async (state) => {
    try {
      const timerKey = `timer_booking_${bookingId}`;
      await AsyncStorage.setItem(timerKey, JSON.stringify({
        startTime: Date.now(),
        totalSeconds: state.totalSeconds,
        isRunning: state.isRunning
      }));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  // Start timer
  const startTimer = async () => {
    const durationMinutes = parseDurationFromVariant(booking?.varian_service);
    const totalSeconds = durationMinutes * 60;
    
    const newState = {
      isRunning: true,
      remainingSeconds: totalSeconds,
      totalSeconds
    };
    
    setTimerState(newState);
    await saveTimerState(newState);
  };

  // Stop timer
  const stopTimer = async () => {
    const newState = {
      ...timerState,
      isRunning: false
    };
    
    setTimerState(newState);
    
    try {
      const timerKey = `timer_booking_${bookingId}`;
      await AsyncStorage.removeItem(timerKey);
    } catch (error) {
      console.error('Error removing timer:', error);
    }
  };

  // Format waktu ke HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchBookingDetails = async () => {
    if (!bookingId) {
      setError('Booking ID tidak tersedia');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/bookings/${bookingId}`);

      if (response.data.success) {
        setBooking(response.data.data);
        if (response.data.data.id_user) {
          await fetchCustomerDetails(response.data.data.id_user);
        }
      } else {
        setError('Gagal mengambil detail booking');
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError('Terjadi kesalahan saat mengambil detail booking');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      if (response.data.success) {
        setCustomer(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    }
  };

  const generateMapHTML = () => {
    const userLat = booking?.latitude_user;
    const userLng = booking?.longitude_user;
    const mitraLat = booking?.latitude_mitra;
    const mitraLng = booking?.longitude_mitra;
    const tujuanLat = booking?.latitude_tujuan;
    const tujuanLng = booking?.longitude_tujuan;

    const centerLat = userLat || 0;
    const centerLng = userLng || 0;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${centerLat}, ${centerLng}], 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
          }).addTo(map);

          var userIcon = L.divIcon({
            html: '<div style="background: #26d0ce; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 16px;">📍</span></div>',
            iconSize: [30, 30],
            className: ''
          });

          var mitraIcon = L.divIcon({
            html: '<div style="background: #4CAF50; width: 35px; height: 35px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 18px;">${isGaspolService() ? '🏍️' : '💆'}</span></div>',
            iconSize: [35, 35],
            className: ''
          });

          ${tujuanLat && tujuanLng ? `
          var destinationIcon = L.divIcon({
            html: '<div style="background: #ff4757; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 16px;">🎯</span></div>',
            iconSize: [30, 30],
            className: ''
          });
          ` : ''}

          ${userLat && userLng ? `
          L.marker([${userLat}, ${userLng}], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>${isGaspolService() ? 'Lokasi Pickup' : 'Lokasi Customer'}</b>');
          ` : ''}

          ${mitraLat && mitraLng ? `
          L.marker([${mitraLat}, ${mitraLng}], { icon: mitraIcon })
            .addTo(map)
            .bindPopup('<b>Lokasi Anda</b>');
          ` : ''}

          ${tujuanLat && tujuanLng ? `
          L.marker([${tujuanLat}, ${tujuanLng}], { icon: destinationIcon })
            .addTo(map)
            .bindPopup('<b>Tujuan</b>');
          ` : ''}

          var bounds = L.latLngBounds([
            ${userLat && userLng ? `[${userLat}, ${userLng}],` : ''}
            ${mitraLat && mitraLng ? `[${mitraLat}, ${mitraLng}],` : ''}
            ${tujuanLat && tujuanLng ? `[${tujuanLat}, ${tujuanLng}]` : ''}
          ].filter(coord => coord));
          
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        </script>
      </body>
      </html>
    `;
  };

  const handleChatCustomer = async () => {
    if (!customer || !booking) {
      Alert.alert('Info', 'Data tidak lengkap untuk memulai chat');
      return;
    }

    try {
      const mitraData = await AsyncStorage.getItem('user_data');
      const parsedMitraData = JSON.parse(mitraData);

      navigation.navigate('ChatScreen', {
        bookingId: booking.id,
        recipientName: customer.nama_lengkap || 'Customer',
        recipientPhoto: customer.foto_profil || '',
        recipientId: customer.id,
        serviceInfo: booking.nama_service,
        senderType: 'mitra',
        senderId: parsedMitraData.id
      });
    } catch (error) {
      console.error('Error navigating to chat:', error);
      Alert.alert('Error', 'Gagal membuka chat');
    }
  };

  const handleCompleteBooking = async () => {
    setCompleteModalVisible(false);
    setCompleteLoading(true);

    try {
      const mitraData = await AsyncStorage.getItem('user_data');
      if (!mitraData) {
        throw new Error('Data mitra tidak ditemukan');
      }

      const { id: mitraId } = JSON.parse(mitraData);

      // Update status booking ke Completed
      const response = await axios.put(`${API_URL}/bookings/${bookingId}/status`, {
        status: 'Completed',
        progress_tracking: 'Layanan selesai'
      });

      if (response.data.success) {
        // Deduct platform fee (25%)
        const platformFee = booking.harga_service * 0.25;
        
        try {
          await axios.patch(`${API_URL}/mitra/${mitraId}/balance`, {
            amount: platformFee,
            operation: 'subtract',
          });
          console.log('Platform fee deducted:', platformFee);
        } catch (saldoError) {
          console.error('Error deducting balance:', saldoError);
        }

        // Stop timer jika sedang berjalan
        if (timerState.isRunning) {
          await stopTimer();
        }

        setCompleteLoading(false);
        Alert.alert(
          'Berhasil!',
          'Layanan telah selesai',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('History')
            }
          ]
        );
      } else {
        setCompleteLoading(false);
        Alert.alert('Error', 'Gagal menyelesaikan layanan');
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      setCompleteLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const openGoogleMaps = () => {
    const destination = isGaspolService() && booking.latitude_tujuan
      ? `${booking.latitude_tujuan},${booking.longitude_tujuan}`
      : `${booking.latitude_user},${booking.longitude_user}`;

    const url = `google.navigation:q=${destination}`;
    Linking.openURL(url).catch(() => {
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
      Linking.openURL(webUrl);
    });
  };

  useEffect(() => {
    fetchBookingDetails();
    const interval = setInterval(fetchBookingDetails, 15000);
    return () => clearInterval(interval);
  }, [bookingId]);

  // Load timer saat component mount
  useEffect(() => {
    if (bookingId && booking && !isGaspolService()) {
      loadTimerState();
    }
  }, [bookingId, booking]);

  // Timer countdown effect
  useEffect(() => {
    if (timerState.isRunning && timerState.remainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerState(prev => {
          const newRemaining = prev.remainingSeconds - 1;
          
          if (newRemaining <= 0) {
            stopTimer();
            Alert.alert('Timer Selesai', 'Waktu layanan telah berakhir');
            return {
              ...prev,
              isRunning: false,
              remainingSeconds: 0
            };
          }
          
          return {
            ...prev,
            remainingSeconds: newRemaining
          };
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.remainingSeconds]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateMitraEarnings = (servicePrice) => {
    return servicePrice * 0.75;
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'Pending': return { text: 'Menunggu Konfirmasi', color: '#FF9800', icon: 'clock-outline' };
      case 'On Progress': return { text: 'Sedang Berlangsung', color: '#2196F3', icon: 'run' };
      case 'Completed': return { text: 'Selesai', color: '#4CAF50', icon: 'check-circle' };
      case 'Cancelled': return { text: 'Dibatalkan', color: '#F44336', icon: 'close-circle' };
      default: return { text: status, color: '#757575', icon: 'information' };
    }
  };

  const getProgressStatus = () => {
    if (!booking) return null;
    return booking.progress_tracking;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#26d0ce" />
        <Text style={styles.loadingText}>Memuat detail pesanan...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={60} color="#FF4D67" />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchBookingDetails} style={styles.retryButton}>
          Coba Lagi
        </Button>
      </View>
    );
  }

  const statusDisplay = getStatusDisplay(booking.status);
  const mitraEarnings = calculateMitraEarnings(booking.harga_service || 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <LinearGradient
          colors={[statusDisplay.color, statusDisplay.color + 'DD']}
          style={styles.statusBanner}
        >
          <Icon name={statusDisplay.icon} size={28} color="#fff" />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>{statusDisplay.text}</Text>
            {getProgressStatus() && (
              <Text style={styles.statusSubtitle}>{getProgressStatus()}</Text>
            )}
          </View>
        </LinearGradient>

        {/* Map */}
        {booking.latitude_user && booking.longitude_user && (
          <View style={styles.mapContainer}>
            <WebView
              source={{ html: generateMapHTML() }}
              style={styles.map}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
        )}

        {/* Customer Card */}
        {customer && (
          <View style={styles.customerCard}>
            <Image
              source={{
                uri: customer.foto_profil || `https://ui-avatars.com/api/?name=${customer.nama_lengkap}`
              }}
              style={styles.customerAvatar}
            />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customer.nama_lengkap}</Text>
            </View>
            <TouchableOpacity style={styles.actionIcon} onPress={handleChatCustomer}>
              <Icon name="message-text" size={20} color="#26d0ce" />
            </TouchableOpacity>
          </View>
        )}

        {/* Route Card untuk Gaspol */}
        {isGaspolService() && (
          <View style={styles.routeCard}>
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, { backgroundColor: '#26d0ce' }]} />
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text style={styles.routeAddress}>{booking.alamat_user}</Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            {booking.alamat_tujuan && (
              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: '#ff4757' }]} />
                <View style={styles.routeContent}>
                  <Text style={styles.routeLabel}>DROP-OFF</Text>
                  <Text style={styles.routeAddress}>{booking.alamat_tujuan}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Timer Section untuk layanan non-Gaspol */}
        {!isGaspolService() && booking?.varian_service && parseDurationFromVariant(booking.varian_service) > 0 && (
          <View style={styles.timerCard}>
            <View style={styles.timerHeader}>
              <Icon name="timer-outline" size={24} color="#26d0ce" />
              <Text style={styles.timerTitle}>Timer Layanan</Text>
            </View>
            
            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>{formatTime(timerState.remainingSeconds)}</Text>
              <Text style={styles.timerSubtext}>
                {timerState.isRunning ? 'Sedang Berjalan' : 'Siap Dimulai'}
              </Text>
            </View>
            
            <View style={styles.timerActions}>
              {!timerState.isRunning ? (
                <Button 
                  mode="contained" 
                  style={styles.timerStartButton}
                  icon="play"
                  onPress={startTimer}
                  disabled={booking.status !== 'On Progress'}
                >
                  Mulai Timer
                </Button>
              ) : (
                <Button 
                  mode="outlined" 
                  style={styles.timerStopButton}
                  labelStyle={styles.timerStopButtonLabel}
                  icon="stop"
                  onPress={() => {
                    Alert.alert(
                      'Hentikan Timer',
                      'Apakah Anda yakin ingin menghentikan timer?',
                      [
                        { text: 'Batal', style: 'cancel' },
                        { text: 'Ya, Hentikan', onPress: stopTimer }
                      ]
                    );
                  }}
                >
                  Hentikan Timer
                </Button>
              )}
            </View>
            
            {timerState.remainingSeconds === 0 && !timerState.isRunning && timerState.totalSeconds > 0 && (
              <View style={styles.timerCompleteNotice}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.timerCompleteText}>Timer telah selesai</Text>
              </View>
            )}
          </View>
        )}

        {/* Order Details Card */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Rincian Pesanan</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID Pesanan</Text>
            <Text style={styles.detailValue}>#{booking.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Layanan</Text>
            <Text style={styles.detailValue}>{booking.nama_service}</Text>
          </View>

          {booking.varian_service && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paket</Text>
              <Text style={styles.detailValue}>{booking.varian_service}</Text>
            </View>
          )}

          {isGaspolService() && booking.nama_barang && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jenis Barang</Text>
              <Text style={styles.detailValue}>{booking.nama_barang}</Text>
            </View>
          )}

          {isGaspolService() && booking.jarak_kirim && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jarak</Text>
              <Text style={styles.detailValue}>{booking.jarak_kirim} km</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tanggal</Text>
            <Text style={styles.detailValue}>{booking.tanggal_booking}</Text>
          </View>

          {!isGaspolService() && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Alamat</Text>
              <Text style={[styles.detailValue, { flex: 2, textAlign: 'right' }]}>
                {booking.alamat_user}
              </Text>
            </View>
          )}

          {booking.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Catatan Customer:</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          )}

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Harga Service</Text>
            <Text style={styles.detailValue}>{formatPrice(booking.harga_service || 0)}</Text>
          </View>

          {booking.status === 'Completed' && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.commissionLabel}>Potongan Platform (25%)</Text>
                <Text style={styles.commissionValue}>
                  - {formatPrice((booking.harga_service || 0) * 0.25)}
                </Text>
              </View>

              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Pendapatan Anda</Text>
                <Text style={styles.earningsValue}>{formatPrice(mitraEarnings)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.paymentCard}>
          <Icon name="cash" size={24} color="#26d0ce" />
          <Text style={styles.paymentText}>Bayar di Tempat</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {booking.status === 'On Progress' && (
            <>
              <Button
                mode="contained"
                style={styles.navigationButton}
                icon="navigation"
                onPress={openGoogleMaps}
              >
                Buka Google Maps
              </Button>

              <Button
                mode="contained"
                style={styles.completeButton}
                icon="check-circle"
                onPress={() => setCompleteModalVisible(true)}
              >
                Selesaikan Layanan
              </Button>
            </>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Complete Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={completeModalVisible}
        onRequestClose={() => setCompleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Icon name="help-circle-outline" size={60} color="#26d0ce" />
            <Text style={styles.modalTitle}>Konfirmasi</Text>
            <Text style={styles.modalText}>
              Apakah Anda yakin ingin menyelesaikan layanan ini?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                style={styles.modalCancelButton}
                onPress={() => setCompleteModalVisible(false)}
              >
                Batal
              </Button>
              <Button
                mode="contained"
                style={styles.modalConfirmButton}
                onPress={handleCompleteBooking}
              >
                Ya, Selesai
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={completeLoading}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loadingModalContainer}>
            <ActivityIndicator size="large" color="#26d0ce" />
            <Text style={styles.loadingModalText}>Memproses...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#26d0ce',
    elevation: 4,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  map: {
    flex: 1,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f9f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  routeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
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
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  routeAddress: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#e0e0e0',
    marginLeft: 5,
    marginVertical: 4,
  },
  timerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#26d0ce',
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  timerDisplay: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#26d0ce',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  timerSubtext: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timerActions: {
    marginBottom: 12,
  },
  timerStartButton: {
    backgroundColor: '#26d0ce',
    borderRadius: 8,
    paddingVertical: 4,
  },
  timerStopButton: {
    borderColor: '#FF4D67',
    borderRadius: 8,
    borderWidth: 1,
  },
  timerStopButtonLabel: {
    color: '#FF4D67',
  },
  timerCompleteNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  timerCompleteText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 14,
  },
  detailCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  notesSection: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  commissionLabel: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  commissionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#eee',
  },
  earningsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26d0ce',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  paymentText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  navigationButton: {
    backgroundColor: '#2196F3',
    marginBottom: 12,
    borderRadius: 8,
    paddingVertical: 4,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#26d0ce',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#26d0ce',
    borderRadius: 8,
  },
  loadingModalContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingModalText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});

export default OrderSummary;
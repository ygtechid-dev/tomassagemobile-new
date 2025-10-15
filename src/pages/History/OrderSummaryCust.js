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
  Card, 
  Button, 
  Divider, 
  Surface,
  TextInput 
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from 'react-native-linear-gradient';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../context/APIUrl';

const { width, height } = Dimensions.get('window');

const OrderSummaryCust = ({ route, navigation }) => {
  const { bookingId } = route.params || {};

  const [booking, setBooking] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rating, setRating] = useState(5);
  const [ratingError, setRatingError] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
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
        if (response.data.data.id_mitra) {
          await fetchTherapistDetails(response.data.data.id_mitra);
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

  const fetchTherapistDetails = async (mitraId) => {
    try {
      const response = await axios.get(`${API_URL}/mitra/${mitraId}`)
      if (response.data.success) {
        setTherapist(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching therapist details:', err);
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

          var driverIcon = L.divIcon({
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
            .bindPopup('<b>${isGaspolService() ? 'Lokasi Pickup' : 'Lokasi Anda'}</b>');
          ` : ''}

          ${mitraLat && mitraLng ? `
          L.marker([${mitraLat}, ${mitraLng}], { icon: driverIcon })
            .addTo(map)
            .bindPopup('<b>${isGaspolService() ? 'Driver' : 'Terapis'}</b>');
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

  const handleCallDriver = () => {
    if (therapist?.no_telp) {
      Linking.openURL(`tel:${therapist.no_telp}`);
    } else {
      Alert.alert('Info', `Nomor ${isGaspolService() ? 'driver' : 'terapis'} belum tersedia`);
    }
  };

  const handleChatDriver = async () => {
    if (!therapist || !booking) {
      Alert.alert('Info', 'Data tidak lengkap untuk memulai chat');
      return;
    }

    try {
      // Get user data untuk mendapatkan customer ID
      const userData = await AsyncStorage.getItem('user_data');
      const parsedUserData = JSON.parse(userData);

      // Navigate ke ChatScreen dengan parameter yang benar
      navigation.navigate('ChatScreen', {
        bookingId: booking.id,
        recipientName: therapist.nama_lengkap || (isGaspolService() ? 'Driver' : 'Terapis'),
        recipientPhoto: therapist.foto_profil || '',
        recipientId: therapist.id,
        serviceInfo: booking.nama_service,
        senderType: 'customer', // Customer yang mengirim
        senderId: parsedUserData.id
      });
    } catch (error) {
      console.error('Error navigating to chat:', error);
      Alert.alert('Error', 'Gagal membuka chat');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Alasan Diperlukan', 'Mohon berikan alasan pembatalan pesanan');
      return;
    }

    try {
      setCancelLoading(true);
      const response = await axios.post(`${API_URL}/bookings/${bookingId}/cancel`, {
        cancel_reason: cancelReason.trim()
      });

      if (response.data.success) {
        Alert.alert(
          'Pesanan Dibatalkan',
          'Pesanan Anda berhasil dibatalkan.',
          [
            {
              text: 'OK',
              onPress: () => {
                setCancelModalVisible(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'HomePageCust' }],
                });
              }
            }
          ]
        );
      } else {
        throw new Error(response.data.message || 'Gagal membatalkan pesanan');
      }
    } catch (err) {
      Alert.alert(
        'Gagal Membatalkan',
        err.response?.data?.message || 'Terjadi kesalahan saat membatalkan pesanan'
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSaveRating = async () => {
    try {
      setRatingError(null);
      const userData = await AsyncStorage.getItem('user_data');
      const parsedData = JSON.parse(userData);

      const payload = {
        mitra_id: therapist.id,
        rating,
        review_text: '',
        customer_name: parsedData.nama_lengkap,
        customer_phone: parsedData.nomor_wa
      };

      const response = await axios.post(`${API_URL}/ratings`, payload);
      
      if (response.data) {
        setRatingModalVisible(false);
        Alert.alert('Rating Berhasil!', 'Terima kasih atas penilaian Anda', [
          { text: 'OK', onPress: () => navigation.replace('HomePageCust') }
        ]);
      }
    } catch (err) {
      setRatingError('Terjadi kesalahan saat menyimpan rating');
    }
  };

  const openImageModal = (imageUrl, imageType) => {
    setSelectedImage({ url: imageUrl, type: imageType });
    setImageModalVisible(true);
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
            // Timer habis
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

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'Pending': return { text: 'Menunggu Konfirmasi', color: '#FF9800', icon: 'clock-outline' };
      case 'On Progress': return { text: 'Sedang Berlangsung', color: '#2196F3', icon: 'motorbike' };
      case 'Completed': return { text: 'Selesai', color: '#4CAF50', icon: 'check-circle' };
      case 'Cancelled': return { text: 'Dibatalkan', color: '#F44336', icon: 'close-circle' };
      default: return { text: status, color: '#757575', icon: 'information' };
    }
  };

  const getProgressStatus = () => {
    if (!booking) return null;
    
    const progressText = booking.progress_tracking;
    
    // Ganti "Terapis" dengan "Driver" untuk Gaspol Service
    if (isGaspolService() && progressText) {
      return progressText.replace(/Terapis/gi, 'Driver');
    }
    
    return progressText;
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

  return (
    <View style={styles.container}>
      {/* Header Gojek Style */}
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

        {/* Driver/Therapist Card */}
        {therapist && (
          <View style={styles.driverCard}>
            <Image
              source={{
                uri: therapist.foto_profil || `https://ui-avatars.com/api/?name=${therapist.nama_lengkap}`
              }}
              style={styles.driverAvatar}
            />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{therapist.nama_lengkap}</Text>
              <View style={styles.driverMetaRow}>
                {isGaspolService() && booking.kendaraan && (
                  <Text style={styles.driverMeta}>
                    {booking.kendaraan} • {therapist.plat_kendaraan || 'N/A'}
                  </Text>
                )}
                {therapist.rating && (
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{therapist.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </View>
            {/* <TouchableOpacity style={styles.actionIcon} onPress={handleCallDriver}>
              <Icon name="phone" size={20} color="#26d0ce" />
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.actionIcon} onPress={handleChatDriver}>
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

        {/* Foto Pickup & Drop untuk Gaspol */}
        {isGaspolService() && (booking.img_pickup || booking.img_drop) && (
          <View style={styles.photoCard}>
            <Text style={styles.cardTitle}>Dokumentasi Pengiriman</Text>
            <View style={styles.photoGrid}>
              {booking.img_pickup && (
                <TouchableOpacity 
                  style={styles.photoItem}
                  onPress={() => openImageModal(booking.img_pickup, 'Foto Pengambilan')}
                >
                  <Image source={{ uri: booking.img_pickup }} style={styles.photoImage} />
                  <View style={styles.photoOverlay}>
                    <Icon name="camera" size={20} color="#fff" />
                    <Text style={styles.photoLabel}>Foto Pengambilan</Text>
                  </View>
                </TouchableOpacity>
              )}
              
              {booking.img_drop && (
                <TouchableOpacity 
                  style={styles.photoItem}
                  onPress={() => openImageModal(booking.img_drop, 'Foto Penerimaan')}
                >
                  <Image source={{ uri: booking.img_drop }} style={styles.photoImage} />
                  <View style={styles.photoOverlay}>
                    <Icon name="camera" size={20} color="#fff" />
                    <Text style={styles.photoLabel}>Foto Penerimaan</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
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

          <Divider style={styles.divider} />

          {/* Pricing */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {isGaspolService() ? 'Biaya Pengiriman' : 'Harga Layanan'}
            </Text>
            <Text style={styles.detailValue}>
              {formatPrice(isGaspolService() && booking.harga_service > 3000 
                ? booking.harga_service - 3000 
                : booking.harga_service)}
            </Text>
          </View>

          {isGaspolService() && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Biaya Admin</Text>
              <Text style={styles.detailValue}>Rp 3.000</Text>
            </View>
          )}

          {booking.biaya_tambahan > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Biaya Tambahan</Text>
              <Text style={styles.detailValue}>{formatPrice(booking.biaya_tambahan)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatPrice(booking.harga_service + (booking.biaya_tambahan || 0))}
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentCard}>
          <Icon name="cash" size={24} color="#26d0ce" />
          <Text style={styles.paymentText}>Bayar di Tempat</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {booking.status === 'Pending' || booking.status == "On Progress" ? (
            <Button 
              mode="outlined" 
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
              onPress={() => setCancelModalVisible(true)}
              icon="close-circle-outline"
            >
              Batalkan Pesanan
            </Button>
          )
        :
        null}
          
          {booking.status === 'Completed' && therapist && (
            <Button 
              mode="contained" 
              style={styles.ratingButton}
              icon="star"
              onPress={() => setRatingModalVisible(true)}
            >
              Beri Rating {isGaspolService() ? 'Driver' : 'Terapis'}
            </Button>
          )}
        </View>

        {/* Timer Section untuk layanan non-Gaspol */}
        {/* {!isGaspolService() && booking?.varian_service && parseDurationFromVariant(booking.varian_service) > 0 && (
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
        )} */}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity 
            style={styles.imageModalClose}
            onPress={() => setImageModalVisible(false)}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <>
              <Image 
                source={{ uri: selectedImage.url }} 
                style={styles.fullImage}
                resizeMode="contain"
              />
              <View style={styles.imageModalLabel}>
                <Text style={styles.imageModalLabelText}>{selectedImage.type}</Text>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={ratingModalVisible}
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ratingModalContainer}>
            <Text style={styles.ratingTitle}>Bagaimana Penilaian Anda?</Text>
            
            <View style={styles.therapistProfile}>
              <Image
                source={{ uri: therapist?.foto_profil || "https://ui-avatars.com/api/?name=User" }}
                style={styles.therapistImage}
              />
              <Text style={styles.therapistName}>
                {therapist?.nama_lengkap || (isGaspolService() ? 'Driver' : 'Terapis')}
              </Text>
            </View>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
                  <Icon name={star <= rating ? "star" : "star-outline"} size={40} color="#FFD700" />
                </TouchableOpacity>
              ))}
            </View>
            
            {ratingError && <Text style={styles.ratingErrorText}>{ratingError}</Text>}
            
            <View style={styles.modalButtonsContainer}>
              <Button mode="outlined" style={styles.modalCancelButton} onPress={() => setRatingModalVisible(false)}>
                Batal
              </Button>
              <Button mode="contained" style={styles.saveButton} onPress={handleSaveRating}>
                Simpan
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContainer}>
            <View style={styles.cancelHeaderContainer}>
              <Text style={styles.cancelTitle}>Batalkan Pesanan</Text>
              <TouchableOpacity onPress={() => setCancelModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Divider style={styles.modalDivider} />
            
            <View style={styles.cancelContent}>
              <View style={styles.warningSection}>
                <Icon name="alert-circle-outline" size={24} color="#FF9800" />
                <Text style={styles.warningText}>Anda yakin ingin membatalkan pesanan ini?</Text>
              </View>

              <View style={styles.reasonSection}>
                <Text style={styles.reasonLabel}>Alasan Pembatalan *</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Masukkan alasan pembatalan..."
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  multiline
                  numberOfLines={3}
                  style={styles.reasonInput}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#26d0ce"
                />
              </View>
            </View>
            
            <View style={styles.cancelActionsContainer}>
              <Button 
                mode="outlined" 
                style={styles.cancelActionButton}
                onPress={() => setCancelModalVisible(false)}
                disabled={cancelLoading}
              >
                Batal
              </Button>
              <Button 
                mode="contained" 
                style={styles.confirmCancelButton}
                onPress={handleCancelBooking}
                loading={cancelLoading}
                disabled={cancelLoading || !cancelReason.trim()}
              >
                Ya, Batalkan
              </Button>
            </View>
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
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  driverMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverMeta: {
    fontSize: 13,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
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
  photoCard: {
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
  photoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  photoItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
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
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#eee',
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
  cancelButton: {
    borderColor: '#FF4D67',
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonLabel: {
    color: '#FF4D67',
  },
  ratingButton: {
    backgroundColor: '#26d0ce',
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
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullImage: {
    width: width,
    height: height * 0.8,
  },
  imageModalLabel: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  imageModalLabelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingModalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  therapistProfile: {
    alignItems: 'center',
    marginBottom: 24,
  },
  therapistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: '#F0F0F0',
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  starButton: {
    padding: 8,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#26d0ce',
    borderRadius: 8,
  },
  ratingErrorText: {
    color: '#FF4D67',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 12,
  },
  cancelModalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 0,
    maxHeight: '80%',
  },
  cancelHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  cancelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  cancelContent: {
    padding: 20,
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 12,
    flex: 1,
    color: '#F57F17',
    fontWeight: '500',
  },
  reasonSection: {
    marginBottom: 16,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  reasonInput: {
    backgroundColor: 'white',
  },
  cancelActionsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  cancelActionButton: {
    flex: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  confirmCancelButton: {
    flex: 1,
    backgroundColor: '#FF4D67',
    borderRadius: 8,
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
});

export default OrderSummaryCust;
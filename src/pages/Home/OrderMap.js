import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Animated,
  Alert,
  Image,
  PermissionsAndroid
} from 'react-native';
import { Text, Button, Appbar } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { API_URL } from '../../context/APIUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { width, height } = Dimensions.get('window');

const OrderMap = ({ route, navigation }) => {
  const { order } = route.params;
  const webViewRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mitraData, setMitraData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localOrder, setLocalOrder] = useState(order);

  console.log('====================================');
  console.log('locors', order);
  console.log('====================================');
  const isGaspolDelivery = localOrder.nama_service === 'Gaspol Delivery';
  
  const startPoint = {
    latitude: parseFloat(localOrder.latitude_user),
    longitude: parseFloat(localOrder.longitude_user),
    label: isGaspolDelivery ? 'Lokasi Penjemputan' : 'Lokasi Customer'
  };

  const endPoint = isGaspolDelivery 
    ? {
        latitude: parseFloat(localOrder.latitude_tujuan),
        longitude: parseFloat(localOrder.longitude_tujuan),
        label: 'Lokasi Tujuan'
      }
    : {
        latitude: parseFloat(localOrder.latitude_mitra || currentLocation?.latitude || -6.2088),
        longitude: parseFloat(localOrder.longitude_mitra || currentLocation?.longitude || 106.8456),
        label: 'Lokasi Anda (Mitra)'
      };

  useEffect(() => {
    loadMitraData();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    getCurrentLocation();
    
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        
        if (webViewRef.current && !isGaspolDelivery) {
          const updateScript = `updateDriverLocation(${latitude}, ${longitude});`;
          webViewRef.current.injectJavaScript(updateScript);
        }
      },
      (error) => console.error('Watch position error:', error),
      { 
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000
      }
    );

    return () => Geolocation.clearWatch(watchId);
  }, []);

  const loadMitraData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setMitraData(parsedUserData);
      }
    } catch (error) {
      console.error('Error loading mitra data:', error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      },
      (error) => console.error('Get location error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // ✅ FUNGSI BARU: Request Camera Permission
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Izin Kamera Diperlukan',
            message: 'Aplikasi membutuhkan akses kamera untuk mengambil foto pickup/drop paket',
            buttonNeutral: 'Tanya Nanti',
            buttonNegative: 'Tolak',
            buttonPositive: 'Izinkan',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Camera permission granted');
          return true;
        } else {
          console.log('❌ Camera permission denied');
          Alert.alert(
            'Izin Ditolak',
            'Anda perlu memberikan izin kamera untuk mengambil foto',
            [{ text: 'OK' }]
          );
          return false;
        }
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    } else {
      // iOS menggunakan react-native-permissions
      try {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        
        if (result === RESULTS.GRANTED) {
          console.log('✅ Camera permission granted');
          return true;
        } else {
          Alert.alert(
            'Izin Ditolak',
            'Anda perlu memberikan izin kamera untuk mengambil foto',
            [{ text: 'OK' }]
          );
          return false;
        }
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
  };

  // ✅ FUNGSI BARU: Refresh data order dari API
  const refreshOrderData = async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/${localOrder.id}`);
      
      if (response.data.success) {
        setLocalOrder(response.data.data);
        console.log('✅ Order data refreshed:', response.data.data);
        return response.data.data;
      } else {
        console.error('❌ Failed to refresh order data');
        return null;
      }
    } catch (error) {
      console.error('❌ Error refreshing order data:', error);
      Alert.alert('Error', 'Gagal memuat ulang data pesanan');
      return null;
    }
  };

  // ✅ FUNGSI BARU: Pengurangan saldo mitra (20% dari harga_service)
  const deductMitraBalance = async () => {
    try {
      if (!mitraData || !mitraData.id) {
        console.error('❌ Mitra data not found');
        return;
      }

      const deductionAmount = localOrder.harga_service * 0.2; // 20% dari harga service
      
      console.log('🔄 Deducting balance:', {
        mitraId: mitraData.id,
        amount: deductionAmount,
        operation: 'subtract'
      });

      const response = await axios.patch(
        `${API_URL}/mitra/${mitraData.id}/balance`,
        {
          amount: deductionAmount,
          operation: 'subtract'
        }
      );

      if (response.data.status === 'success') {
        console.log('✅ Balance deducted successfully:', response.data);
      } else {
        console.error('❌ Failed to deduct balance:', response.data);
      }
    } catch (error) {
      console.error('❌ Error deducting balance:', error.response?.data || error.message);
      // Tidak menampilkan alert error agar tidak mengganggu user experience
    }
  };

  const handleCameraCapture = async (type) => {
    // ✅ Request permission terlebih dahulu
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return; // Jika tidak ada izin, batalkan proses
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: false,
    };

    launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
        return;
      }

      if (response.errorCode) {
        Alert.alert('Error', 'Gagal mengambil foto: ' + response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const photo = response.assets[0];
        await uploadPhoto(photo, type);
      }
    });
  };

  const uploadPhoto = async (photo, type) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      
      // Add image file dengan MIME type yang benar
      const imageFile = {
        uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
        type: photo.type || 'image/jpeg',
        name: photo.fileName || `${type}_${Date.now()}.jpg`,
      };

      if (type === 'pickup') {
        formData.append('img_pickup', imageFile);
        formData.append('progress_tracking', 'Barang sudah di ambil');
      } else if (type === 'drop') {
        formData.append('img_drop', imageFile);
        formData.append('progress_tracking', 'Barang sudah diantar');
        formData.append('status', 'Completed');
      }

      console.log('📤 Uploading photo:', {
        type,
        fileName: imageFile.name,
        fileType: imageFile.type,
        uri: imageFile.uri
      });

      const response = await axios.put(
        `${API_URL}/bookings/${localOrder.id}/update`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        // ✅ REFRESH DATA DARI API setelah upload berhasil
        const updatedOrder = await refreshOrderData();
        
        // ✅ Jika status Completed, lakukan pengurangan saldo 20%
        if (type === 'drop') {
          await deductMitraBalance();
        }
        
        Alert.alert(
          'Berhasil',
          type === 'pickup' 
            ? 'Foto pickup berhasil diupload. Silakan antar paket ke tujuan.' 
            : 'Paket berhasil diantar. Terima kasih!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Jika selesai, kembali ke halaman sebelumnya
                if (type === 'drop') {
                  navigation.goBack();
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Gagal mengupload foto');
      }
    } catch (error) {
      console.error('Upload error:', error.response);
      Alert.alert('Error', 'Gagal mengupload foto: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChatPress = async () => {
    if (!localOrder || !localOrder.id) {
      Alert.alert('Error', 'Data order tidak ditemukan');
      return;
    }

    if (!mitraData || !mitraData.id) {
      Alert.alert('Error', 'Data mitra tidak ditemukan');
      return;
    }

    const initialMessage = `Halo, saya mitra yang menangani pesanan Anda.`;
      
    try {
      const response = await axios.post(`${API_URL}/chats/${localOrder.id}`, {
        message: initialMessage,
        sender_type: 'mitra',
        sender_id: mitraData.id,
        attachment_url: null
      });

      if (response.data.success) {
        navigation.navigate('ChatScreen', {
          bookingId: localOrder.id,
          recipientName: localOrder.user?.nama_lengkap || 'Customer',
          recipientPhoto: localOrder.user?.foto_profil || '',
          recipientId: localOrder.user?.id,
          serviceInfo: localOrder.nama_service,
          senderType: 'mitra',
          senderId: mitraData.id
        });
      } else {
        Alert.alert('Error', 'Gagal memulai chat. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error starting chat:', error.response);
      
      if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
        navigation.navigate('ChatScreen', {
          bookingId: localOrder.id,
          recipientName: localOrder.user?.nama_lengkap || 'Customer',
          recipientPhoto: localOrder.user?.foto_profil || '',
          recipientId: localOrder.user?.id,
          serviceInfo: localOrder.nama_service,
          senderType: 'mitra',
          senderId: mitraData.id
        });
      } else {
        Alert.alert('Error', 'Gagal memulai chat. Silakan coba lagi.');
      }
    }
  };

  const openInGoogleMaps = () => {
    const destination = isGaspolDelivery 
      ? `${endPoint.latitude},${endPoint.longitude}`
      : `${startPoint.latitude},${startPoint.longitude}`;
    
    const origin = currentLocation 
      ? `${currentLocation.latitude},${currentLocation.longitude}`
      : '';

    const url = Platform.select({
      ios: `maps://app?daddr=${destination}&saddr=${origin}`,
      android: `google.navigation:q=${destination}`
    });

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const webUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
        Linking.openURL(webUrl);
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDistance = () => {
    if (!startPoint.latitude || !endPoint.latitude) return 0;
    
    const R = 6371;
    const dLat = (endPoint.latitude - startPoint.latitude) * Math.PI / 180;
    const dLon = (endPoint.longitude - startPoint.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(startPoint.latitude * Math.PI / 180) * 
      Math.cos(endPoint.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const recenterMap = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('fitMapBounds();');
    }
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        #map { width: 100vw; height: 100vh; }
        .custom-marker { background: transparent; border: none; }
        .marker-pin {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        }
        .marker-start { background: #4CAF50; }
        .marker-end { background: #F44336; }
        .pulse-ring {
          position: absolute; width: 40px; height: 40px; border-radius: 50%;
          background: rgba(76, 175, 80, 0.3); animation: pulse 2s ease-out infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${startPoint.latitude}, ${startPoint.longitude}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

        const startIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div class="marker-pin marker-start"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg><div class="pulse-ring"></div></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });

        const endIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div class="marker-pin marker-end"><svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });

        const startMarker = L.marker([${startPoint.latitude}, ${startPoint.longitude}], { icon: startIcon }).addTo(map);
        startMarker.bindPopup('<b>${startPoint.label}</b><br>${localOrder.alamat_user}');

        const endMarker = L.marker([${endPoint.latitude}, ${endPoint.longitude}], { icon: endIcon }).addTo(map);
        endMarker.bindPopup('<b>${endPoint.label}</b><br>${isGaspolDelivery ? localOrder.alamat_tujuan || '' : 'Posisi Anda'}');

        const routeLine = L.polyline([
          [${startPoint.latitude}, ${startPoint.longitude}],
          [${endPoint.latitude}, ${endPoint.longitude}]
        ], { color: '#2196F3', weight: 3, opacity: 0.7, dashArray: '10, 5' }).addTo(map);

        function fitMapBounds() {
          const bounds = L.latLngBounds([
            [${startPoint.latitude}, ${startPoint.longitude}],
            [${endPoint.latitude}, ${endPoint.longitude}]
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        fitMapBounds();
        map.doubleClickZoom.disable();
      </script>
    </body>
    </html>
  `;

  // Render tombol pickup/drop sesuai kondisi
  const renderDeliveryActionButton = () => {
    if (!isGaspolDelivery) return null;

    if (localOrder.progress_tracking === 'Terapis dalam perjalanan') {
      return (
        <TouchableOpacity
          style={[styles.deliveryButton, styles.pickupButton]}
          onPress={() => handleCameraCapture('pickup')}
          disabled={isUploading}
        >
          <Icon name="camera" size={20} color="white" />
          <Text style={styles.deliveryButtonText}>
            {isUploading ? 'Mengupload...' : 'Pickup Paket'}
          </Text>
        </TouchableOpacity>
      );
    }

    if (localOrder.progress_tracking === 'Barang sudah di ambil') {
      return (
        <TouchableOpacity
          style={[styles.deliveryButton, styles.dropButton]}
          onPress={() => handleCameraCapture('drop')}
          disabled={isUploading}
        >
          <Icon name="camera" size={20} color="white" />
          <Text style={styles.deliveryButtonText}>
            {isUploading ? 'Mengupload...' : 'Paket Selesai Diantar'}
          </Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="white" />
        <Appbar.Content title="Lacak Pesanan" titleStyle={{ color: 'white' }} />
        <Appbar.Action icon="navigation" color="white" onPress={openInGoogleMaps} />
      </Appbar.Header>

      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          scrollEnabled={false}
        />
      </View>

      <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
        <Icon name="crosshairs" size={20} color="#14A49C" />
      </TouchableOpacity>

      <View style={styles.detailsContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailsScroll}>
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="user" size={16} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Customer</Text>
                <Text style={styles.infoValue}>{localOrder.user?.nama_lengkap}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="concierge-bell" size={16} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Layanan</Text>
                <Text style={styles.infoValue}>{localOrder.nama_service}</Text>
                {localOrder.varian_service && (
                  <Text style={styles.infoSubValue}>{localOrder.varian_service}</Text>
                )}
              </View>
            </View>

            {isGaspolDelivery && localOrder.nama_barang && (
              <View style={styles.infoRow}>
                <Icon name="box" size={16} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nama Barang</Text>
                  <Text style={styles.infoValue}>{localOrder.nama_barang}</Text>
                </View>
              </View>
            )}

            {isGaspolDelivery && localOrder.kendaraan && (
              <View style={styles.infoRow}>
                <Icon name="motorcycle" size={16} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Kendaraan</Text>
                  <Text style={styles.infoValue}>{localOrder.kendaraan}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Icon name="map-marker-alt" size={16} color="#4CAF50" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{startPoint.label}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{localOrder.alamat_user}</Text>
              </View>
            </View>

            {isGaspolDelivery && localOrder.alamat_tujuan && (
              <View style={styles.infoRow}>
                <Icon name="map-marker-alt" size={16} color="#F44336" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tujuan</Text>
                  <Text style={styles.infoValue} numberOfLines={2}>{localOrder.alamat_tujuan}</Text>
                </View>
              </View>
            )}

            <View style={styles.distanceRow}>
              <Icon name="route" size={16} color="#2196F3" />
              <Text style={styles.distanceText}>
                Jarak: {isGaspolDelivery && localOrder.jarak_kirim 
                  ? `${localOrder.jarak_kirim} km` 
                  : `${calculateDistance()} km`}
              </Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Total Pembayaran</Text>
            <Text style={styles.priceValue}>{formatCurrency(localOrder.harga_service)}</Text>
          </View>

          <View style={styles.actionButtons}>
            {/* Tombol Pickup/Drop untuk Gaspol Delivery */}
            {renderDeliveryActionButton()}

            <Button
              mode="contained"
              style={styles.navigationButton}
              icon="navigation"
              onPress={openInGoogleMaps}
            >
              Buka Google Maps
            </Button>
            
            {/* ✅ Tombol Chat hilang jika status Completed */}
            {localOrder.status !== 'Completed' && (
              <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
                <Icon name="comment-dots" size={20} color="white" />
                <Text style={styles.chatText}>Chat Customer</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#14A49C', elevation: 4 },
  mapContainer: { width: width, height: height * 0.4, backgroundColor: '#E0E0E0' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  recenterButton: {
    position: 'absolute', top: height * 0.4 - 60, right: 16,
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center', elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3
  },
  detailsContainer: {
    flex: 1, backgroundColor: 'white',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    marginTop: -20, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1, shadowRadius: 4
  },
  detailsScroll: { padding: 20, paddingTop: 30 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20
  },
  statusText: { fontSize: 13, fontWeight: '600', color: '#2196F3', marginLeft: 6 },
  infoSection: { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  infoContent: { flex: 1, marginLeft: 12 },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  infoSubValue: { fontSize: 12, color: '#666', marginTop: 2 },
  distanceRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0F9FF', padding: 12, borderRadius: 8, marginTop: 8
  },
  distanceText: { fontSize: 14, fontWeight: '600', color: '#2196F3', marginLeft: 8 },
  priceSection: { backgroundColor: '#F0F9F9', padding: 16, borderRadius: 12, marginBottom: 20 },
  priceLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
  priceValue: { fontSize: 24, fontWeight: '700', color: '#14A49C' },
  actionButtons: { gap: 12, marginBottom: 20 },
  deliveryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 8, gap: 8
  },
  pickupButton: { backgroundColor: '#FF9800' },
  dropButton: { backgroundColor: '#4CAF50' },
  deliveryButtonText: { fontSize: 15, fontWeight: '600', color: 'white' },
  navigationButton: { backgroundColor: '#2196F3', borderRadius: 8 },
  chatButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#14A49C', paddingVertical: 12, borderRadius: 8, gap: 8
  },
  chatText: { fontSize: 15, fontWeight: '600', color: 'white' }
});

export default OrderMap;
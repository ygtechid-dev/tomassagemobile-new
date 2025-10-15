import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { API_URL } from '../../context/APIUrl';

const { width, height } = Dimensions.get('window');

const OrderSuccessScreen = ({ navigation, route }) => {
  const { bookingId, pickupData, dropoffData, detailData } = route.params;

  const [bookingDetail, setBookingDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetail();
    const interval = setInterval(fetchBookingDetail, 10000); // Update setiap 10 detik
    return () => clearInterval(interval);
  }, []);

  const fetchBookingDetail = async () => {
    try {
      const response = await axios.get(`${API_URL}/bookings/${bookingId}`);
      
      if (response.data && response.data.success) {
        setBookingDetail(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching booking:', error);
      setLoading(false);
    }
  };

  const generateMapHTML = () => {
    const userLat = bookingDetail?.latitude_user || pickupData?.pickupPoint?.coordinates?.latitude;
    const userLng = bookingDetail?.longitude_user || pickupData?.pickupPoint?.coordinates?.longitude;
    const mitraLat = bookingDetail?.latitude_mitra;
    const mitraLng = bookingDetail?.longitude_mitra;
    const tujuanLat = bookingDetail?.latitude_tujuan || dropoffData?.dropoffPoint?.coordinates?.latitude;
    const tujuanLng = bookingDetail?.longitude_tujuan || dropoffData?.dropoffPoint?.coordinates?.longitude;

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
          var map = L.map('map').setView([${userLat}, ${userLng}], 13);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          // Custom icons
          var userIcon = L.divIcon({
            html: '<div style="background: #26d0ce; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 16px;">📍</span></div>',
            iconSize: [30, 30],
            className: ''
          });

          var driverIcon = L.divIcon({
            html: '<div style="background: #4CAF50; width: 35px; height: 35px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 18px;">🏍️</span></div>',
            iconSize: [35, 35],
            className: ''
          });

          var destinationIcon = L.divIcon({
            html: '<div style="background: #ff4757; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><span style="color: white; font-size: 16px;">🎯</span></div>',
            iconSize: [30, 30],
            className: ''
          });

          // Marker user (pickup point)
          L.marker([${userLat}, ${userLng}], { icon: userIcon })
            .addTo(map)
            .bindPopup('<b>Lokasi Pickup</b><br>${pickupData?.pickupPoint?.address || 'Lokasi Anda'}');

          // Marker mitra (driver) - jika sudah ada
          ${mitraLat && mitraLng ? `
          L.marker([${mitraLat}, ${mitraLng}], { icon: driverIcon })
            .addTo(map)
            .bindPopup('<b>Driver</b><br>Sedang menuju lokasi Anda');
          ` : ''}

          // Marker tujuan
          L.marker([${tujuanLat}, ${tujuanLng}], { icon: destinationIcon })
            .addTo(map)
            .bindPopup('<b>Tujuan</b><br>${dropoffData?.dropoffPoint?.address || 'Lokasi Tujuan'}');

          // Fit bounds untuk semua marker
          var bounds = L.latLngBounds([
            [${userLat}, ${userLng}],
            ${mitraLat && mitraLng ? `[${mitraLat}, ${mitraLng}],` : ''}
            [${tujuanLat}, ${tujuanLng}]
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        </script>
      </body>
      </html>
    `;
  };

  const handleCallDriver = () => {
    if (bookingDetail?.mitra?.no_telp) {
      Linking.openURL(`tel:${bookingDetail.mitra.no_telp}`);
    } else {
      Alert.alert('Info', 'Nomor driver belum tersedia');
    }
  };

  const handleChatDriver = () => {
    if (bookingDetail?.mitra?.no_telp) {
      Linking.openURL(`https://wa.me/${bookingDetail.mitra.no_telp}`);
    } else {
      Alert.alert('Info', 'Nomor driver belum tersedia');
    }
  };

  const formatPrice = (price) => {
    return `Rp ${price?.toLocaleString('id-ID') || '0'}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#26d0ce" />
        <Text style={styles.loadingText}>Memuat detail pesanan...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('HomePageCust')}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <Icon name="check-circle" size={48} color="#26d0ce" />
          </View>
          <Text style={styles.statusTitle}>Pesanan Berhasil Dibuat!</Text>
          <Text style={styles.statusSubtitle}>{bookingDetail?.progress_tracking || 'Mencari driver terdekat'}</Text>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <WebView
            source={{ html: generateMapHTML() }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>

        {/* Driver Info */}
        {bookingDetail?.mitra ? (
          <View style={styles.driverCard}>
            <Image
              source={{
                uri: bookingDetail.mitra.foto_profil ||
                  `https://ui-avatars.com/api/?name=${bookingDetail.mitra.nama_lengkap}`,
              }}
              style={styles.driverAvatar}
            />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{bookingDetail.mitra.nama_lengkap}</Text>
              <Text style={styles.driverVehicle}>
                {bookingDetail.kendaraan} • {bookingDetail.mitra.plat_kendaraan}
              </Text>
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={handleCallDriver}>
              <Icon name="phone" size={20} color="#26d0ce" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleChatDriver}>
              <Icon name="message" size={20} color="#26d0ce" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.waitingCard}>
            <ActivityIndicator size="small" color="#26d0ce" />
            <Text style={styles.waitingText}>Menunggu driver menerima pesanan...</Text>
          </View>
        )}

        {/* Route Details */}
        <View style={styles.routeCard}>
          <Text style={styles.sectionTitle}>Detail Pengiriman</Text>

          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: '#26d0ce' }]} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>PICKUP</Text>
              <Text style={styles.routeAddress}>{bookingDetail?.alamat_user}</Text>
              <Text style={styles.routeContact}>
                {pickupData?.senderName} • {pickupData?.senderPhone}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: '#ff4757' }]} />
            <View style={styles.routeContent}>
              <Text style={styles.routeLabel}>DROP-OFF</Text>
              <Text style={styles.routeAddress}>{bookingDetail?.alamat_tujuan}</Text>
              <Text style={styles.routeContact}>
                {dropoffData?.receiverName} • {dropoffData?.receiverPhone}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Rincian Pesanan</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID Pesanan</Text>
            <Text style={styles.detailValue}>#{bookingDetail?.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jenis Barang</Text>
            <Text style={styles.detailValue}>{bookingDetail?.nama_barang}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Kendaraan</Text>
            <Text style={styles.detailValue}>{bookingDetail?.kendaraan}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jarak</Text>
            <Text style={styles.detailValue}>{bookingDetail?.jarak_kirim} km</Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Biaya Pengiriman</Text>
            <Text style={styles.detailValue}>
              {formatPrice(bookingDetail?.harga_service - 3000)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Biaya Admin</Text>
            <Text style={styles.detailValue}>Rp 3.000</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatPrice(bookingDetail?.harga_service)}
            </Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
  },
  statusIconContainer: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
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
  driverVehicle: {
    fontSize: 13,
    color: '#666',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f9f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9e6',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  waitingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  routeCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
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
  detailCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
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
});

export default OrderSuccessScreen;
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Avatar, IconButton, Button, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../../context/APIUrl';

const BookingSuccess = ({navigation, route}) => {
  const { location, booking_id, status: initialStatus = 'Pending' } = route.params;
  const [status, setStatus] = useState(initialStatus);
  const [currentMitra, setCurrentMitra] = useState(null);
  const statusCheckInterval = useRef(null);

  console.log('MITRA', currentMitra);
  console.log('LOC', location);
  console.log('STATUS', status);
  console.log('BOOKING_ID', booking_id);

  // Setup interval untuk memeriksa status booking
  useEffect(() => {
    // Mulai interval check setiap 5 detik
    statusCheckInterval.current = setInterval(() => {
      checkBookingStatus();
    }, 5000);

    // Cleanup interval jika komponen unmount
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, [booking_id]);

  // Function to fetch mitra data by ID
  const fetchMitraData = async (mitraId) => {
    try {
      const response = await axios.get(`${API_URL}/mitra/${mitraId}`);
      
      if (response.data.success && response.data.data) {
        console.log('Fetched mitra data:', response.data.data);
        setCurrentMitra(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching mitra data:', error);
    }
  };

  // Fungsi untuk memeriksa status booking dari API
  const checkBookingStatus = async () => {
    if (!booking_id) return;

    try {
      const response = await axios.get(`${API_URL}/bookings/${booking_id}`);
      
      if (response.data.success) {
        const bookingData = response.data.data;
        
        console.log('bokdat', bookingData);
        
        // Update status jika berubah
        if (bookingData.status !== status) {
          setStatus(bookingData.status);
        }
        
        // Jika booking sudah memiliki mitra, ambil data mitra
        if (bookingData.id_mitra) {
          // Fetch mitra data using the ID
          await fetchMitraData(bookingData.id_mitra);
          
          // Jika status berubah menjadi On Progress/Accepted, hentikan polling
          if (bookingData.status === 'On Progress' || bookingData.status === 'Accepted') {
            clearInterval(statusCheckInterval.current);
          }
        }
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
    }
  };

  // Render konten berdasarkan status
  const renderTherapistInfo = () => {
    if (status === 'Pending') {
      return (
        <View style={styles.pendingContainer}>
          <ActivityIndicator size="large" color="#FF9800" style={styles.pendingIndicator} />
          <Text style={styles.pendingTitle}>Menunggu Konfirmasi Terapis</Text>
          <Text style={styles.pendingSubtitle}>
            Kami sedang menghubungi terapis terdekat. Mohon tunggu sebentar...
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.therapistContainer}>
          {currentMitra?.foto_profil && (
            <Avatar.Image
              size={60}
              source={{uri: currentMitra.foto_profil}}
              style={styles.therapistImage}
            />
          )}
          <View style={styles.therapistInfo}>
            <Text style={styles.therapistName}>{currentMitra?.nama_lengkap || 'Terapis'}</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>
                {status === 'On Progress' ? 'Dalam Perjalanan' : status}
              </Text>
            </View>
          </View>
          
          {/* Tampilkan tombol chat jika sudah ada mitra */}
          {currentMitra && currentMitra.id && (
            <IconButton
              icon="message"
              size={24}
              style={styles.chatButton}
              onPress={() => handleChatPress()}
            />
          )}
        </View>
      );
    }
  };
  
  // Fungsi untuk menangani chat dengan mitra
  const handleChatPress = async () => {
    if (!currentMitra || !booking_id) return;

    const initialMessage = 'Halo, saya ingin bertanya tentang booking saya.';
      
    try {
      const response = await axios.post(`${API_URL}/chats/${booking_id}`, {
        message: initialMessage,
        sender_type: 'user',
        sender_id: currentMitra.id,
        attachment_url: null // Opsional, bisa diisi jika ada lampiran
      });

      if (response.data.success) {
        // Navigasi ke layar chat
        navigation.navigate('ChatScreen', {
          bookingId: booking_id,
          recipientName: currentMitra.nama_lengkap,
          recipientPhoto: currentMitra.foto_profil || '',
          recipientId: currentMitra.id,
          serviceInfo: 'Layanan Massage' // Sesuaikan dengan jenis layanan
        });
      } else {
        Alert.alert('Error', 'Gagal memulai chat. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Gagal memulai chat. Silakan coba lagi.');
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.successIconContainer}>
        <View style={styles.successIconOuter}>
          <View style={styles.successIconInner}>
            <IconButton
              icon="check"
              size={40}
              color="white"
            />
          </View>
        </View>
      </View>

      {/* Success Message */}
      <Text style={styles.title}>Pemesanan Berhasil!</Text>
      <Text style={styles.subtitle}>
        {status === 'Pending' 
          ? 'Pesanan Anda sedang diproses. Terapis akan dihubungi segera.' 
          : 'Kami sudah mendapatkan Terapis terbaik untuk Anda. Mohon Ditunggu :)'}
      </Text>

      {/* Therapist Info - Conditional Rendering */}
      {renderTherapistInfo()}

      {/* Home Button */}
      <Button
        mode="contained"
        style={styles.homeButton}
        contentStyle={styles.buttonContent}
        onPress={() => navigation.push('HomePageCust')}
      >
        Kembali ke Home
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 20,
  },
  successIconContainer: {
    marginTop: 100,
    marginBottom: 40,
  },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0F7F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00A699',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  therapistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  therapistImage: {
    backgroundColor: '#fce4ec',
  },
  therapistInfo: {
    flex: 1,
    marginLeft: 16,
  },
  therapistName: {
    fontSize: 18,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#666',
    marginLeft: 0,
  },
  chatButton: {
    backgroundColor: '#E0F7F5',
  },
  // Styling untuk status pending
  pendingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingIndicator: {
    marginBottom: 16,
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  pendingSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  homeButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 12,
    backgroundColor: '#00A699',
  },
  buttonContent: {
    height: 50,
  },
});

export default BookingSuccess;
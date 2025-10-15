import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Image, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl, 
  Dimensions 
} from 'react-native';
import { 
  Text, 
  Card, 
  SegmentedButtons, 
  Button, 
  Surface 
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../context/APIUrl';

const { width } = Dimensions.get('window');

const HistoryCust = ({navigation}) => {
  const [selectedTab, setSelectedTab] = useState('aktif');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  // Get user ID from AsyncStorage on component mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserId(parsedData.id);
        }
      } catch (error) {
        console.error('Error retrieving user ID:', error);
        setError('Tidak dapat mengambil data pengguna');
      }
    };

    getUserId();
  }, []);

  // Fetch bookings when userId changes or tab changes
  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [userId, selectedTab]);

  // Fetch ratings for a specific booking
  const fetchBookingRating = async (bookingId) => {
    console.log('bookif', bookingId);
    
    try {
      const response = await axios.get(`${API_URL}/ratings/${bookingId}/summary`);
      console.log('dddd', response);
      
      return response.data.rating || null;
    } catch (error) {
      console.error('Error fetching rating for booking:', bookingId, error);
      return null;
    }
  };

  // Function to fetch bookings from API
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let apiResponse;
      
      if (selectedTab === 'aktif') {
        // For active bookings, only get "On Progress" status
        apiResponse = await axios.get(`${API_URL}/users/${userId}/bookings`, {
          params: { status: 'On Progress' }
        });
      } else {
        // For history tab, get all bookings and filter client-side
        apiResponse = await axios.get(`${API_URL}/users/${userId}/bookings`);
      }
      
      console.log('BOOOOOK', apiResponse.data.data);

      if (apiResponse.data && apiResponse.data.success) {
        let bookingsData = apiResponse.data.data || [];
        
        // Filter for history tab to include only Completed and Cancelled
        if (selectedTab === 'riwayat') {
          bookingsData = bookingsData.filter(booking => 
            booking.status === 'Completed' || booking.status === 'Cancelled'
          );
        }

        // Fetch ratings for each booking
        const bookingsWithRatings = await Promise.all(
          bookingsData.map(async (booking) => {
            // Only fetch rating for completed bookings
            const rating = booking.status === 'Completed' 
              ? await fetchBookingRating(booking.id_mitra) 
              : null;
            
            return {
              ...booking,
              rating: rating !== null ? rating : booking.rating
            };
          })
        );

        setBookings(bookingsWithRatings);
      } else {
        setError('Gagal mengambil data booking');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Terjadi kesalahan saat mengambil data booking');
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
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

  // Get status display text and styling
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'On Progress':
        return {
          text: 'Sedang Berjalan',
          style: styles.progressStatus,
          icon: 'clock-outline'
        };
      case 'Completed':
        return {
          text: 'Selesai',
          style: styles.completedStatus,
          icon: 'check-circle-outline'
        };
      case 'Cancelled':
        return {
          text: 'Dibatalkan',
          style: styles.cancelledStatus,
          icon: 'close-circle-outline'
        };
      default:
        return {
          text: status,
          style: styles.defaultStatus,
          icon: 'information-outline'
        };
    }
  };

  // Render single booking card
  const renderBookingCard = (booking) => {
    const statusDisplay = getStatusDisplay(booking.status);
    
    return (
      <Surface key={booking.id} style={styles.cardSurface} elevation={1}>
        <Card 
          style={styles.card} 
          onPress={() => navigation.push('OrderSummaryCust', { 
            bookingId: booking.id,
            bookingData: booking 
          })}
        >
          
          {/* Image and Gradient Overlay */}
          <View style={styles.cardImageContainer}>
            <Image 
              source={{ uri: booking.image_uri || 'https://ygtechdev.my.id/files/photo-1740134836553-462434233.png' }} 
              style={[
                styles.cardImage,
                booking.status === 'Cancelled' && styles.cardImageCancelled
              ]} 
              blurRadius={booking.status === 'Cancelled' ? 2 : 1}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />
            {/* Status Badge */}
            <View style={[styles.statusBadge, statusDisplay.style]}>
              <MaterialCommunityIcons 
                name={statusDisplay.icon} 
                size={12} 
                color="white" 
                style={styles.statusIcon}
              />
              <Text style={styles.statusBadgeText}>
                {statusDisplay.text}
              </Text>
            </View>
          </View>

          {/* Card Content */}
          <View style={[
            styles.cardContent,
            booking.status === 'Cancelled' && styles.cardContentCancelled
          ]}>
            <View style={styles.cardHeader}>
              <Text style={[
                styles.serviceTitle,
                booking.status === 'Cancelled' && styles.serviceTitleCancelled
              ]} numberOfLines={1}>
                {booking.nama_service}
              </Text>
              {selectedTab === 'riwayat' && booking.rating && booking.status === 'Completed' && (
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={16} color="#FFCE31" />
                  <Text style={styles.ratingText}>
                    {typeof booking.rating === 'number' 
                      ? booking.rating.toFixed(1) 
                      : '4.8'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.cardDetails}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons 
                  name="map-marker-outline" 
                  size={16} 
                  color={booking.status === 'Cancelled' ? "#999" : "#777"} 
                />
                <Text style={[
                  styles.locationText,
                  booking.status === 'Cancelled' && styles.locationTextCancelled
                ]} numberOfLines={1}>
                  {booking.alamat_user ? booking.alamat_user.split(',')[0] : 'Lokasi tidak tersedia'}
                </Text>
              </View>

              <View style={styles.detailInfoRow}>
                <View style={styles.detailInfoItem}>
                  <Text style={[
                    styles.detailLabel,
                    booking.status === 'Cancelled' && styles.detailLabelCancelled
                  ]}>
                    Paket
                  </Text>
                  <Text style={[
                    styles.detailValue,
                    booking.status === 'Cancelled' && styles.detailValueCancelled
                  ]}>
                    {booking.varian_service || '60 menit'}
                  </Text>
                </View>
                <View style={styles.detailInfoItem}>
                  <Text style={[
                    styles.detailLabel,
                    booking.status === 'Cancelled' && styles.detailLabelCancelled
                  ]}>
                    Tanggal
                  </Text>
                  <Text style={[
                    styles.detailValue,
                    booking.status === 'Cancelled' && styles.detailValueCancelled
                  ]}>
                    {booking.tanggal_booking}
                  </Text>
                </View>
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.priceContainer}>
              <Text style={[
                styles.priceText,
                booking.status === 'Cancelled' && styles.priceTextCancelled
              ]}>
                {formatPrice(booking.harga_service)}
              </Text>
              {booking.status === 'Cancelled' && (
                <Text style={styles.cancelledNote}>
                  (Dibatalkan)
                </Text>
              )}
            </View>

            {/* Additional info for cancelled bookings */}
            {booking.status === 'Cancelled' && booking.progress_tracking && (
              <View style={styles.cancellationInfo}>
                <MaterialCommunityIcons 
                  name="information-outline" 
                  size={14} 
                  color="#FF6B6B" 
                />
                <Text style={styles.cancellationText}>
                  {booking.progress_tracking}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat Booking</Text>
        <MaterialCommunityIcons 
          name="filter-outline" 
          size={24} 
          color="#00A890" 
          onPress={() => {/* Add filter functionality */}}
        />
      </View>

      {/* Segmented Buttons */}
      <SegmentedButtons
        value={selectedTab}
        onValueChange={setSelectedTab}
        style={styles.segmentedButtons}
        buttons={[
          {
            value: 'aktif',
            label: 'Booking Aktif',
            checkedColor: 'white',
            style: [
              styles.segmentButton,
              selectedTab === 'aktif' ? styles.activeSegmentButton : styles.inactiveSegmentButton,
            ],
            labelStyle: selectedTab === 'aktif' ? styles.activeSegmentText : styles.inactiveSegmentText,
          },
          {
            value: 'riwayat',
            label: 'Riwayat',
            checkedColor: 'white',
            style: [
              styles.segmentButton,
              selectedTab === 'riwayat' ? styles.activeSegmentButton : styles.inactiveSegmentButton,
            ],
            labelStyle: selectedTab === 'riwayat' ? styles.activeSegmentText : styles.inactiveSegmentText,
          }
        ]}
      />

      {/* Bookings List */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#00A890']}
          />
        }
      >
        {/* Loading State */}
        {loading && !refreshing ? (
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color="#00A890" />
            <Text style={styles.loadingText}>Memuat data booking...</Text>
          </View>
        ) : error ? (
          // Error State
          <View style={styles.centeredContainer}>
            <MaterialCommunityIcons 
              name="alert-circle-outline" 
              size={60} 
              color="#FF4D67" 
            />
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              mode="contained" 
              onPress={fetchBookings} 
              style={styles.retryButton}
            >
              Coba Lagi
            </Button>
          </View>
        ) : bookings.length === 0 ? (
          // Empty State
          <View style={styles.centeredContainer}>
            <MaterialCommunityIcons 
              name="calendar-blank" 
              size={80} 
              color="#E0E0E0" 
            />
            <Text style={styles.emptyStateTitle}>
              {selectedTab === 'aktif' 
                ? 'Tidak Ada Booking Aktif' 
                : 'Belum Ada Riwayat Booking'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Ayo mulai booking layanan favoritmu!
            </Text>
            <Button 
              mode="contained" 
              style={styles.bookNowButton}
              onPress={() => navigation.navigate('Booking')}
            >
              Booking Sekarang
            </Button>
          </View>
        ) : (
          // Bookings List
          bookings.map(renderBookingCard)
        )}
      </ScrollView>
    </View>
  );
};

// Comprehensive Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 20,
  },
  header: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  // Segmented Buttons Styles
  segmentedButtons: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
  },
  activeSegmentButton: {
    backgroundColor: '#00A890',
  },
  inactiveSegmentButton: {
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  activeSegmentText: {
    color: 'white',
  },
  inactiveSegmentText: {
    color: '#666',
  },
  // Card Styles
  cardSurface: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'white',
    elevation: 2,
  },
  cardImageContainer: {
    height: 150,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardImageCancelled: {
    opacity: 0.6,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  progressStatus: {
    backgroundColor: 'rgba(255, 77, 103, 0.8)', // Soft red
  },
  completedStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)', // Soft green
  },
  cancelledStatus: {
    backgroundColor: 'rgba(158, 158, 158, 0.8)', // Soft gray
  },
  defaultStatus: {
    backgroundColor: 'rgba(96, 125, 139, 0.8)', // Soft blue-gray
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 16,
  },
  cardContentCancelled: {
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  serviceTitleCancelled: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#777',
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#777',
    flex: 1,
  },
  locationTextCancelled: {
    color: '#999',
  },
  detailInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailInfoItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailLabelCancelled: {
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  detailValueCancelled: {
    color: '#666',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A890',
  },
  priceTextCancelled: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  cancelledNote: {
    fontSize: 12,
    color: '#FF6B6B',
    fontStyle: 'italic',
    marginTop: 2,
  },
  cancellationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancellationText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#FF6B6B',
    fontStyle: 'italic',
    flex: 1,
  },
  // Centered Container Styles
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#00A890',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  bookNowButton: {
    backgroundColor: '#00A890',
    paddingHorizontal: 20,
  },
});

 export default HistoryCust
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { 
  Text, 
  Card, 
  SegmentedButtons, 
  Button, 
  Surface 
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../context/APIUrl';

const History = ({navigation}) => {
  const [selectedTab, setSelectedTab] = useState('aktif');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mitraId, setMitraId] = useState(null);
  const [error, setError] = useState(null);

  // Get mitra ID from AsyncStorage on component mount
  useEffect(() => {
    const getMitraId = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setMitraId(parsedData.id);
        }
      } catch (error) {
        console.error('Error retrieving mitra ID:', error);
        setError('Tidak dapat mengambil data mitra');
      }
    };

    getMitraId();
  }, []);

  // Fetch bookings when mitraId changes or tab changes
  useEffect(() => {
    if (mitraId) {
      fetchBookings();
    }
  }, [mitraId, selectedTab]);

  // Function to fetch bookings from API
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let apiResponse;
      
      if (selectedTab === 'aktif') {
        // For active bookings, only get "On Progress" status
        apiResponse = await axios.get(`${API_URL}/mitra/${mitraId}/bookings`, {
          params: { status: 'On Progress' }
        });
      } else {
        // For history tab, get all bookings and filter client-side
        apiResponse = await axios.get(`${API_URL}/mitra/${mitraId}/bookings`);
      }

      if (apiResponse.data && apiResponse.data.success) {
        let bookingsData = apiResponse.data.data || [];
        
        // Filter for history tab to include only Completed and Cancelled
        if (selectedTab === 'riwayat') {
          bookingsData = bookingsData.filter(booking => 
            booking.status === 'Completed' || booking.status === 'Cancelled'
          );
        }

        setBookings(bookingsData);
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

  // Calculate mitra earnings (80% of service price)
  const calculateMitraEarnings = (servicePrice) => {
    return servicePrice * 0.8;
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
    const mitraEarnings = calculateMitraEarnings(booking.harga_service || 0);
    const isGaspolService = booking.nama_service?.toLowerCase().includes('gaspol');
    
    return (
      <Surface key={booking.id} style={styles.cardSurface} elevation={1}>
        <Card 
          style={styles.card} 
          onPress={() => navigation.push('OrderSummary', { 
            bookingId: booking.id,
            bookingData: booking 
          })}
        >
          {/* Status Badge at Top */}
          <View style={styles.cardHeader}>
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
            {booking.rating && booking.status === 'Completed' && (
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

          {/* Card Content */}
          <View style={[
            styles.cardContent,
            booking.status === 'Cancelled' && styles.cardContentCancelled
          ]}>
            <View style={styles.serviceHeader}>
              <Text style={[
                styles.serviceTitle,
                booking.status === 'Cancelled' && styles.serviceTitleCancelled
              ]} numberOfLines={1}>
                {booking.nama_service || booking.service_name}
              </Text>
            </View>

            <View style={styles.cardDetails}>
              {/* Customer Info */}
              <View style={styles.detailRow}>
                <MaterialCommunityIcons 
                  name="account-outline" 
                  size={16} 
                  color={booking.status === 'Cancelled' ? "#999" : "#777"} 
                />
                <Text style={[
                  styles.detailText,
                  booking.status === 'Cancelled' && styles.detailTextCancelled
                ]}>
                  {booking.customer_name || booking.user?.nama_lengkap || 'Customer'}
                </Text>
              </View>

              {/* Location */}
              <View style={styles.detailRow}>
                <MaterialCommunityIcons 
                  name="map-marker-outline" 
                  size={16} 
                  color={booking.status === 'Cancelled' ? "#999" : "#777"} 
                />
                <Text style={[
                  styles.detailText,
                  booking.status === 'Cancelled' && styles.detailTextCancelled
                ]} numberOfLines={1}>
                  {booking.alamat_user ? booking.alamat_user.split(',')[0] : 'Lokasi tidak tersedia'}
                </Text>
              </View>

              <View style={styles.detailInfoRow}>
                {/* Package/Variant */}
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
                    {booking.varian_service || booking.package_name || '60 menit'}
                  </Text>
                </View>

                {/* Date */}
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

              {/* Special info for Gaspol Delivery */}
              {isGaspolService && booking.nama_barang && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons 
                    name="package-variant" 
                    size={16} 
                    color={booking.status === 'Cancelled' ? "#999" : "#777"} 
                  />
                  <Text style={[
                    styles.detailText,
                    booking.status === 'Cancelled' && styles.detailTextCancelled
                  ]}>
                    {booking.nama_barang}
                  </Text>
                </View>
              )}
            </View>

            {/* Price Section with Earnings Breakdown */}
            <View style={styles.priceSection}>
              <View style={styles.priceBreakdown}>
                <Text style={styles.priceLabel}>Harga Service:</Text>
                <Text style={[
                  styles.originalPrice,
                  booking.status === 'Cancelled' && styles.originalPriceCancelled
                ]}>
                  {formatPrice(booking.harga_service || 0)}
                </Text>
              </View>
              
              {booking.status === 'Completed' && (
                <>
                  <View style={styles.priceBreakdown}>
                    <Text style={styles.commissionLabel}>Potongan Platform (20%):</Text>
                    <Text style={styles.commissionValue}>
                      - {formatPrice((booking.harga_service || 0) * 0.2)}
                    </Text>
                  </View>
                  
                  <View style={styles.earningsContainer}>
                    <Text style={styles.earningsLabel}>Pendapatan Anda:</Text>
                    <Text style={styles.earningsValue}>
                      {formatPrice(mitraEarnings)}
                    </Text>
                  </View>
                </>
              )}

              {booking.status === 'Cancelled' && (
                <Text style={styles.cancelledNote}>
                  (Dibatalkan - Tidak ada pendapatan)
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
              {selectedTab === 'aktif'
                ? 'Booking akan muncul di sini saat ada pesanan masuk'
                : 'Riwayat booking yang selesai akan ditampilkan di sini'}
            </Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 0,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  progressStatus: {
    backgroundColor: '#FF4D67',
  },
  completedStatus: {
    backgroundColor: '#4CAF50',
  },
  cancelledStatus: {
    backgroundColor: '#9E9E9E',
  },
  defaultStatus: {
    backgroundColor: '#607D8B',
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  cardContent: {
    padding: 16,
    paddingTop: 12,
  },
  cardContentCancelled: {
    opacity: 0.8,
  },
  serviceHeader: {
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceTitleCancelled: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#777',
    flex: 1,
  },
  detailTextCancelled: {
    color: '#999',
  },
  detailInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
  priceSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  priceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#666',
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  originalPriceCancelled: {
    color: '#999',
    textDecorationLine: 'line-through',
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
  earningsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  earningsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00A890',
  },
  cancelledNote: {
    fontSize: 12,
    color: '#FF6B6B',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
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
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default History;
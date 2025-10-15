import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Linking,
  Platform
} from 'react-native';
import { Text, Card, Badge, Button, Divider } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../context/APIUrl';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ActiveBookings = ({ navigation, onActiveBookingChange }) => {
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  // Fetch active bookings (Pending or On Process)
  const fetchActiveBookings = async () => {
    try {
      setLoading(true);
      
      // Get user data from AsyncStorage
      const userDataJson = await AsyncStorage.getItem('user_data');
      if (!userDataJson) {
        console.log('No user data found');
        setLoading(false);
        return;
      }
      
      const userData = JSON.parse(userDataJson);
      const userId = userData.id;
      
      // Fetch bookings with On Progress status
      const onProgressResponse = await axios.get(
        `${API_URL}/users/${userId}/bookings?status=On Progress`
      );
      
      // Fetch bookings with Pending status
      const pendingResponse = await axios.get(
        `${API_URL}/users/${userId}/bookings?status=Pending`
      );
      
      console.log('On Progress bookings response:', onProgressResponse.data);
      console.log('Pending bookings response:', pendingResponse.data);
      
      // Combine both results
      let combinedBookings = [];
      
      if (onProgressResponse.data && onProgressResponse.data.success && Array.isArray(onProgressResponse.data.data)) {
        combinedBookings = combinedBookings.concat(onProgressResponse.data.data);
      }
      
      if (pendingResponse.data && pendingResponse.data.success && Array.isArray(pendingResponse.data.data)) {
        combinedBookings = combinedBookings.concat(pendingResponse.data.data);
      }
      
      // Update state with combined bookings
      setActiveBookings(combinedBookings);
      
      // Notify parent component if we have any active bookings
      onActiveBookingChange(combinedBookings.length > 0);
      
    } catch (error) {
      console.error('Error fetching active bookings:', error);
      setActiveBookings([]);
      onActiveBookingChange(false);
    } finally {
      setLoading(false);
    }
  };

  // Initial setup and focus listener
  useEffect(() => {
    // Initial fetch
    fetchActiveBookings();
    
    // Set up refresh interval (every 1 minute)
    const intervalId = setInterval(fetchActiveBookings, 60000);
    
    // Add focus listener - this will run whenever the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('ActiveBookings: Screen focused, refreshing data');
      fetchActiveBookings();
    });
    
    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [navigation]);

  // Toggle expanded view for a booking
  const toggleExpandBooking = (bookingId) => {
    setExpandedBookingId(expandedBookingId === bookingId ? null : bookingId);
  };

  // Open maps app with the address
  const navigateToAddress = (address) => {
    const mapUrl = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`
    });
    
    Linking.canOpenURL(mapUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mapUrl);
        } else {
          return Linking.openURL(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`);
        }
      })
      .catch((error) => console.error('Error opening map:', error));
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FF9800'; // Orange for pending
      case 'On Process':
        return '#2196F3'; // Blue for on process
      default:
        return '#757575'; // Grey for others
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    return timeString.substring(0, 5); // Format: HH:MM
  };

  // Render each booking item
  const renderBookingItem = ({ item }) => {
    const isExpanded = expandedBookingId === item.id;
    const statusColor = getStatusColor(item.status);
    
    return (
      <Card style={styles.bookingCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.bookingId}>Order #{item.id}</Text>
              <Badge style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                {item.status}
              </Badge>
            </View>
            <TouchableOpacity onPress={() => toggleExpandBooking(item.id)}>
              <Icon 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#333" 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>{item.nama_service || 'Layanan'}</Text>
            <Text style={styles.dateTime}>
              {formatDate(item.created_at)} 
            </Text>
          </View>
          
          {isExpanded && (
            <View style={styles.expandedContent}>
              <Divider style={styles.divider} />
             
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total Bayar:</Text>
                <Text style={styles.detailValue}>
                  Rp {parseFloat(item.harga_service || 0).toLocaleString('id-ID')}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Metode Pembayaran:</Text>
                <Text style={styles.detailValue}>{item.payment_method || 'Bayar di Tempat'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Catatan:</Text>
                <Text style={styles.detailValue}>{item.catatan || '-'}</Text>
              </View>
              
              <View style={styles.actionButtons}>
                <Button 
                  mode="contained" 
                  onPress={() => navigateToAddress(item.alamat)}
                  style={[styles.actionButton, styles.navigateButton]}
                  icon="map-marker"
                >
                  Navigasi
                </Button>
                
                <Button 
                  mode="outlined"
                  onPress={() => navigation.navigate('OrderSummaryCust', { bookingId: item.id })}
                  style={styles.actionButton}
                >
                  Detail
                </Button>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  // Don't render anything if no active bookings
  if (!loading && activeBookings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Order Aktif</Text>
        <TouchableOpacity onPress={fetchActiveBookings}>
          <Icon name="refresh" size={20} color="#2B8E87" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="small" color="#2B8E87" style={styles.loader} />
      ) : (
        <FlatList
          data={activeBookings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookingItem}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Since this is inside a ScrollView
          contentContainerStyle={styles.bookingsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    paddingVertical: 20,
  },
  bookingsList: {
    paddingBottom: 5,
  },
  bookingCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bookingId: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  serviceInfo: {
    marginBottom: 5,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    color: '#555',
  },
  expandedContent: {
    marginTop: 10,
  },
  divider: {
    marginBottom: 12,
  },
  detailItem: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  navigateButton: {
    backgroundColor: '#2B8E87',
  }
});

export default ActiveBookings;
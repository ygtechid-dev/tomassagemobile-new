import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Avatar, Divider, IconButton, Badge, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../context/APIUrl';
import { useFocusEffect } from '@react-navigation/native';

const ChatList = ({ navigation }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(''); // 'user' or 'mitra'
  const [filteredHistory, setFilteredHistory] = useState([]);

  // Sample chat history data for demo
  const tempChatHistory = [
    {
      id: 1,
      booking_id: 1001,
      last_message: 'Saya akan tiba sekitar 30 menit lagi',
      last_message_time: '2023-01-01T10:30:00Z',
      unread_count: 3,
      is_active: true,
      transaction_booking: {
        nama_service: 'Full Body Massage',
        status: 'On Progress'
      },
      // For user view, show mitra info
      mitra_tomassage: {
        nama_lengkap: 'Anna Sofia',
        foto_profil: 'https://ygtechdev.my.id/files/photo-1740151130177-456855645.png'
      },
      // For mitra view, show user info
      users: {
        nama_lengkap: 'Budi Santoso',
        profile_photo: 'https://ygtechdev.my.id/files/photo-1740147784774-518969624.png'
      }
    },
    {
      id: 2,
      booking_id: 1002,
      last_message: 'Terima kasih atas layanannya hari ini!',
      last_message_time: '2023-01-02T16:45:00Z',
      unread_count: 0,
      is_active: true,
      transaction_booking: {
        nama_service: 'Massage Reflexy',
        status: 'Completed'
      },
      mitra_tomassage: {
        nama_lengkap: 'Dewi Sari',
        foto_profil: 'https://ygtechdev.my.id/files/photo-1740153200831-184538136.png'
      },
      users: {
        nama_lengkap: 'Rini Wijaya',
        profile_photo: 'https://ygtechdev.my.id/files/photo-1740147872503-380252301.png'
      }
    },
    {
      id: 3,
      booking_id: 1003,
      last_message: 'Apakah layanan include lulur?',
      last_message_time: '2023-01-03T09:15:00Z',
      unread_count: 1,
      is_active: true,
      transaction_booking: {
        nama_service: 'Massage Lulur',
        status: 'Pending'
      },
      mitra_tomassage: {
        nama_lengkap: 'Ratna Dewi',
        foto_profil: 'https://ygtechdev.my.id/files/photo-1740147811431-146857761.png'
      },
      users: {
        nama_lengkap: 'Ahmad Rizki',
        profile_photo: 'https://ygtechdev.my.id/files/photo-1740147931838-797532853.png'
      }
    }
  ];

  const loadChatHistory = async () => {
    try {
      // Ambil data user dari AsyncStorage terlebih dahulu
      const userDataStrz = await AsyncStorage.getItem('user_data');
      if (!userDataStrz) {
        console.log('Tidak ada data user');
        setLoading(false);
        return;
      }
  
      const userDatas = JSON.parse(userDataStrz);
      
      // Tentukan endpoint berdasarkan tipe user
      const endpoint = userDatas.type 
        ? `${API_URL}/chat-history/mitra/${userDatas.id}`
        : `${API_URL}/chat-history/user/${userDatas.id}`;
  
      // Panggil API untuk mendapatkan riwayat chat
      const response = await axios.get(endpoint);
      
      // Update state chat history
      setChatHistory(response.data.data || []);
      setFilteredHistory(response.data.data || []);
      
      console.log('Chat history:', response.data.data);
    } catch (err) {
      console.error('Error loading chat history:', err);
      // Gunakan data contoh jika gagal
      setChatHistory(tempChatHistory);
      setFilteredHistory(tempChatHistory);
    } finally {
      setLoading(false);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      loadChatHistory();
    }, [])
   ); // Dependency array kosong berarti hanya dijalankan sekali saat mount
  
  

  // Load user data on component mount


  // Update filtered history when search query changes
  useEffect(() => {
    // Fungsi inisialisasi data
    const initializeData = async () => {
      try {
        // Load user data dari AsyncStorage
        const userDataStr = await AsyncStorage.getItem('user_data');
        if (userDataStr) {
          const parsedUserData = JSON.parse(userDataStr);
          
          // Set user data terlebih dahulu
          setUserData(parsedUserData);
          setUserType(parsedUserData.type);
  
          // Setelah user data di-set, baru load chat history
  
          // Lakukan filtering
          if (!searchQuery.trim()) {
            setFilteredHistory(chatHistory);
          } else {
            const query = searchQuery.toLowerCase();
            const filtered = chatHistory.filter(chat => {
              const partnerName = parsedUserData.type 
                ? chat.users?.nama_lengkap
                : chat.mitra_tomassage?.nama_lengkap;
              
              const serviceName = chat.transaction_booking?.nama_service;
              
              return (
                (partnerName && partnerName.toLowerCase().includes(query)) ||
                (serviceName && serviceName.toLowerCase().includes(query)) ||
                (chat.last_message && chat.last_message.toLowerCase().includes(query))
              );
            });
            
            setFilteredHistory(filtered);
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };
  
    // Jalankan inisialisasi
    initializeData();
  }, [searchQuery]);
  // Format the time for display
  const formatTime = (timeString) => {
    const now = new Date();
    const time = new Date(timeString);
    
    // If today, show time only
    if (time.toDateString() === now.toDateString()) {
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (time.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    }
    
    // If within a week, show day name
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (time > oneWeekAgo) {
      return time.toLocaleDateString('id-ID', { weekday: 'long' });
    }
    
    // Otherwise, show date
    return time.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // Handle navigation to chat screen
  const handleChatPress = (item) => {
    const partnerInfo = userType
      ? 
      {
        name: item.users?.nama_lengkap,
        photo: item.users?.profile_photo
      }
   
      : 
       
      {
        name: item.mitra_tomassage?.nama_lengkap,
        photo: item.mitra_tomassage?.foto_profil
      }
    navigation.navigate('ChatScreen', {
      bookingId: item.booking_id,
      recipientName: partnerInfo.name,
      recipientPhoto: partnerInfo.photo,
      serviceInfo: item.transaction_booking?.nama_service
    });
  };

  // Render chat list item
  const renderChatItem = ({ item }) => {
    const partnerName = userType
      ?item.users?.nama_lengkap
      : item.mitra_tomassage?.nama_lengkap 
      
    const partnerPhoto = userType 
      ? item.users?.profile_photo
      : item.mitra_tomassage?.foto_profil
    
    const statusColor = 
      item.transaction_booking?.status === 'Completed' ? '#4CAF50' :
      item.transaction_booking?.status === 'On Progress' ? '#FF9800' : 
      '#14A49C';
    
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
      >
        <View style={styles.avatarContainer}>
          <Avatar.Image 
            size={60}
            source={{ uri: partnerPhoto || 'https://via.placeholder.com/60' }}
          />
          {item.unread_count > 0 && (
            <Badge
              style={styles.badge}
              size={item.unread_count > 99 ? 22 : 18}
            >
              {item.unread_count > 99 ? '99+' : item.unread_count}
            </Badge>
          )}
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.nameText} numberOfLines={1}>{partnerName}</Text>
            <Text style={styles.timeText}>{formatTime(item.last_message_time)}</Text>
          </View>
          
          <Text style={styles.messageText} numberOfLines={1}>
            {item.last_message}
          </Text>
          
          <View style={styles.serviceInfo}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.transaction_booking?.status}
            </Text>
            <Text style={styles.serviceText}>
              {item.transaction_booking?.nama_service}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="chat-outline" size={80} color="#C5C5C5" />
      <Text style={styles.emptyTitle}>
        Tidak Ada Pesan
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery ? 'Tidak ada pesan yang cocok dengan pencarian Anda' : 'Belum ada percakapan yang dimulai'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#14A49C" />
        <Text style={styles.loadingText}>Loading chat history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle-outline" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadChatHistory}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#14A49C" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          color="#fff"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Pesan</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Search bar */}
      <Searchbar
        placeholder="Cari pesan atau nama..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={{ fontSize: 14 }}
        icon="magnify"
        clearIcon="close"
      />
      
      {/* Chat list */}
      <FlatList
        data={filteredHistory}
        renderItem={renderChatItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        contentContainerStyle={filteredHistory.length === 0 ? { flex: 1 } : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14A49C',
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  searchBar: {
    margin: 10,
    elevation: 2,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: -4,
    backgroundColor: '#FF4D67',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#757575',
  },
  messageText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  serviceText: {
    fontSize: 12,
    color: '#757575',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 88, // Align with the right edge of avatar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    maxWidth: '80%',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#14A49C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatList;
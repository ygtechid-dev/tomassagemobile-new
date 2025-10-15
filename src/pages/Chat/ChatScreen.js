import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { API_URL } from '../../context/APIUrl';

// Daftar kata-kata kasar yang akan difilter
const KATA_KASAR_INDONESIA = [
  'anjing', 'bangsat', 'babi', 'kampret', 'kontol', 'memek', 'ngentot', 'perek',
  'tolol', 'goblok', 'bodoh', 'bego', 'jancok', 'cuki', 'brengsek', 'asu',
  'bajingan', 'keparat', 'setan', 'sialan', 'monyet', 'tai', 'bejat', 'idiot'
];

// Daftar kata-kata kasar bahasa Inggris
const KATA_KASAR_INGGRIS = [
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'dick', 'pussy', 'whore',
  'slut', 'bastard', 'motherfucker', 'cock', 'ass', 'bullshit', 'damn',
  'crap', 'twat', 'wanker', 'prick', 'douchebag', 'jerk', 'jackass', 
  'idiot', 'moron', 'retard', 'nigger', 'faggot'
];

// Gabungkan semua kata kasar dalam satu array
const KATA_KASAR = [...KATA_KASAR_INDONESIA, ...KATA_KASAR_INGGRIS];

// Fungsi untuk memeriksa apakah pesan mengandung kata kasar
const containsProfanity = (message) => {
  // Jika pesan kosong, langsung return false
  if (!message || message.trim() === '') return false;
  
  const lowerMessage = message.toLowerCase();
  
  // Memeriksa kata per kata dalam pesan
  const words = lowerMessage.split(/\s+/);
  
  for (const word of words) {
    // Hapus karakter non-alfanumerik untuk mendeteksi kata yang mungkin disamarkan
    const cleanWord = word.replace(/[^a-z0-9]/g, '');
    
    // Jika kata terlalu pendek, skip (menghindari false positive)
    if (cleanWord.length < 2) continue;
    
    // Periksa apakah kata tersebut ada dalam daftar kata kasar
    if (KATA_KASAR.some(badWord => {
      // Pencocokan langsung
      if (cleanWord === badWord) return true;
      
      // Pencocokan sebagian (untuk mendeteksi kata kasar yang disamarkan)
      // Misal: f*ck, sh*t, dll
      if (badWord.length > 3) {
        // Hanya cek kata dengan panjang lebih dari 3 untuk mengurangi false positive
        if (cleanWord.includes(badWord) || badWord.includes(cleanWord)) {
          return true;
        }
      }
      
      return false;
    })) {
      return true;
    }
  }
  
  return false;
};

const ChatScreen = ({ route, navigation }) => {
  const { bookingId, recipientName, recipientPhoto, serviceInfo } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState('user'); // 'user' or 'mitra'
  const flatListRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Handle report user
  const handleReportUser = () => {
    Alert.alert(
      "Laporkan Pengguna",
      `Apakah Anda yakin ingin melaporkan ${recipientName}?`,
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Laporkan",
          onPress: submitReport
        }
      ]
    );
  };

  // Submit report
  const submitReport = async () => {
    try {
      // Di sini seharusnya ada API call untuk mengirim laporan
      // Contoh:
      // await axios.post(`${API_URL}/reports`, {
      //   reporter_id: userData.id,
      //   reported_user_id: recipientId,
      //   booking_id: bookingId,
      //   report_reason: "Dilaporkan dari chat"
      // });
      
      // Untuk demo, kita langsung tampilkan alert sukses
      Alert.alert(
        "Laporan Diterima",
        "Report anda kami terima. Akan di proses selama 1-3 hari Kerja. Terima kasih",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Gagal mengirim laporan. Silakan coba lagi nanti.");
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
  
        const userDataStr = await AsyncStorage.getItem('user_data');
        console.log('sss', userDataStr);
        
        // const mitraDataStr = await AsyncStorage.getItem('user');
        const userData = JSON.parse(userDataStr);
          setUserData(userData);
          if(userData.type) {
            setUserType('mitra')
          } else {

            setUserType('user')
          }
          // setUserType(userData.type);
       
        
        // Load chat data
        await loadChatData();
        
        // Start polling for new messages
        startPollingMessages();
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };
    
    loadUserData();
    
    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Start polling for new messages
  const startPollingMessages = () => {
    pollingIntervalRef.current = setInterval(() => {
      loadChatData(true); // silent reload (no loading state)
    }, 5000); // every 5 seconds
  };

  // Load chat data from API
  const loadChatData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch chat messages from the API
      const response = await axios.get(`${API_URL}/chats/${bookingId}`);
      
      if (response.data.success) {
        setMessages(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to load messages');
      }
      
      if (!silent) setLoading(false);
      
      // Mark messages as read
      markMessagesAsRead();
    } catch (err) {
      console.error('Error loading chat data:', err);
      if (!silent) {
        setError('Failed to load chat messages');
        setLoading(false);
      }
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    try {
      if (!userType) return;
      
      await axios.put(`${API_URL}/chats/${bookingId}/read`, {
        reader_type: userType
      });
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !userData || !userType) return;
    
    // Cek apakah pesan mengandung kata kasar
    if (containsProfanity(newMessage)) {
      Alert.alert(
        "Peringatan",
        "Pesan mengandung kata-kata tidak pantas. Mohon gunakan bahasa yang sopan.",
        [{ text: "OK" }]
      );
      return;
    }
    
    const currentTime = new Date().toISOString();
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender_type: userType,
      message: newMessage.trim(),
      created_at: currentTime,
      sending: true
    };
    
    // Add message to UI immediately
    setMessages(prevMessages => [...prevMessages, tempMessage]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd();
    }, 200);
    
    try {
      // Send message to API
      const response = await axios.post(`${API_URL}/chats/${bookingId}`, {
        message: newMessage.trim(),
        sender_type: userType,
        sender_id: userData.id
      });
      
      if (response.data.success) {
        // Replace temp message with actual message from the server
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempMessage.id ? response.data.data : msg
          )
        );
        
        // Reload messages to ensure we have the latest
        loadChatData(true);
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Mark message as failed
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, sending: false, failed: true } 
            : msg
        )
      );
      
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // Fungsi untuk memantau input pesan secara real-time
  const handleMessageChange = (text) => {
    setNewMessage(text);
    
    // Opsional: Peringatan real-time jika kata kasar terdeteksi saat mengetik
    // Lebih baik tidak menerapkan ini untuk menghindari terlalu banyak pop-up
    // Implement jika diperlukan
  };

  // Retry sending a failed message
  const retryMessage = (message) => {
    // First check if the message contains profanity
    if (containsProfanity(message.message)) {
      Alert.alert(
        "Peringatan",
        "Pesan mengandung kata-kata tidak pantas. Mohon ubah pesan Anda.",
        [{ text: "OK" }]
      );
      
      // Remove the failed message
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== message.id)
      );
      
      // Set the message content for editing
      setNewMessage(message.message);
      return;
    }
    
    // If no profanity, proceed with retry
    setMessages(prevMessages => 
      prevMessages.filter(msg => msg.id !== message.id)
    );
    
    // Then set the message content and send it again
    setNewMessage(message.message);
    setTimeout(() => {
      sendMessage();
    }, 300);
  };

  // Format the time
  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format the date for section headers
  const formatDate = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Check if message is from the current user
  const isOwnMessage = (message) => {
    return message.sender_type === userType;
  };

  // Render message item
  const renderMessage = ({ item: message }) => {
    const own = isOwnMessage(message);
    
    return (
      <View style={[
        styles.messageContainer, 
        own ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {message.sending && (
          <View style={styles.pendingIndicator}>
            <ActivityIndicator size="small" color="#999" />
          </View>
        )}
        
        {message.failed && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => retryMessage(message)}
          >
            <Icon name="refresh" size={16} color="red" />
          </TouchableOpacity>
        )}
        
        <View style={[
          styles.messageBubble,
          own ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            own ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.message}
          </Text>
          <Text style={styles.messageTime}>{formatTime(message.created_at)}</Text>
        </View>
      </View>
    );
  };

  // Render date header
  const renderDateHeader = (date) => (
    <View style={styles.dateHeaderContainer}>
      <Text style={styles.dateHeaderText}>{date}</Text>
    </View>
  );

  // Process messages to add date headers
  const processedMessages = () => {
    if (!messages.length) return [];
    
    let result = [];
    let currentDate = null;
    
    messages.forEach(message => {
      const messageDate = formatDate(message.created_at);
      
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        result.push({
          id: `date-${message.created_at}`,
          type: 'date',
          date: messageDate
        });
      }
      
      result.push({
        ...message,
        type: 'message'
      });
    });
    
    return result;
  };

  // Render list item based on type
  const renderItem = ({ item }) => {
    if (item.type === 'date') {
      return renderDateHeader(item.date);
    } else {
      return renderMessage({ item });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#14A49C" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle-outline" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadChatData()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#14A49C" barStyle="light-content" />
      
      {/* Chat Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          color="#fff"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerProfile}>
          {/* <Avatar.Image
            size={40}
            source={{ uri: recipientPhoto || 'https://ygtechdev.my.id/files/photo-1740151130177-456855645.png' }}
          /> */}
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{recipientName || 'Chat'}</Text>
            <Text style={styles.headerStatus}>{serviceInfo || 'Online'}</Text>
          </View>
        </View>
        
        {/* Report Button */}
        <IconButton
          icon="flag"
          color="#fff"
          size={24}
          onPress={handleReportUser}
        />
      </View>
      
      {/* Chat Messages */}
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 0}
        enableOnAndroid={true}
      >
        <FlatList
          ref={flatListRef}
          data={processedMessages()}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd()}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
        
        {/* Message Input */}
        <View style={styles.inputContainer}>
          {/* <TouchableOpacity style={styles.attachButton}>
            <Icon name="paperclip" size={24} color="#666" />
          </TouchableOpacity> */}
          
          <TextInput
            style={styles.input}
            placeholder="Ketik pesan..."
            value={newMessage}
            onChangeText={handleMessageChange} // Gunakan handler yang sudah dimodifikasi
            multiline
            textAlignVertical="center"
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !newMessage.trim() ? styles.sendButtonDisabled : {}
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Icon name="send" size={24} color={!newMessage.trim() ? '#A0AEC0' : '#fff'} />
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
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
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    elevation: 4,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 14,
    color: '#E0F7F5',
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Pastikan input ada di bawah
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    // Tambahkan padding bawah untuk perangkat dengan notch/area tambahan
    paddingBottom: Platform.OS === 'ios' ? 20 : 8, 
  },

 
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    maxHeight: 100,
    fontSize: 16,
    minHeight: 40, // Tambahkan tinggi minimum
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 10,
    paddingBottom: 20,
  },
  dateHeaderContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dateHeaderText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  messageContainer: {
    marginVertical: 5,
    flexDirection: 'row',
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    marginLeft: 50,
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    marginRight: 50,
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    marginHorizontal: 8,
    maxWidth: '100%',
  },
  ownMessageBubble: {
    backgroundColor: '#E0F7F5', // Warna biru-hijau muda
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
  },
  otherMessageBubble: {
    backgroundColor: '#fff', // Warna putih
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: '#00564D', // Warna text lebih gelap untuk pesan sendiri
  },
  otherMessageText: {
    color: '#333', // Warna text standar untuk pesan lawan
  },
  messageTime: {
    fontSize: 10,
    color: '#757575',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  pendingIndicator: {
    alignSelf: 'center',
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#14A49C',
    borderRadius: 50,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
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

export default ChatScreen;
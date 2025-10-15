import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

// Setup notifikasi lokal
export const setupLocalNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
      // Bisa ditambahkan navigasi ke screen chat jika diperlukan
    },
    // Untuk Android
    channelId: "chat-channel",
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });

  // Buat channel untuk Android
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: "chat-channel",
        channelName: "Chat Notifications",
        importance: 4, // HIGH
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }
};

// Setup handler untuk pesan background dan terminated state
export const setupBackgroundNotificationHandler = () => {
  // Setup background handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background:', remoteMessage);
    
    // Tampilkan notifikasi lokal
    if (remoteMessage.notification) {
      PushNotification.localNotification({
        channelId: 'chat-channel',
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        data: remoteMessage.data,
      });
    }
  });
};

// Tambahkan fungsi untuk handle navigasi dari notifikasi
export const setupNotificationNavigation = (navigation) => {
  // Handle notifikasi yang membuka aplikasi dari terminated state
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Aplikasi dibuka dari notifikasi:', remoteMessage);
        handleNavigationFromNotification(navigation, remoteMessage);
      }
    });

  // Handle notifikasi yang membuka aplikasi dari background state
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Aplikasi dibuka dari background:', remoteMessage);
    handleNavigationFromNotification(navigation, remoteMessage);
  });
};

// Fungsi untuk handle navigasi berdasarkan data notifikasi
const handleNavigationFromNotification = (navigation, remoteMessage) => {
  if (remoteMessage.data?.notificationType === 'chat') {
    const { roomId, taskId, clientId, providerId } = remoteMessage.data;
    
    // Navigasi ke layar chat
    navigation.navigate('ChatScreen', {
      taskId,
      roomId,
      clientId,
      providerId,
      // tambahkan parameter lain yang diperlukan
    });
  }
};
// src/services/NotificationService.js
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import axios from 'axios';
import { API_URL } from '../context/APIUrl';

export default class NotificationService {
  static async requestUserPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
                       authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      console.log('Permission status:', enabled ? 'granted' : 'denied');
      return enabled;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  static async getFCMToken() {
    try {
      let fcmToken = await AsyncStorage.getItem('fcmToken');
      
      if (!fcmToken) {
        fcmToken = await messaging().getToken();
        if (fcmToken) {
          await AsyncStorage.setItem('fcmToken', fcmToken);
        }
      }
      
      console.log('FCM Token:', fcmToken);
      return fcmToken;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  static async registerDeviceToServer(userId, userType) {
    try {
      const token = await this.getFCMToken();
      
      if (!token) {
        console.error('No FCM token available');
        return false;
      }
      
      console.log(`Registering device for ${userType} ID: ${userId}`);
      
      // Kirim token ke server
      const response = await axios.post(`${API_URL}/api/notifications/register-device`, {
        user_id: userId,
        user_type: userType,
        device_token: token,
        device_type: Platform.OS
      });
      
      console.log('Registration response:', response.data);
      return true;
    } catch (error) {
      console.error('Error registering device:', error);
      return false;
    }
  }
}
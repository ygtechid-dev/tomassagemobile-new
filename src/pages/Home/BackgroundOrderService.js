// BackgroundOrderService.js - Fixed Geolocation Import
import { NativeModules, AppState, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../context/APIUrl';

// ✅ OPTION 1: Jika file APIUrl.js ada, uncomment line ini dan sesuaikan path
// import { API_URL } from '../context/APIUrl';

// ✅ OPTION 2: Jika tidak ada file APIUrl.js, definisikan di sini
 // Ganti dengan URL API yang benar

// ✅ PERBAIKAN: Import Geolocation dengan try-catch untuk handle jika module tidak ada
let Geolocation = null;
try {
  Geolocation = require('@react-native-community/geolocation');
} catch (error) {
  console.warn('⚠️ @react-native-community/geolocation not installed');
}

const { EnhancedBackgroundOrderModule } = NativeModules;

class BackgroundOrderService {
  constructor() {
    this.isServiceRunning = false;
    this.appStateListener = null;
    this.isConfigured = false;
    this.currentUserData = null;
    
    // Check if native module is available
    if (!EnhancedBackgroundOrderModule) {
      console.warn('⚠️ EnhancedBackgroundOrderModule not found. Make sure Kotlin module is properly linked.');
    } else {
      console.log('✅ Kotlin Background Service Module loaded successfully');
    }
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Kotlin BackgroundOrderService...');
      
      // Check if native module is available
      if (!EnhancedBackgroundOrderModule) {
        throw new Error('EnhancedBackgroundOrderModule not found. Make sure Kotlin module is properly linked.');
      }

      // Get user data
      const userData = await AsyncStorage.getItem('user_data');
      if (!userData) {
        throw new Error('User data not found in AsyncStorage');
      }

      this.currentUserData = JSON.parse(userData);
      console.log('👤 User data loaded:', this.currentUserData.id);
      
      // Get current location
      const locationData = await this.getCurrentLocation();
      console.log('📍 Location data:', locationData);
      
      // Configure the Kotlin native module
      await this.configureNativeModule(this.currentUserData, locationData);
      
      this.isConfigured = true;
      console.log('✅ Kotlin Background service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Kotlin background service:', error);
      throw error;
    }
  }

  async configureNativeModule(userData, locationData) {
    try {
      const config = {
        apiUrl: API_URL,
        userId: userData.id.toString(),
        latitude: locationData.latitude || -6.2088, // Default to Jakarta
        longitude: locationData.longitude || 106.8456
      };

      console.log('⚙️ Configuring Kotlin native module with:', config);
      const result = await EnhancedBackgroundOrderModule.setConfig(config);
      console.log('✅ Kotlin module configuration result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Failed to configure Kotlin native module:', error);
      throw error;
    }
  }

  // ✅ PERBAIKAN: getCurrentLocation dengan fallback jika Geolocation tidak tersedia
  getCurrentLocation() {
    return new Promise(async (resolve) => {
      try {
        // Try to get from AsyncStorage first
        const savedLocation = await AsyncStorage.getItem('user_location');
        if (savedLocation) {
          const location = JSON.parse(savedLocation);
          console.log('📍 Using saved location:', location);
          resolve(location);
          return;
        }

        // ✅ FIXED: Check if Geolocation module is available
        if (Platform.OS === 'android' && Geolocation) {
          try {
            console.log('📍 Trying to get current location using Geolocation...');
            
            Geolocation.getCurrentPosition(
              (position) => {
                const location = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                };
                console.log('📍 Got current location:', location);
                
                // Save for future use
                AsyncStorage.setItem('user_location', JSON.stringify(location));
                resolve(location);
              },
              (error) => {
                console.warn('⚠️ Failed to get current location:', error);
                // Use default Jakarta coordinates
                resolve({ latitude: -6.2088, longitude: 106.8456 });
              },
              { 
                enableHighAccuracy: false, 
                timeout: 5000, 
                maximumAge: 300000 // 5 minutes
              }
            );
          } catch (geoError) {
            console.warn('⚠️ Geolocation error:', geoError);
            resolve({ latitude: -6.2088, longitude: 106.8456 });
          }
        } else {
          // ✅ FALLBACK: Jika Geolocation tidak tersedia atau platform bukan Android
          console.log('📍 Geolocation not available, using default Jakarta coordinates');
          resolve({ latitude: -6.2088, longitude: 106.8456 });
        }
      } catch (error) {
        console.warn('⚠️ Error getting location:', error);
        resolve({ latitude: -6.2088, longitude: 106.8456 });
      }
    });
  }

  async requestOverlayPermission() {
    try {
      if (Platform.OS === 'android' && EnhancedBackgroundOrderModule) {
        const result = await EnhancedBackgroundOrderModule.requestOverlayPermission();
        console.log('🔐 Overlay permission result:', result);
        return result;
      }
      return 'Permission not required for this platform';
    } catch (error) {
      console.error('❌ Failed to request overlay permission:', error);
      throw error;
    }
  }

  async startService() {
    try {
      console.log('🚀 Starting Kotlin background service...');

      // Initialize if not already done
      if (!this.isConfigured) {
        await this.initialize();
      }

      // Request overlay permission first (Android only)
      if (Platform.OS === 'android') {
        await this.requestOverlayPermission();
        
        // Give user a moment to grant permission
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Start the Kotlin background service
      const result = await EnhancedBackgroundOrderModule.startBackgroundService();
      this.isServiceRunning = true;
      
      console.log('✅ Kotlin background service started successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to start Kotlin background service:', error);
      
      // Show user-friendly error message
      if (error.message?.includes('OVERLAY_PERMISSION')) {
        Alert.alert(
          'Izin Diperlukan',
          'Aplikasi membutuhkan izin untuk menampilkan notifikasi di atas aplikasi lain. Silakan aktifkan di pengaturan.',
          [
            { text: 'Nanti', style: 'cancel' },
            { 
              text: 'Buka Pengaturan', 
              onPress: () => this.requestOverlayPermission()
            }
          ]
        );
      }
      
      throw error;
    }
  }

  async stopService() {
    try {
      if (!EnhancedBackgroundOrderModule) {
        console.warn('⚠️ Kotlin native module not available for stopping service');
        return;
      }

      const result = await EnhancedBackgroundOrderModule.stopBackgroundService();
      this.isServiceRunning = false;
      
      console.log('🛑 Kotlin background service stopped successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to stop Kotlin background service:', error);
      this.isServiceRunning = false; // Reset state even if stop failed
      throw error;
    }
  }

  async updateLocation(latitude, longitude) {
    try {
      if (!this.isConfigured || !this.currentUserData) {
        console.warn('⚠️ Service not configured, cannot update location');
        return;
      }

      const config = {
        apiUrl: API_URL,
        userId: this.currentUserData.id.toString(),
        latitude: latitude,
        longitude: longitude
      };

      await EnhancedBackgroundOrderModule.setConfig(config);
      
      // Save location to AsyncStorage for future use
      await AsyncStorage.setItem('user_location', JSON.stringify({
        latitude: latitude,
        longitude: longitude
      }));
      
      console.log('📍 Location updated in Kotlin background service:', { latitude, longitude });
    } catch (error) {
      console.error('❌ Failed to update location in Kotlin background service:', error);
    }
  }

  async refreshUserData() {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        this.currentUserData = JSON.parse(userData);
        
        // Reconfigure if service is running
        if (this.isConfigured) {
          const locationData = await this.getCurrentLocation();
          await this.configureNativeModule(this.currentUserData, locationData);
        }
        
        console.log('🔄 User data refreshed in Kotlin background service');
      }
    } catch (error) {
      console.error('❌ Failed to refresh user data:', error);
    }
  }

  isRunning() {
    return this.isServiceRunning;
  }

  isInitialized() {
    return this.isConfigured;
  }

  // Method untuk testing
  async testService() {
    try {
      console.log('🧪 === TESTING KOTLIN BACKGROUND SERVICE ===');
      
      // Test initialization
      await this.initialize();
      console.log('✅ Kotlin initialization successful');
      
      // Test permission
      await this.requestOverlayPermission();
      console.log('✅ Permission request successful');
      
      // Test start service
      await this.startService();
      console.log('✅ Kotlin service start successful');
      
      // Test running for 30 seconds
      console.log('🔄 Kotlin service will run for 30 seconds...');
      
      setTimeout(async () => {
        try {
          await this.stopService();
          console.log('✅ Kotlin service stop successful');
          console.log('🎉 === KOTLIN TEST COMPLETED ===');
          
          Alert.alert('Test Selesai', 'Kotlin background service test berhasil!');
        } catch (error) {
          console.error('❌ Kotlin service stop failed:', error);
        }
      }, 30000);
      
      Alert.alert(
        'Kotlin Test Dimulai', 
        'Kotlin background service test berjalan selama 30 detik. Coba minimize aplikasi untuk melihat hasilnya.'
      );
      
    } catch (error) {
      console.error('❌ Kotlin test failed:', error);
      Alert.alert('Kotlin Test Gagal', error.message);
    }
  }

  // Method untuk debugging
  async getStatus() {
    return {
      isRunning: this.isServiceRunning,
      isConfigured: this.isConfigured,
      hasUserData: !!this.currentUserData,
      userId: this.currentUserData?.id || null,
      nativeModuleAvailable: !!EnhancedBackgroundOrderModule,
      moduleType: 'Kotlin',
      geolocationAvailable: !!Geolocation
    };
  }

  // Method untuk check health
  async healthCheck() {
    try {
      const status = await this.getStatus();
      console.log('🏥 Kotlin Background Service Health Check:', status);
      
      if (!status.nativeModuleAvailable) {
        console.error('❌ Kotlin native module not available');
        return false;
      }
      
      if (!status.hasUserData) {
        console.warn('⚠️ User data not available');
        return false;
      }
      
      if (!status.geolocationAvailable) {
        console.warn('⚠️ Geolocation module not available - using default coordinates');
      }
      
      console.log('✅ Kotlin Background Service is healthy');
      return true;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }
}

export default new BackgroundOrderService();
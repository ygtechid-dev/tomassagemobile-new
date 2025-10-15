// AppUpdateChecker.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Image, 
  Linking, 
  Platform 
} from 'react-native';
import { checkVersion } from 'react-native-check-version';
import DeviceInfo from 'react-native-device-info';

const AppUpdateChecker = () => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const currentVersion = DeviceInfo.getVersion();
      
      // Cek pembaruan menggunakan react-native-check-version
      const result = await checkVersion({
        platform: Platform.OS,
        currentVersion,
        packageName: 'com.tomassagemitra', // packageName di Play Store
        country: 'id', // Kode negara Indonesia
      });

      console.log('Update check result:', result);
      
      // Jika ada pembaruan, tampilkan modal
      if (result.needsUpdate) {
        setUpdateInfo(result);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const openPlayStore = () => {
    // Buka aplikasi di Play Store
    const storeUrl = 'https://play.google.com/store/apps/details?id=com.tomassagemitra&hl=en';
    Linking.openURL(storeUrl);
  };

  if (!updateInfo) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.updateModalContent}>
          <View style={styles.updateImageContainer}>
            <Image 
              source={{uri: 'https://ygtechdev.my.id/files/photo-1745120968708-376051284.png'}} 
              style={styles.updateImage} 
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.updateTitle}>Pembaruan Tersedia</Text>
          
          <Text style={styles.updateMessage}>
            Versi baru ({updateInfo.version}) tersedia di Play Store.
            {'\n'}Versi saat ini: {updateInfo.currentVersion}
          </Text>
          
          <Text style={styles.updateFeatures}>
            Fitur baru:
            {'\n'}• Peningkatan performa aplikasi
            {'\n'}• Perbaikan bug dan stabilitas
            {'\n'}• Antarmuka pengguna yang lebih baik
            {'\n'}• Fitur notifikasi pesanan yang disempurnakan
          </Text>
          
          <TouchableOpacity 
            style={styles.updateButton} 
            onPress={openPlayStore}
          >
            <Text style={styles.updateButtonText}>Perbarui Sekarang</Text>
          </TouchableOpacity>
          
          {/* <TouchableOpacity 
            style={styles.laterButton} 
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.laterButtonText}>Nanti</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  updateModalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  updateImageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  updateImage: {
    width: 120,
    height: 120,
  },
  updateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  updateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  updateFeatures: {
    fontSize: 14,
    color: '#555',
    textAlign: 'left',
    alignSelf: 'stretch',
    marginBottom: 20,
    lineHeight: 22,
  },
  updateButton: {
    backgroundColor: '#14A49C',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  laterButton: {
    paddingVertical: 12,
  },
  laterButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

export default AppUpdateChecker;
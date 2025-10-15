import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Linking, Platform, ActivityIndicator, ScrollView, TextInput, FlatList, TouchableOpacity, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { 
  Text, 
  IconButton, 
  Button,
  Surface,
  TouchableRipple,
  Snackbar,
  Card,
  Divider,
  Chip
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

const LocationSelectScreen = ({ route, navigation }) => {
  // Get data from previous screen
  const { service, selectedVariant, selectedDate, totalPrice, therapistGender } = route.params || {};
  
  // State for location selection mode
  const [selectionMode, setSelectionMode] = useState(null); // 'current' or 'search'
  
  // State for current location
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState(null);
  
  // State for location search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedSearchLocation, setSelectedSearchLocation] = useState(null);
  
  // General state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // WebView reference to communicate with the map
  const webViewRef = useRef(null);

  // Get current location using the geolocation API
  const getCurrentLocation = () => {
    setLoading(true);
    setSelectionMode('current');
    
    Geolocation.getCurrentPosition(
      async (info) => {
        const { latitude, longitude } = info.coords;
        
        console.log('Location retrieved:', latitude, longitude);
        setLatitude(latitude);
        setLongitude(longitude);
        
        try {
          // Reverse geocoding to get the address
          const response = await axios.get(
            `https://api-bdc.net/data/reverse-geocode?latitude=${latitude}&longitude=${longitude}&localityLanguage=id&key=bdc_d081193b116d47d996b4e3802fbe4761`
          );
          
          if (response.data) {
            // Format address from response
            const formattedAddress = [
              response.data.locality,
              response.data.city,
              response.data.principalSubdivision,
              response.data.countryName
            ].filter(Boolean).join(', ');
            
            setAddress(formattedAddress || 'Unknown location');
          }
        } catch (error) {
          console.error('Error getting location details:', error);
          setAddress('Unable to retrieve address');
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Please check your GPS settings.');
        setLoading(false);
        setSnackbarMessage('Gagal mendapatkan lokasi. Periksa pengaturan GPS Anda.');
        setSnackbarVisible(true);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Search for locations using Nominatim API
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=10&addressdetails=1`
      );
      
      if (response.data) {
        const formattedResults = response.data.map(item => ({
          id: item.place_id,
          name: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          address: item.display_name
        }));
        setSearchResults(formattedResults);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSnackbarMessage('Gagal mencari lokasi. Coba lagi.');
      setSnackbarVisible(true);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle location search selection
  const handleSearchLocationSelect = (location) => {
    setSelectedSearchLocation(location);
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setAddress(location.address);
    setSelectionMode('search');
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
    
    // Small delay to ensure state is updated before WebView renders
    setTimeout(() => {
      if (webViewRef.current) {
        // Update map center to new location
        webViewRef.current.postMessage(JSON.stringify({
          type: 'updateLocation',
          latitude: location.latitude,
          longitude: location.longitude
        }));
      }
    }, 500);
  };

  // Handle marker dragging on the map
  const handleMapMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerDrag') {
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        
        // Update address when marker is dragged
        fetchAddressFromCoords(data.latitude, data.longitude);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Fetch address from coordinates with loading state
  const fetchAddressFromCoords = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`
      );
      
      if (response.data) {
        // Format address from response
        const formattedAddress = [
          response.data.locality,
          response.data.city,
          response.data.principalSubdivision,
          response.data.countryName
        ].filter(Boolean).join(', ');
        
        setAddress(formattedAddress || 'Unknown location');
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      setAddress('Unable to retrieve address');
    } finally {
      setLoading(false);
    }
  };

  // HTML for the map with marker dragging capability
  const getMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .custom-marker {
            background-color: #2ABCB4;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          .pulse {
            background: rgba(42, 188, 180, 0.3);
            border-radius: 50%;
            height: 50px;
            width: 50px;
            position: absolute;
            left: -10px;
            top: -10px;
            animation: pulsate 2s ease-out infinite;
          }
          @keyframes pulsate {
            0% {
              transform: scale(0.1, 0.1);
              opacity: 0.0;
            }
            50% {
              opacity: 1.0;
            }
            100% {
              transform: scale(1.2, 1.2);
              opacity: 0.0;
            }
          }
          .drag-hint {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(42, 188, 180, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeIn 0.5s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="drag-hint">📍 Seret pin untuk mengubah lokasi</div>
        <script>
          // Create map
          const map = L.map('map').setView([${latitude || -6.2088}, ${longitude || 106.8456}], 16);
          
          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          
          // Custom icon for marker
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="pulse"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });
          
          // Add draggable marker with custom icon
          let marker = L.marker([${latitude || -6.2088}, ${longitude || 106.8456}], {
            draggable: true,
            icon: customIcon
          }).addTo(map);
          
          // Handle marker drag events
          marker.on('dragstart', function(event) {
            // Hide hint when dragging starts
            document.querySelector('.drag-hint').style.display = 'none';
          });
          
          marker.on('dragend', function(event) {
            const position = marker.getLatLng();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerDrag',
              latitude: position.lat,
              longitude: position.lng
            }));
          });
          
          // Handle map click to move marker
          map.on('click', function(event) {
            const { lat, lng } = event.latlng;
            marker.setLatLng([lat, lng]);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerDrag',
              latitude: lat,
              longitude: lng
            }));
          });
          
          // Listen for location updates from React Native
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'updateLocation') {
                const newLatLng = [data.latitude, data.longitude];
                marker.setLatLng(newLatLng);
                map.setView(newLatLng, 16);
              }
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          });
          
          // Auto-hide hint after 3 seconds
          setTimeout(() => {
            const hint = document.querySelector('.drag-hint');
            if (hint) {
              hint.style.transition = 'opacity 0.5s ease-out';
              hint.style.opacity = '0';
              setTimeout(() => hint.remove(), 500);
            }
          }, 3000);
        </script>
      </body>
      </html>
    `;
  };

  // Proceed to next screen with location data
  const proceedWithLocation = () => {
    if (!latitude || !longitude) {
      setSnackbarMessage('Silahkan pilih lokasi terlebih dahulu');
      setSnackbarVisible(true);
      return;
    }

    // Navigate to success screen with all booking details
    navigation.push('BookingSearchScreen', {
      service,
      selectedVariant,
      selectedDate,
      totalPrice,
      therapistGender,
      location: {
        latitude,
        longitude,
        address
      }
    });
  };

  // Reset selection
  const resetSelection = () => {
    setSelectionMode(null);
    setLatitude(null);
    setLongitude(null);
    setAddress('');
    setError(null);
    setSelectedSearchLocation(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Pilih Lokasi Anda</Text>
        <Text style={styles.subtitle}>
          Tentukan lokasi akurat tempat Anda yang akan kami kunjungi
        </Text>

        {/* Location Selection Options */}
        {!selectionMode ? (
          <View style={styles.optionsContainer}>
            {/* Current Location Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <LinearGradient
                colors={['#2ABCB4', '#20A39E']}
                style={styles.optionGradient}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="crosshairs-gps" size={32} color="#fff" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Gunakan Lokasi Saat Ini</Text>
                    <Text style={styles.optionDescription}>
                      Otomatis ambil lokasi dari GPS Anda
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Search Location Option */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setShowSearchModal(true)}
            >
              <LinearGradient
                colors={['#FF6B9D', '#FF4081']}
                style={styles.optionGradient}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionIconContainer}>
                    <Icon name="map-search" size={32} color="#fff" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Cari Lokasi Manual</Text>
                    <Text style={styles.optionDescription}>
                      Ketik nama tempat atau alamat
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Selected Location Info */}
            <Surface style={styles.selectedLocationCard}>
              <View style={styles.selectedLocationHeader}>
                <View style={styles.locationTypeChip}>
                  <Icon 
                    name={selectionMode === 'current' ? 'crosshairs-gps' : 'map-search'} 
                    size={16} 
                    color="#2ABCB4" 
                  />
                  <Text style={styles.locationTypeText}>
                    {selectionMode === 'current' ? 'Lokasi Saat Ini' : 'Lokasi Manual'}
                  </Text>
                </View>
                <TouchableOpacity onPress={resetSelection}>
                  <Icon name="close-circle" size={20} color="#FF4081" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.addressDisplay}>
                <Icon name="map-marker" size={24} color="#2ABCB4" />
                <View style={styles.addressTextContainer}>
                  <Text style={styles.addressLabel}>
                    {selectionMode === 'search' ? 'Lokasi Terpilih (dapat disesuaikan):' : 'Alamat Terpilih:'}
                  </Text>
                  {loading ? (
                    <View style={styles.loadingAddress}>
                      <ActivityIndicator size="small" color="#2ABCB4" />
                      <Text style={styles.loadingAddressText}>Memperbarui alamat...</Text>
                    </View>
                  ) : (
                    <Text style={styles.addressText}>{address}</Text>
                  )}
                </View>
              </View>
            </Surface>

            {/* Map Preview */}
            {(latitude && longitude) && (
              <View style={styles.mapPreview}>
                <Text style={styles.mapTitle}>Pratinjau Lokasi</Text>
                <View style={styles.mapContainer}>
                  <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: getMapHTML() }}
                    onMessage={handleMapMessage}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2ABCB4" />
                      </View>
                    )}
                    style={styles.webView}
                  />
                </View>
                <Text style={styles.mapInstructions}>
                  {selectionMode === 'search' 
                    ? "📍 Pin dapat digeser atau tap map untuk mengubah lokasi"
                    : "Seret pin untuk menyesuaikan lokasi yang tepat"
                  }
                </Text>
              </View>
            )}

            {/* Error Display */}
            {error && (
              <Surface style={styles.errorCard}>
                <Icon name="alert-circle" size={24} color="#FF4081" />
                <View style={styles.errorTextContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <Button 
                    mode="outlined" 
                    onPress={getCurrentLocation}
                    style={styles.retryButton}
                    compact
                  >
                    Coba Lagi
                  </Button>
                </View>
              </Surface>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      {selectionMode && latitude && longitude && (
        <View style={styles.bottomContainer}>
          <Button
            mode="contained"
            onPress={proceedWithLocation}
            style={styles.proceedButton}
            contentStyle={styles.buttonContent}
            disabled={loading || !latitude}
          >
            Lanjutkan Pemesanan
          </Button>
        </View>
      )}

      {/* Search Location Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cari Lokasi</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowSearchModal(false)}
            />
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name="magnify" size={24} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Masukkan nama tempat atau alamat..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchLocations(text);
                }}
                autoFocus
              />
              {searchLoading && (
                <ActivityIndicator size="small" color="#2ABCB4" style={styles.searchLoader} />
              )}
            </View>
          </View>

          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            style={styles.searchResults}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => handleSearchLocationSelect(item)}
              >
                <Icon name="map-marker" size={20} color="#2ABCB4" />
                <View style={styles.searchResultText}>
                  <Text style={styles.searchResultName} numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              searchQuery.length >= 3 && !searchLoading ? (
                <View style={styles.noResultsContainer}>
                  <Icon name="map-search-outline" size={48} color="#ccc" />
                  <Text style={styles.noResultsText}>Tidak ada hasil ditemukan</Text>
                  <Text style={styles.noResultsSubtext}>
                    Coba gunakan kata kunci yang berbeda
                  </Text>
                </View>
              ) : null
            )}
          />
        </View>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  backButton: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#2C3E50',
  },
  subtitle: {
    fontSize: 16,
    color: '#5D6D7E',
    marginTop: 8,
    marginBottom: 30,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  optionGradient: {
    padding: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  selectedLocationCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
  },
  selectedLocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 188, 180, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationTypeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#2ABCB4',
  },
  addressDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  addressLabel: {
    fontSize: 14,
    color: '#5D6D7E',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 22,
  },
  loadingAddress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingAddressText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#5D6D7E',
    fontStyle: 'italic',
  },
  mapPreview: {
    marginBottom: 20,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2C3E50',
  },
  mapContainer: {
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  mapInstructions: {
    textAlign: 'center',
    marginTop: 12,
    color: '#5D6D7E',
    fontStyle: 'italic',
    fontSize: 14,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#FFF5F5',
  },
  errorTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    borderColor: '#FF4081',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  proceedButton: {
    borderRadius: 15,
    backgroundColor: '#2ABCB4',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    marginTop: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  searchLoader: {
    marginLeft: 8,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchResultText: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 22,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D6D7E',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default LocationSelectScreen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  Alert,
  Linking,
  Platform,
  Dimensions,
  PermissionsAndroid,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import bgGaspol from '../../assets/bggaspol.png';

const { width, height } = Dimensions.get('window');

// Mapbox Token
const MAPBOX_TOKEN = 'pk.eyJ1IjoieWdzcGFjZXNoaXAiLCJhIjoiY21nYWpsZ2dlMHZjczJrb2MzaDJ4b2kxZiJ9.xovhNU8rxyslka-YC1Y8sQ';

const GaspolDelivery = ({ navigation }) => {
  // State variables
  const [showMapModal, setShowMapModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapType, setMapType] = useState('pickup');
  
  // Location states
  const [currentLocation, setCurrentLocation] = useState({
    latitude: -6.2088,
    longitude: 106.8456,
  });
  const [mapCenter, setMapCenter] = useState({
    latitude: -6.2088,
    longitude: 106.8456,
  });

  // Transaction data
  const [transactionData, setTransactionData] = useState({
    pickupPoint: {
      address: '',
      coordinates: { latitude: null, longitude: null }
    },
    dropoffPoint: {
      address: '',
      coordinates: { latitude: null, longitude: null }
    },
    courier: {
      name: '',
      id: '',
      rating: null,
      reviewCount: null,
      photo: ''
    },
    trackingCode: ''
  });

  // Initialize component
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Permission and location functions
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Izin Lokasi Diperlukan',
            message: 'Aplikasi membutuhkan akses lokasi untuk menentukan posisi Anda',
            buttonNeutral: 'Tanya Nanti',
            buttonNegative: 'Tolak',
            buttonPositive: 'Izinkan',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    
    Geolocation.getCurrentPosition(
      async (info) => {
        const { latitude, longitude } = info.coords;
        console.log('Current Location:', latitude, longitude);
        
        try {
          setCurrentLocation({ latitude, longitude });
          setMapCenter({ latitude, longitude });
          
          // Get location name menggunakan Mapbox
          const locationName = await getLocationName(latitude, longitude);
          
          const newLocation = {
            name: locationName.split(',')[0],
            address: locationName,
            coordinates: { latitude, longitude }
          };
          
          setSelectedLocation(newLocation);
          
          // Set sebagai pickup point initial
          setTransactionData(prev => ({
            ...prev,
            pickupPoint: {
              address: locationName,
              coordinates: { latitude, longitude }
            }
          }));
          
        } catch (error) {
          console.error('Error getting location details:', error);
          setCurrentLocation({ latitude, longitude });
          setMapCenter({ latitude, longitude });
          
          // Fallback
          setTransactionData(prev => ({
            ...prev,
            pickupPoint: {
              address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
              coordinates: { latitude, longitude }
            }
          }));
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Error getting current location:', error);
        setLoading(false);
        Alert.alert('Error', 'Gagal mendapatkan lokasi saat ini');
      },
      { 
        enableHighAccuracy: false,
        timeout: 10000,
      }
    );
  };

  // Search locations menggunakan Mapbox
  const searchLocations = async (query) => {
    if (!query || query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        {
          params: {
            country: 'id',
            proximity: `${currentLocation.longitude},${currentLocation.latitude}`,
            limit: 10,
            language: 'id',
            access_token: MAPBOX_TOKEN
          }
        }
      );

      if (response.data.features) {
        const formattedResults = response.data.features.map(item => ({
          id: item.id,
          name: item.text,
          latitude: item.center[1],
          longitude: item.center[0],
          address: item.place_name,
          coordinates: {
            latitude: item.center[1],
            longitude: item.center[0]
          }
        }));
        setSearchResults(formattedResults);
        console.log('Search results:', formattedResults.length, 'locations found');
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      Alert.alert('Error', 'Gagal mencari lokasi. Periksa koneksi internet Anda.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Reverse geocoding menggunakan Mapbox
  const getLocationName = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
        {
          params: {
            access_token: MAPBOX_TOKEN,
            language: 'id',
            types: 'address,poi,place'
          }
        }
      );
      
      if (response.data.features && response.data.features.length > 0) {
        return response.data.features[0].place_name;
      }
      
      return `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
      
    } catch (error) {
      console.error('Error getting location name:', error);
      return `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
    }
  };

  // Modal and navigation handlers
  const handleLocationPress = (locationType) => {
    setMapType(locationType);
    const targetLocation = locationType === 'pickup' 
      ? transactionData.pickupPoint.coordinates 
      : transactionData.dropoffPoint.coordinates;
    
    if (targetLocation.latitude && targetLocation.longitude) {
      setMapCenter(targetLocation);
    }
    setShowMapModal(true);
  };

  const selectSearchResult = (location) => {
    if (mapType === 'pickup') {
      setTransactionData(prev => ({
        ...prev,
        pickupPoint: {
          address: location.address,
          coordinates: location.coordinates
        }
      }));
    } else {
      setTransactionData(prev => ({
        ...prev,
        dropoffPoint: {
          address: location.address,
          coordinates: location.coordinates
        }
      }));
    }
    setMapCenter(location.coordinates);
    setSelectedLocation(location);
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // External navigation
  const openGoogleMaps = (coordinates, address) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${coordinates.latitude},${coordinates.longitude}`,
      android: `geo:${coordinates.latitude},${coordinates.longitude}?q=${coordinates.latitude},${coordinates.longitude}(${address})`
    });
    
    Linking.openURL(url).catch(() => {
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
      Linking.openURL(webUrl);
    });
  };

  // Map HTML generation
  const generateMapHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100%; }
        .custom-div-icon {
          background: #26d0ce;
          border: 3px solid white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${mapCenter.latitude}, ${mapCenter.longitude}], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        var marker = L.marker([${mapCenter.latitude}, ${mapCenter.longitude}], {
          draggable: true
        }).addTo(map);

        marker.bindPopup('${mapType === 'pickup' ? 'Pickup Point' : 'Drop-off Point'}').openPopup();

        marker.on('dragend', function(e) {
          var position = marker.getLatLng();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'locationSelected',
            latitude: position.lat,
            longitude: position.lng
          }));
        });

        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'locationSelected',
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          }));
        });

        if (${currentLocation.latitude} && ${currentLocation.longitude}) {
          L.marker([${currentLocation.latitude}, ${currentLocation.longitude}], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          }).addTo(map).bindPopup('Your Location');
        }
      </script>
    </body>
    </html>
    `;
  };

  const onWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelected') {
        setMapCenter({
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Render functions
  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectSearchResult(item)}
    >
      <Icon name="map-marker" size={20} color="#26d0ce" />
      <View style={styles.searchResultText}>
        <Text style={styles.searchResultName}>{item.name}</Text>
        <Text style={styles.searchResultAddress} numberOfLines={2}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={bgGaspol}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gaspol</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Route Information */}
          <View style={styles.routeCard}>
            <TouchableOpacity
              style={styles.locationItem}
              onPress={() => handleLocationPress('pickup')}
            >
              <View style={[styles.locationIcon, styles.pickupIcon]}>
                <Icon name="circle" size={16} color="white" />
              </View>
              <View style={styles.locationDetails}>
                <Text style={styles.locationLabel}>Pickup point</Text>
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {transactionData.pickupPoint.address || "Pilih Lokasi Disini"}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationItem}
              onPress={() => handleLocationPress('dropoff')}
            >
              <View style={[styles.locationIcon, styles.dropoffIcon]}>
                <Icon name="circle" size={16} color="white" />
              </View>
              <View style={styles.locationDetails}>
                <Text style={styles.locationLabel}>Drop-off point</Text>
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {transactionData.dropoffPoint.address || "Pilih Lokasi Disini"}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>

            {transactionData.pickupPoint.address && transactionData.dropoffPoint.address ? (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() =>
                  navigation.navigate('OrderBaruGaspol', {
                    pickupPoint: transactionData.pickupPoint,
                    dropoffPoint: transactionData.dropoffPoint
                  })
                }
              >
                <Text style={styles.continueButtonText}>Lanjutkan</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Transaction Section */}
          <View style={styles.transactionSection}>
            <Text style={styles.sectionTitle}>Transaksi Anda</Text>
          </View>
        </ScrollView>

        {/* Map Modal */}
        <Modal
          visible={showMapModal}
          animationType="slide"
          onRequestClose={() => setShowMapModal(false)}
        >
          <View style={styles.mapContainer}>
            <WebView
              style={styles.map}
              source={{ html: generateMapHTML() }}
              onMessage={onWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
            />

            <View style={styles.mapBottom}>
              <View style={styles.selectedLocationInfo}>
                <Icon name="map-marker" size={20} color="#26d0ce" />
                <Text style={styles.selectedLocationText}>
                  {selectedLocation 
                    ? selectedLocation.name || selectedLocation.address
                    : (mapCenter.latitude && mapCenter.longitude
                        ? `Lat: ${mapCenter.latitude.toFixed(6)}, Lng: ${mapCenter.longitude.toFixed(6)}`
                        : 'Lokasi tidak tersedia'
                      )
                  }
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.searchLocationButton}
                onPress={() => {
                  setShowMapModal(false);
                  setShowSearchModal(true);
                }}
              >
                <Icon name="magnify" size={20} color="white" />
                <Text style={styles.searchLocationButtonText}>Cari Lokasi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.getCurrentLocationButton, loading && styles.getCurrentLocationButtonDisabled]}
                onPress={getCurrentLocation}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#26d0ce" />
                ) : (
                  <Icon name="crosshairs-gps" size={20} color="#26d0ce" />
                )}
                <Text style={styles.getCurrentLocationText}>
                  {loading ? 'Getting Location...' : 'Current Location'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.selectPointButton}
                onPress={async () => {
                  const locationName = await getLocationName(mapCenter.latitude, mapCenter.longitude);
                  const newLocation = {
                    name: locationName.split(',')[0],
                    address: locationName,
                    coordinates: {
                      latitude: mapCenter.latitude,
                      longitude: mapCenter.longitude
                    }
                  };

                  if (mapType === 'pickup') {
                    setTransactionData(prev => ({
                      ...prev,
                      pickupPoint: newLocation
                    }));
                  } else {
                    setTransactionData(prev => ({
                      ...prev,
                      dropoffPoint: newLocation
                    }));
                  }

                  setSelectedLocation(newLocation);
                  setShowMapModal(false);
                }}
              >
                <Text style={styles.selectPointButtonText}>Select point</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Search Modal */}
        <Modal
          visible={showSearchModal}
          animationType="slide"
          onRequestClose={() => setShowSearchModal(false)}
        >
          <SafeAreaView style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <TouchableOpacity
                style={styles.searchBackButton}
                onPress={() => setShowSearchModal(false)}
              >
                <Icon name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari lokasi..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchLocations(text);
                }}
                autoFocus
              />
            </View>

            {searchLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#26d0ce" />
                <Text style={styles.loadingText}>Mencari lokasi...</Text>
              </View>
            )}

            {searchResults.length === 0 && searchQuery.length >= 3 && !searchLoading && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>Tidak ada hasil ditemukan</Text>
              </View>
            )}

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderSearchItem}
              style={styles.searchResults}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: 300,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  pickupIcon: {
    backgroundColor: '#007bff',
  },
  dropoffIcon: {
    backgroundColor: '#28a745',
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  transactionSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: '#26d0ce',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  searchLocationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    flex: 1,
  },
  mapBottom: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedLocationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  getCurrentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#26d0ce',
    marginBottom: 15,
  },
  getCurrentLocationButtonDisabled: {
    opacity: 0.6,
  },
  getCurrentLocationText: {
    color: '#26d0ce',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  selectPointButton: {
    backgroundColor: '#26d0ce',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectPointButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBackButton: {
    padding: 8,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultText: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  searchResultAddress: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
});

export default GaspolDelivery;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';

const OrderDetailPage = ({ navigation, route }) => {
  const { pickupData, dropoffData } = route.params || {};
  
  // Form states
  const [selectedItemType, setSelectedItemType] = useState('');
  const [selectedVehicleOption, setSelectedVehicleOption] = useState('');
  const [notes, setNotes] = useState('');
  const [itemPhotos, setItemPhotos] = useState([]);
  const [distance, setDistance] = useState(0);
  const [vehiclePrices, setVehiclePrices] = useState({});

  // Fungsi menghitung jarak menggunakan Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius bumi dalam km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const toRad = (value) => {
    return (value * Math.PI) / 180;
  };

  // Hitung harga berdasarkan jarak
  const calculatePrices = (distanceKm) => {
    const pricingRules = {
      motor: {
        base: 10000,
        perKm: 2500,
        maxWeight: 20,
      },
      mobil_mpv: {
        base: 15000,
        perKm: 4000,
        maxWeight: 500,
      },
      pickup: {
        base: 20000,
        perKm: 5000,
        maxWeight: 800,
      },
      truk: {
        base: 30000,
        perKm: 7000,
        maxWeight: 2000,
      },
    };

    const prices = {};
    Object.keys(pricingRules).forEach((vehicle) => {
      const rule = pricingRules[vehicle];
      const totalPrice = rule.base + (distanceKm * rule.perKm);
      prices[vehicle] = Math.round(totalPrice);
    });

    return prices;
  };

  useEffect(() => {
    if (pickupData?.pickupPoint?.coordinates && dropoffData?.dropoffPoint?.coordinates) {
      const pickup = pickupData.pickupPoint.coordinates;
      const dropoff = dropoffData.dropoffPoint.coordinates;
      
      const calculatedDistance = calculateDistance(
        pickup.latitude,
        pickup.longitude,
        dropoff.latitude,
        dropoff.longitude
      );
      
      setDistance(calculatedDistance);
      const prices = calculatePrices(calculatedDistance);
      setVehiclePrices(prices);

      console.log('Jarak:', calculatedDistance.toFixed(2), 'km');
      console.log('Harga per kendaraan:', prices);
    }
  }, [pickupData, dropoffData]);

  const formatPrice = (price) => {
    return `Rp ${price?.toLocaleString('id-ID') || '0'}`;
  };

  // Jenis barang untuk membantu driver prepare
  const itemTypes = [
    {
      id: 'document',
      title: 'Dokumen',
      subtitle: 'Surat, berkas, paket kecil',
      icon: 'file-document',
    },
    {
      id: 'food',
      title: 'Makanan',
      subtitle: 'Makanan, minuman, snack',
      icon: 'food',
    },
    {
      id: 'electronics',
      title: 'Elektronik',
      subtitle: 'HP, laptop, peralatan elektronik',
      icon: 'laptop',
    },
    {
      id: 'furniture',
      title: 'Furniture',
      subtitle: 'Meja, kursi, lemari',
      icon: 'sofa',
    },
    {
      id: 'groceries',
      title: 'Belanjaan',
      subtitle: 'Groceries, kebutuhan sehari-hari',
      icon: 'cart',
    },
    {
      id: 'other',
      title: 'Lainnya',
      subtitle: 'Barang lain yang tidak terkategori',
      icon: 'package-variant',
    },
  ];

  const vehicleOptions = [
    {
      id: 'motor',
      title: 'Motor',
      subtitle: 'Paket kecil, dokumen, makanan',
      capacity: 'Max 20 Kg',
      icon: 'motorbike',
      estimatedTime: '15-25 min'
    },
    {
      id: 'mobil_mpv',
      title: 'Mobil MPV',
      subtitle: 'Paket sedang hingga besar',
      capacity: 'Max 500 Kg',
      icon: 'car-hatchback',
      estimatedTime: '20-30 min'
    },
    {
      id: 'pickup',
      title: 'Pickup',
      subtitle: 'Barang besar, furniture, elektronik',
      capacity: 'Max 800 Kg',
      icon: 'truck-flatbed',
      estimatedTime: '25-35 min'
    },
    {
      id: 'truk',
      title: 'Truk',
      subtitle: 'Kargo besar, pindahan, kiriman banyak',
      capacity: 'Max 2 Ton',
      icon: 'truck',
      estimatedTime: '30-45 min'
    }
  ];

  const handleImagePicker = () => {
    if (itemPhotos.length >= 3) {
      Alert.alert('Maksimal 3 Foto', 'Anda hanya bisa upload maksimal 3 foto');
      return;
    }

    launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        setItemPhotos([...itemPhotos, response.assets[0]]);
      }
    });
  };

  const removePhoto = (index) => {
    const newPhotos = itemPhotos.filter((_, i) => i !== index);
    setItemPhotos(newPhotos);
  };

  const validateForm = () => {
    if (!selectedItemType) {
      Alert.alert('Error', 'Jenis barang harus dipilih');
      return false;
    }
    if (!selectedVehicleOption) {
      Alert.alert('Error', 'Opsi kendaraan harus dipilih');
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      const selectedVehicle = vehicleOptions.find(v => v.id === selectedVehicleOption);
      const selectedItem = itemTypes.find(i => i.id === selectedItemType);
      
      const detailData = {
        selectedItemType,
        selectedVehicleOption,
        notes,
        itemPhotos,
        distance: distance.toFixed(2),
        price: vehiclePrices[selectedVehicleOption],
        vehicleDetails: selectedVehicle,
        itemDetails: selectedItem,
      };
      
      navigation.navigate('OrderPaymentPage', {
        pickupData,
        dropoffData,
        detailData,
      });
    }
  };

  const steps = ['Pickup', 'Drop-off', 'Details', 'Pembayaran'];
  const currentStep = 2;

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <Text
            style={[
              styles.stepText,
              index === currentStep && styles.activeStepText,
              index < currentStep && styles.completedStepText,
            ]}
          >
            {step}
          </Text>
          <View
            style={[
              styles.stepIndicator,
              index === currentStep && styles.activeStep,
              index < currentStep && styles.completedStep,
            ]}
          />
        </View>
      ))}
    </View>
  );

  const renderDistanceInfo = () => (
    <View style={styles.distanceInfoCard}>
      <Icon name="map-marker-distance" size={20} color="#26d0ce" />
      <Text style={styles.distanceText}>
        Jarak: <Text style={styles.distanceBold}>{distance.toFixed(2)} km</Text>
      </Text>
    </View>
  );

  const renderItemTypeSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>
        Jenis Barang <Text style={styles.required}>*</Text>
      </Text>
      <Text style={styles.sectionSubtitle}>Pilih kategori barang yang akan dikirim</Text>
      
      <View style={styles.itemTypeGrid}>
        {itemTypes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.itemTypeCard,
              selectedItemType === item.id && styles.itemTypeCardSelected
            ]}
            onPress={() => setSelectedItemType(item.id)}
          >
            <View style={[
              styles.itemTypeIconContainer,
              selectedItemType === item.id && styles.itemTypeIconContainerSelected
            ]}>
              <Icon 
                name={item.icon} 
                size={28} 
                color={selectedItemType === item.id ? '#26d0ce' : '#666'} 
              />
            </View>
            <Text style={[
              styles.itemTypeTitle,
              selectedItemType === item.id && styles.itemTypeTitleSelected
            ]}>
              {item.title}
            </Text>
            <Text style={styles.itemTypeSubtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
            
            {selectedItemType === item.id && (
              <View style={styles.selectedBadge}>
                <Icon name="check-circle" size={18} color="#26d0ce" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderNotesSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Catatan Tambahan</Text>
      <Text style={styles.sectionSubtitle}>Jelaskan detail barang (opsional)</Text>
      
      <TextInput
        style={styles.notesInput}
        placeholder="Contoh: Barang mudah pecah, harap hati-hati"
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        value={notes}
        onChangeText={setNotes}
        textAlignVertical="top"
      />
    </View>
  );

  const renderPhotoSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Foto Barang</Text>
      <Text style={styles.sectionSubtitle}>Upload foto untuk membantu driver (maks. 3 foto)</Text>
      
      <View style={styles.photoContainer}>
        {itemPhotos.map((photo, index) => (
          <View key={index} style={styles.photoItem}>
            <Image source={{ uri: photo.uri }} style={styles.photoImage} />
            <TouchableOpacity 
              style={styles.removePhotoButton}
              onPress={() => removePhoto(index)}
            >
              <Icon name="close-circle" size={24} color="#ff4757" />
            </TouchableOpacity>
          </View>
        ))}
        
        {itemPhotos.length < 3 && (
          <TouchableOpacity 
            style={styles.uploadPhotoButton}
            onPress={handleImagePicker}
          >
            <Icon name="camera-plus" size={32} color="#999" />
            <Text style={styles.uploadPhotoText}>Upload Foto</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderVehicleSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>
        Pilih Kendaraan <Text style={styles.required}>*</Text>
      </Text>
      <Text style={styles.sectionSubtitle}>Harga berdasarkan jarak {distance.toFixed(2)} km</Text>
      
      {vehicleOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.vehicleCard,
            selectedVehicleOption === option.id && styles.vehicleCardSelected
          ]}
          onPress={() => setSelectedVehicleOption(option.id)}
        >
          <View style={styles.vehicleLeft}>
            <View style={[
              styles.vehicleIconCircle,
              selectedVehicleOption === option.id && styles.vehicleIconCircleSelected
            ]}>
              <Icon 
                name={option.icon} 
                size={28} 
                color={selectedVehicleOption === option.id ? '#26d0ce' : '#666'} 
              />
            </View>
            
            <View style={styles.vehicleInfo}>
              <Text style={[
                styles.vehicleTitle,
                selectedVehicleOption === option.id && styles.vehicleTitleSelected
              ]}>
                {option.title}
              </Text>
              <Text style={styles.vehicleSubtitle}>{option.subtitle}</Text>
              <View style={styles.vehicleMetaRow}>
                <Icon name="weight" size={14} color="#999" />
                <Text style={styles.vehicleMetaText}>{option.capacity}</Text>
                <Icon name="clock-outline" size={14} color="#999" style={styles.metaIcon} />
                <Text style={styles.vehicleMetaText}>{option.estimatedTime}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.vehicleRight}>
            <Text style={[
              styles.vehiclePrice,
              selectedVehicleOption === option.id && styles.vehiclePriceSelected
            ]}>
              {formatPrice(vehiclePrices[option.id])}
            </Text>
            {selectedVehicleOption === option.id && (
              <View style={styles.selectedCheck}>
                <Icon name="check-circle" size={20} color="#26d0ce" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Baru Gaspol</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Form Content */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.formContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderDistanceInfo()}
          {renderItemTypeSection()}
          {renderNotesSection()}
          {/* {renderPhotoSection()} */}
          {renderVehicleSection()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total Biaya:</Text>
          <Text style={styles.totalPrice}>
            {selectedVehicleOption 
              ? formatPrice(vehiclePrices[selectedVehicleOption])
              : 'Rp 0'
            }
          </Text>
        </View>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderDetailPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },

  // Step indicator styles
  stepContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  activeStepText: {
    color: '#26d0ce',
    fontWeight: '600',
  },
  completedStepText: {
    color: '#26d0ce',
  },
  stepIndicator: {
    height: 3,
    width: '100%',
    backgroundColor: '#eee',
    borderRadius: 2,
  },
  activeStep: {
    backgroundColor: '#26d0ce',
  },
  completedStep: {
    backgroundColor: '#26d0ce',
  },

  // Content styles
  content: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },

  // Distance Info Card
  distanceInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f9f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#26d0ce',
  },
  distanceText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  distanceBold: {
    fontWeight: '700',
    color: '#26d0ce',
  },
  
  // Section styles
  sectionContainer: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  required: {
    color: '#ff4757',
  },

  // Item Type Styles
  itemTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemTypeCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#eee',
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    minHeight: 130,
  },
  itemTypeCardSelected: {
    borderColor: '#26d0ce',
    backgroundColor: '#f0fffe',
  },
  itemTypeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTypeIconContainerSelected: {
    backgroundColor: '#e6f9f8',
  },
  itemTypeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  itemTypeTitleSelected: {
    color: '#26d0ce',
  },
  itemTypeSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Notes Input
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 16,
    fontSize: 15,
    color: '#333',
    minHeight: 100,
  },

  // Photo Section
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoItem: {
    width: 100,
    height: 100,
    marginRight: 12,
    marginBottom: 12,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  uploadPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPhotoText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  // Vehicle Card Styles
  vehicleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#eee',
    padding: 16,
    marginBottom: 12,
  },
  vehicleCardSelected: {
    borderColor: '#26d0ce',
    backgroundColor: '#f0fffe',
  },
  vehicleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleIconCircleSelected: {
    backgroundColor: '#e6f9f8',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  vehicleTitleSelected: {
    color: '#26d0ce',
  },
  vehicleSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  vehicleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleMetaText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  metaIcon: {
    marginLeft: 12,
  },
  vehicleRight: {
    alignItems: 'flex-end',
  },
  vehiclePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  vehiclePriceSelected: {
    color: '#26d0ce',
  },
  selectedCheck: {
    marginTop: 4,
  },

  // Bottom button styles
  bottomContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#26d0ce',
  },
  continueButton: {
    backgroundColor: '#26d0ce',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
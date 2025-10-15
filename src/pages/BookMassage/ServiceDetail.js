import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, SafeAreaView } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { API_URL } from '../../context/APIUrl';

const ServiceDetail = ({ route, navigation }) => {
  const { colors } = useTheme();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get service ID from route params or use a default
  const serviceId = route.params?.service?.id || route.params?.serviceId || 1;

  useEffect(() => {
    // Fetch service details with variants
    const fetchServiceDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/services/${serviceId}/variants`);
        
        if (response.data.success && response.data.data) {
          setServiceData(response.data.data);
          if (response.data.data.variants && response.data.data.variants.length > 0) {
            setVariants(response.data.data.variants);
            // Set first variant as default selected
            setSelectedVariant(response.data.data.variants[0]);
          }
        } else {
          setError('Could not load service details');
        }
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Error loading service details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

  // Handle duration selection
  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
  };

  // Format price to IDR
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Get category icon based on service category
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'massage':
        return 'spa';
      case 'beauty care':
        return 'face-woman';
      case 'therapy':
        return 'heart-pulse';
      default:
        return 'hand-heart';
    }
  };

  // Get category color based on service category
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'massage':
        return ['#2ABCB4', '#20A39E'];
      case 'beauty care':
        return ['#FF6B9D', '#FF4081'];
      case 'therapy':
        return ['#9C27B0', '#673AB7'];
      default:
        return ['#2ABCB4', '#20A39E'];
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ABCB4" />
        <Text style={styles.loadingText}>Memuat detail layanan...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={60} color="#FF4081" />
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          style={styles.errorButton} 
          onPress={() => navigation.goBack()}
        >
          Kembali
        </Button>
      </View>
    );
  }

  const categoryColors = getCategoryColor(serviceData?.kategori);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2ABCB4" barStyle="light-content" />
      
      {/* Beautiful Header with Gradient */}
      <LinearGradient
        colors={categoryColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}
      >
        {/* Header Controls */}
        <View style={styles.headerControls}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Detail Layanan</Text>

          <TouchableOpacity style={styles.headerButton}>
            <Icon name="heart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Service Header Info */}
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIconContainer}>
            <Icon 
              name={getCategoryIcon(serviceData?.kategori)} 
              size={40} 
              color="#fff" 
            />
          </View>
          
          <View style={styles.serviceHeaderInfo}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {serviceData?.kategori || 'Layanan'}
              </Text>
            </View>
            
            <Text style={styles.serviceTitle}>
              {serviceData?.nama_layanan || 'Layanan Massage'}
            </Text>
            
            <View style={styles.ratingContainer}>
              <Icon name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>5.0</Text>
              <Text style={styles.reviewCount}>(453 ulasan)</Text>
            </View>
          </View>
        </View>

        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="information-outline" size={24} color="#2ABCB4" />
            <Text style={styles.sectionTitle}>Deskripsi Layanan</Text>
          </View>
          
          <Text style={styles.descriptionText}>
            {serviceData?.deskripsi || 'Nikmati pengalaman relaksasi terbaik dengan layanan massage profesional kami. Terapis berpengalaman siap memberikan perawatan terbaik untuk kesehatan dan kenyamanan Anda.'}
          </Text>
        </View>

        {/* Duration Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="clock-outline" size={24} color="#2ABCB4" />
            <Text style={styles.sectionTitle}>Pilih Paket Durasi</Text>
          </View>
          
          {variants.length > 0 ? (
            <View style={styles.variantContainer}>
              {variants.map((variant, index) => (
                <TouchableOpacity
                  key={variant.id}
                  onPress={() => handleSelectVariant(variant)}
                  style={[
                    styles.variantCard,
                    selectedVariant?.id === variant.id && styles.variantCardSelected
                  ]}
                >
                  <LinearGradient
                    colors={selectedVariant?.id === variant.id 
                      ? categoryColors 
                      : ['#F8F9FA', '#F8F9FA']
                    }
                    style={styles.variantGradient}
                  >
                    <View style={styles.variantContent}>
                      <View style={styles.variantHeader}>
                        <Text style={[
                          styles.variantDuration,
                          selectedVariant?.id === variant.id && styles.variantTextSelected
                        ]}>
                          {variant.durasi_menit} Menit
                        </Text>
                        {selectedVariant?.id === variant.id && (
                          <Icon name="check-circle" size={20} color="#fff" />
                        )}
                      </View>
                      
                      <Text style={[
                        styles.variantPrice,
                        selectedVariant?.id === variant.id && styles.variantTextSelected
                      ]}>
                        {formatPrice(variant.harga_dasar)}
                      </Text>
                      
                      {variant.deskripsi_variant && (
                        <Text style={[
                          styles.variantDescription,
                          selectedVariant?.id === variant.id && styles.variantDescriptionSelected
                        ]}>
                          {variant.deskripsi_variant}
                        </Text>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noVariantsContainer}>
              <Icon name="package-variant" size={40} color="#ccc" />
              <Text style={styles.noVariantsText}>
                Tidak ada paket durasi tersedia
              </Text>
            </View>
          )}
        </View>

        {/* Benefits Section */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="heart-pulse" size={24} color="#2ABCB4" />
            <Text style={styles.sectionTitle}>Manfaat Layanan</Text>
          </View>
          
          <View style={styles.benefitsContainer}>
            {[
              'Meredakan ketegangan otot',
              'Meningkatkan sirkulasi darah',
              'Mengurangi stress dan kecemasan',
              'Meningkatkan kualitas tidur'
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View> */}

        {/* Additional Info */}
        {selectedVariant && (
          <View style={styles.section}>
            <View style={styles.selectedPackageInfo}>
              <LinearGradient
                colors={['rgba(42, 188, 180, 0.1)', 'rgba(32, 163, 158, 0.1)']}
                style={styles.packageInfoGradient}
              >
                <View style={styles.packageInfoHeader}>
                  <Icon name="package-variant-closed" size={24} color="#2ABCB4" />
                  <Text style={styles.packageInfoTitle}>Paket Terpilih</Text>
                </View>
                
                <Text style={styles.packageInfoDuration}>
                  {selectedVariant.durasi_menit} Menit - {formatPrice(selectedVariant.harga_dasar)}
                </Text>
                
                <Text style={styles.packageInfoDescription}>
                  {selectedVariant.deskripsi_variant || 
                   `Nikmati sesi ${selectedVariant.durasi_menit} menit yang menyegarkan dan menenangkan. Terapis profesional akan memberikan pelayanan terbaik untuk relaksasi sempurna Anda.`}
                </Text>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Extra padding at bottom */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => navigation.push('JadwalkanScreen', { 
            service: serviceData,
            selectedVariant: selectedVariant
          })}
          style={styles.scheduleButton}
        >
          <Icon name="calendar-clock" size={24} color="#2ABCB4" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookButton, !selectedVariant && styles.bookButtonDisabled]}
          onPress={() => navigation.push('BookingConfirmation', {
            service: serviceData,
            selectedVariant: selectedVariant
          })}
          disabled={!selectedVariant}
        >
          <LinearGradient
            colors={!selectedVariant ? ['#ccc', '#ccc'] : categoryColors}
            style={styles.bookButtonGradient}
          >
            <Icon name="calendar-check" size={20} color="#fff" />
            <Text style={styles.bookButtonText}>
              Pesan Sekarang
            </Text>
            <Text style={styles.bookButtonPrice}>
              {selectedVariant ? formatPrice(selectedVariant.harga_dasar) : '-'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  errorButton: {
    backgroundColor: '#2ABCB4',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  serviceHeaderInfo: {
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  reviewCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginLeft: 5,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -30,
    right: -30,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    bottom: 10,
    left: -20,
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 25,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#5D6D7E',
    lineHeight: 24,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  variantContainer: {
    gap: 12,
  },
  variantCard: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  variantCardSelected: {
    elevation: 6,
    shadowOpacity: 0.2,
  },
  variantGradient: {
    padding: 20,
  },
  variantContent: {
    // No additional styles needed, content flows naturally
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  variantDuration: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  variantTextSelected: {
    color: '#fff',
  },
  variantPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2ABCB4',
    marginBottom: 8,
  },
  variantDescription: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 20,
  },
  variantDescriptionSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  noVariantsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  noVariantsText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  benefitsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  selectedPackageInfo: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  packageInfoGradient: {
    padding: 20,
  },
  packageInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  packageInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ABCB4',
    marginLeft: 10,
  },
  packageInfoDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  packageInfoDescription: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    gap: 15,
  },
  scheduleButton: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#2ABCB4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  bookButtonPrice: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
};

export default ServiceDetail
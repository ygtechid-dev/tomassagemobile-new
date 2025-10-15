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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const OrderPaymentPage = ({ navigation, route }) => {
  const { pickupData, dropoffData, detailData } = route.params || {};
  
  // Form states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('tunai');
  const [selectedVoucher, setSelectedVoucher] = useState('');
  const [adminFee] = useState(3000);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Calculate total amount
    const deliveryFee = detailData?.price || 0;
    const total = deliveryFee + adminFee;
    setTotalAmount(total);
  }, [detailData, adminFee]);

  const formatPrice = (price) => {
    return `Rp ${price?.toLocaleString('id-ID') || '0'}`;
  };

  const validateForm = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Metode pembayaran harus dipilih');
      return false;
    }
    return true;
  };

  const handleOrder = () => {
    if (validateForm()) {
      Alert.alert(
        'Konfirmasi Order',
        'Apakah Anda yakin ingin melanjutkan order ini?',
        [
          { text: 'Batal', style: 'cancel' },
          { 
            text: 'Ya, Order', 
            onPress: () => {
              // Process order
              console.log('Order Data:', {
                pickupData,
                dropoffData,
                detailData,
                paymentMethod: selectedPaymentMethod,
                totalAmount,
              });
             navigation.navigate('DriverSearchScreen', {
  pickupData,
  dropoffData,
  detailData,
});
             
            }
          }
        ]
      );
    }
  };

  const steps = ['Pickup', 'Drop-off', 'Details', 'Pembayaran'];
  const currentStep = 3;

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

  const renderLocationSection = () => (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <Icon name="map-marker-outline" size={20} color="#26d0ce" />
        <Text style={styles.locationHeaderText}>Rute Pengiriman</Text>
      </View>

      <View style={styles.locationItem}>
        <View style={styles.locationDot} style={[styles.locationDot, { backgroundColor: '#26d0ce' }]} />
        <View style={styles.locationContent}>
          <Text style={styles.locationLabel}>Pickup</Text>
          <Text style={styles.locationName}>{pickupData?.pickupPoint?.name || 'Lokasi Pickup'}</Text>
          <Text style={styles.locationAddress}>
            {pickupData?.pickupPoint?.address || 'Alamat tidak tersedia'}
          </Text>
          <View style={styles.contactInfo}>
            <Icon name="account" size={14} color="#666" />
            <Text style={styles.contactText}>{pickupData?.senderName || '-'}</Text>
            <Icon name="phone" size={14} color="#666" style={styles.contactIcon} />
            <Text style={styles.contactText}>{pickupData?.senderPhone || '-'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.locationDivider} />

      <View style={styles.locationItem}>
        <View style={styles.locationDot} style={[styles.locationDot, { backgroundColor: '#ff4757' }]} />
        <View style={styles.locationContent}>
          <Text style={styles.locationLabel}>Drop-off</Text>
          <Text style={styles.locationName}>{dropoffData?.dropoffPoint?.name || 'Lokasi Drop-off'}</Text>
          <Text style={styles.locationAddress}>
            {dropoffData?.dropoffPoint?.address || 'Alamat tidak tersedia'}
          </Text>
          <View style={styles.contactInfo}>
            <Icon name="account" size={14} color="#666" />
            <Text style={styles.contactText}>{dropoffData?.receiverName || '-'}</Text>
            <Icon name="phone" size={14} color="#666" style={styles.contactIcon} />
            <Text style={styles.contactText}>{dropoffData?.receiverPhone || '-'}</Text>
          </View>
        </View>
      </View>

      {detailData?.distance && (
        <View style={styles.distanceInfo}>
          <Icon name="map-marker-distance" size={16} color="#26d0ce" />
          <Text style={styles.distanceText}>Jarak: {detailData.distance} km</Text>
        </View>
      )}
    </View>
  );

  const renderOrderDetails = () => (
    <View style={styles.detailCard}>
      <Text style={styles.cardTitle}>Detail Pesanan</Text>

      {/* Jenis Barang */}
      <View style={styles.detailRow}>
        <View style={styles.detailLeft}>
          <Icon name={detailData?.itemDetails?.icon || 'package'} size={24} color="#666" />
        </View>
        <View style={styles.detailRight}>
          <Text style={styles.detailLabel}>Jenis Barang</Text>
          <Text style={styles.detailValue}>{detailData?.itemDetails?.title || 'Tidak dipilih'}</Text>
          <Text style={styles.detailSubValue}>{detailData?.itemDetails?.subtitle || ''}</Text>
        </View>
      </View>

      {/* Kendaraan */}
      <View style={styles.detailRow}>
        <View style={styles.detailLeft}>
          <Icon name={detailData?.vehicleDetails?.icon || 'motorbike'} size={24} color="#666" />
        </View>
        <View style={styles.detailRight}>
          <Text style={styles.detailLabel}>Kendaraan</Text>
          <Text style={styles.detailValue}>{detailData?.vehicleDetails?.title || 'Motor'}</Text>
          <Text style={styles.detailSubValue}>
            {detailData?.vehicleDetails?.capacity || 'Max 20 Kg'} • {detailData?.vehicleDetails?.estimatedTime || '15-25 min'}
          </Text>
        </View>
      </View>

      {/* Waktu Pickup - Fixed to "Sekarang" */}
      <View style={styles.detailRow}>
        <View style={styles.detailLeft}>
          <Icon name="clock-outline" size={24} color="#666" />
        </View>
        <View style={styles.detailRight}>
          <Text style={styles.detailLabel}>Waktu Pickup</Text>
          <Text style={styles.detailValue}>Sekarang</Text>
          <Text style={styles.detailSubValue}>Driver akan segera dicari</Text>
        </View>
      </View>

      {/* Catatan jika ada */}
      {detailData?.notes && detailData.notes.trim() !== '' && (
        <View style={styles.notesSection}>
          <Text style={styles.detailLabel}>Catatan Tambahan</Text>
          <Text style={styles.notesText}>{detailData.notes}</Text>
        </View>
      )}

      {/* Foto jika ada */}
      {detailData?.itemPhotos && detailData.itemPhotos.length > 0 && (
        <View style={styles.photoSection}>
          <Text style={styles.detailLabel}>Foto Barang</Text>
          <View style={styles.photoGrid}>
            {detailData.itemPhotos.map((photo, index) => (
              <Image 
                key={index}
                source={{ uri: photo.uri }} 
                style={styles.photoThumbnail} 
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderPaymentMethod = () => (
    <View style={styles.detailCard}>
      <Text style={styles.cardTitle}>Metode Pembayaran</Text>
      
      <TouchableOpacity
        style={styles.paymentOption}
        onPress={() => setSelectedPaymentMethod('tunai')}
      >
        <View style={styles.paymentLeft}>
          <Icon name="cash" size={24} color="#666" />
          <Text style={styles.paymentText}>Tunai</Text>
        </View>
        <View style={styles.radioButton}>
          {selectedPaymentMethod === 'tunai' && (
            <View style={styles.radioSelected} />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.paymentNote}>
        <Icon name="information-outline" size={16} color="#999" />
        <Text style={styles.paymentNoteText}>
          Saat ini hanya tersedia pembayaran tunai
        </Text>
      </View>
    </View>
  );

  const renderVoucher = () => (
    <View style={styles.detailCard}>
      <Text style={styles.cardTitle}>Voucher</Text>
      
      <TouchableOpacity
        style={styles.voucherButton}
        onPress={() => {
          Alert.alert('Info', 'Tidak ada voucher tersedia saat ini');
        }}
      >
        <View style={styles.voucherLeft}>
          <Icon name="ticket-percent" size={24} color="#999" />
          <Text style={[styles.voucherText, styles.placeholderText]}>
            Pilih atau masukkan kode voucher
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color="#999" />
      </TouchableOpacity>
    </View>
  );

  const renderCostBreakdown = () => (
    <View style={styles.costCard}>
      <Text style={styles.cardTitle}>Rincian Biaya</Text>
      
      <View style={styles.costItem}>
        <Text style={styles.costLabel}>Ongkos Kirim ({detailData?.distance || '0'} km)</Text>
        <Text style={styles.costValue}>{formatPrice(detailData?.price || 0)}</Text>
      </View>
      
      <View style={styles.costItem}>
        <Text style={styles.costLabel}>Biaya Admin</Text>
        <Text style={styles.costValue}>{formatPrice(adminFee)}</Text>
      </View>
      
      <View style={styles.costDivider} />
      
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total Bayar</Text>
        <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
      </View>
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
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Konfirmasi Pesanan</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.formContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderLocationSection()}
          {renderOrderDetails()}
          {renderPaymentMethod()}
          {renderVoucher()}
          {renderCostBreakdown()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomPriceRow}>
          <Text style={styles.bottomLabel}>Total Bayar</Text>
          <Text style={styles.bottomPrice}>{formatPrice(totalAmount)}</Text>
        </View>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrder}>
          <Text style={styles.orderButtonText}>Konfirmasi & Order</Text>
        </TouchableOpacity>
        <Text style={styles.bottomNote}>
          Kami akan memilih driver terdekat dengan lokasi Anda
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default OrderPaymentPage;

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
    fontWeight: '700',
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

  // Card styles
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  costCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  // Location styles
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  locationItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  contactIcon: {
    marginLeft: 12,
  },
  locationDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f9f8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#26d0ce',
    fontWeight: '600',
    marginLeft: 8,
  },

  // Detail Row styles
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailLeft: {
    width: 40,
    alignItems: 'center',
    paddingTop: 2,
  },
  detailRight: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  detailSubValue: {
    fontSize: 13,
    color: '#666',
  },

  // Notes section
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },

  // Photo section
  photoSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  photoGrid: {
    flexDirection: 'row',
    marginTop: 8,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },

  // Payment styles
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#26d0ce',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#26d0ce',
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  paymentNoteText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },

  // Voucher styles
  voucherButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  voucherText: {
    fontSize: 14,
    marginLeft: 12,
  },
  placeholderText: {
    color: '#999',
  },

  // Cost breakdown styles
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  costDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#26d0ce',
  },

  // Bottom styles
  bottomContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#26d0ce',
  },
  orderButton: {
    backgroundColor: '#26d0ce',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  bottomNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
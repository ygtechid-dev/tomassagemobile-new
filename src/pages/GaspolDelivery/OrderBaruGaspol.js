import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const OrderBaruGaspol = ({ navigation, route }) => {
  const { pickupPoint, dropoffPoint } = route.params || {};
  
  // Form states
  const [currentStep, setCurrentStep] = useState(0); // 0: Pickup, 1: Drop-off, 2: Detail, 3: Pembayaran
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemWeight, setItemWeight] = useState('');
  const [notes, setNotes] = useState('');

  const steps = ['Pickup', 'Drop-off', 'Detail', 'Pembayaran'];

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Pickup
        if (!senderName.trim() || !senderPhone.trim()) {
          Alert.alert('Error', 'Nama pengirim dan nomor handphone harus diisi');
          return false;
        }
        if (!pickupPoint?.address) {
          Alert.alert('Error', 'Pickup point harus dipilih');
          return false;
        }
        break;
      case 1: // Drop-off
        if (!receiverName.trim() || !receiverPhone.trim()) {
          Alert.alert('Error', 'Nama penerima dan nomor handphone harus diisi');
          return false;
        }
        if (!dropoffPoint?.address) {
          Alert.alert('Error', 'Drop-off point harus dipilih');
          return false;
        }
        break;
      case 2: // Detail
        if (!itemDescription.trim() || !itemWeight.trim()) {
          Alert.alert('Error', 'Deskripsi barang dan berat harus diisi');
          return false;
        }
        break;
    }
    return true;
  };

const handleContinue = () => {
  // Validasi form pickup
  if (!senderName.trim() || !senderPhone.trim()) {
    Alert.alert('Error', 'Nama pengirim dan nomor handphone harus diisi');
    return;
  }
  if (!pickupPoint?.address) {
    Alert.alert('Error', 'Pickup point harus dipilih');
    return;
  }

  // Navigate ke Drop-off page dengan data pickup DAN dropoffPoint
  const pickupData = {
    senderName,
    senderPhone,
    pickupPoint,
  };
  
  navigation.navigate('OrderDropOffPage', { 
    pickupData,
    dropoffPoint // Pass dropoffPoint dari params OrderBaruGaspol
  });
};

  const handleStepPress = (index) => {
    if (index < currentStep) {
      setCurrentStep(index);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {steps.map((step, index) => (
        <TouchableOpacity
          key={index}
          style={styles.stepItem}
          onPress={() => handleStepPress(index)}
          disabled={index > currentStep}
        >
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
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPickupStep = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Informasi Pengirim</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Nama Pengirim <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Icon name="account" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Nama Pengirim"
            value={senderName}
            onChangeText={setSenderName}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Nomor Handphone <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Icon name="phone" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Nomor Handphone"
            value={senderPhone}
            onChangeText={setSenderPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Pickup point <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.locationInput}
          onPress={() => navigation.goBack()}
        >
          <Icon name="map-marker" size={20} color="#999" style={styles.inputIcon} />
          <Text style={[styles.locationText, !pickupPoint?.address && styles.placeholderText]}>
            {pickupPoint?.address || 'Pilih Titik Lokasi Pickup'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderDropoffStep = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Informasi Penerima</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Nama Penerima <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Icon name="account" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Nama Penerima"
            value={receiverName}
            onChangeText={setReceiverName}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Nomor Handphone <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Icon name="phone" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Nomor Handphone"
            value={receiverPhone}
            onChangeText={setReceiverPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Drop-off point <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.locationInput}
          onPress={() => navigation.goBack()}
        >
          <Icon name="map-marker" size={20} color="#999" style={styles.inputIcon} />
          <Text style={[styles.locationText, !dropoffPoint?.address && styles.placeholderText]}>
            {dropoffPoint?.address || 'Pilih Titik Lokasi Drop-off'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderDetailStep = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Detail Barang</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Deskripsi Barang <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Icon name="package-variant" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: Dokumen, Makanan, dll"
            value={itemDescription}
            onChangeText={setItemDescription}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Perkiraan Berat <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Icon name="weight" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Contoh: 1 kg"
            value={itemWeight}
            onChangeText={setItemWeight}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Catatan (Opsional)</Text>
        <View style={styles.inputWrapper}>
          <Icon name="note-text" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Tambahkan catatan khusus..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
            textAlignVertical="top"
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderPembayaranStep = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Ringkasan Order</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Detail Pengiriman</Text>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pengirim:</Text>
          <Text style={styles.summaryValue}>{senderName}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Penerima:</Text>
          <Text style={styles.summaryValue}>{receiverName}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Dari:</Text>
          <Text style={styles.summaryValue} numberOfLines={2}>{pickupPoint?.address}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Ke:</Text>
          <Text style={styles.summaryValue} numberOfLines={2}>{dropoffPoint?.address}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Barang:</Text>
          <Text style={styles.summaryValue}>{itemDescription} ({itemWeight})</Text>
        </View>
        
        {notes ? (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Catatan:</Text>
            <Text style={styles.summaryValue}>{notes}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Estimasi Biaya</Text>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Biaya Pengiriman:</Text>
          <Text style={styles.summaryValue}>Rp 15.000</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Biaya Admin:</Text>
          <Text style={styles.summaryValue}>Rp 1.000</Text>
        </View>
        
        <View style={[styles.summaryItem, styles.totalItem]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>Rp 16.000</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderPickupStep();
      case 1:
        return renderDropoffStep();
      case 2:
        return renderDetailStep();
      case 3:
        return renderPembayaranStep();
      default:
        return renderPickupStep();
    }
  };

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
        {renderCurrentStep()}
      </KeyboardAvoidingView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>
            {currentStep === steps.length - 1 ? 'Buat Order' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderBaruGaspol;

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
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  activeStepText: {
    color: '#26d0ce',
    fontWeight: 'bold',
  },
  completedStepText: {
    color: '#26d0ce',
  },
  stepIndicator: {
    height: 4,
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },

  // Input styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#ff4757',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  multilineInput: {
    paddingVertical: 12,
    minHeight: 80,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },

  // Summary styles
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#26d0ce',
    flex: 2,
    textAlign: 'right',
  },

  // Bottom button styles
  bottomContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  continueButton: {
    backgroundColor: '#26d0ce',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
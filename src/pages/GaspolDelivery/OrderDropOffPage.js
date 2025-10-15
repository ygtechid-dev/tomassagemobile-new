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

const OrderDropOffPage = ({ navigation, route }) => {
  const { pickupData, dropoffPoint: initialDropoffPoint } = route.params || {};
  
  // Form states
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [dropoffPoint, setDropoffPoint] = useState(initialDropoffPoint || null);

  const handleLocationSelect = () => {
    // Navigate to map selection for drop-off point
    navigation.navigate('MapSelection', {
      type: 'dropoff',
      returnScreen: 'OrderDropOff',
    });
  };

  const validateForm = () => {
    if (!receiverName.trim()) {
      Alert.alert('Error', 'Nama penerima harus diisi');
      return false;
    }
    if (!receiverPhone.trim()) {
      Alert.alert('Error', 'Nomor handphone harus diisi');
      return false;
    }
    if (!dropoffPoint) {
      Alert.alert('Error', 'Drop-off point harus dipilih');
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Navigate to next step (Details)
      navigation.navigate('OrderDetailPage', {
        pickupData,
        dropoffData: {
          receiverName,
          receiverPhone,
          dropoffPoint,
        },
      });
    }
  };

  const steps = ['Pickup', 'Drop-off', 'Details', 'Pembayaran'];
  const currentStep = 1; // Drop-off step

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
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Informasi Penerima</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Nama Penerima <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="account" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Nama Pengirim"
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
              onPress={handleLocationSelect}
            >
              <Icon name="map-marker" size={20} color="#999" style={styles.inputIcon} />
              <Text style={[styles.locationText, !dropoffPoint && styles.placeholderText]}>
                {dropoffPoint?.address || 'Pilih Titik Lokasi Drop Off'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderDropOffPage;

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
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },

  // Input styles
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
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
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },

  // Bottom button styles
  bottomContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  continueButton: {
    backgroundColor: '#26d0ce',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#26d0ce',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
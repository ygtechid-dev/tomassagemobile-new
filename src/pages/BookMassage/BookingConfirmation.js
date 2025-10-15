import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { 
  Surface, 
  Text, 
  Avatar, 
  Switch, 
  Button, 
  List,
  Card,
  IconButton,
  TouchableRipple
} from 'react-native-paper';

const BookingConfirmation = ({ route, navigation }) => {
  // Extract service and variant data from route params
  const { service, selectedVariant } = route.params || {};
  
  // Default states for therapist gender selection
  const [maleTherapist, setMaleTherapist] = useState(false);
  const [femaleTherapist, setFemaleTherapist] = useState(true); // Default to female therapist
  
  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate());
  const formattedDate = tomorrow.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Format price to IDR
  const formatPrice = (price) => {
    if (!price) return 'Rp0';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Calculate total price - in a real app, you might have additional fees
  const servicePrice = selectedVariant ? selectedVariant.harga_dasar : (service ? service.harga_dasar : 100000);
  const additionalFees = 0; // No additional fees in this example
  const totalPrice = servicePrice + additionalFees;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Konfirmasi Booking</Text>
      </TouchableOpacity>

      {/* Main Card */}
      <Card style={styles.card}>
        <View style={styles.serviceRow}>
          <Card.Cover
            source={service && service.icon_url ? 
              { uri: service.icon_url } : 
              { uri: 'https://ygtechdev.my.id/files/photo-1740154263678-788610960.png' }}
            style={styles.serviceImage}
          />
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>
              {service ? service.nama_layanan : 'Full Massage Reflexy'}
            </Text>
            <Text style={styles.serviceDescription}>
              {service && service.deskripsi ? 
                service.deskripsi.substring(0, 100) + (service.deskripsi.length > 100 ? '...' : '') : 
                'Rasakan Relaksasi Sempurna Full Body dengan durasi 60 menit'}
            </Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Anda</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Paket</Text>
            <Text>
              {service ? service.nama_layanan : 'Full Body Massage'} {' '}
              {selectedVariant ? selectedVariant.durasi_menit : 60}m
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Tanggal</Text>
            <Text>{formattedDate}</Text>
          </View>
          {selectedVariant && selectedVariant.deskripsi_variant && (
            <View style={styles.variantDescription}>
              <Text style={styles.variantText}>{selectedVariant.deskripsi_variant}</Text>
            </View>
          )}
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Harga</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Harga</Text>
            <Text>{formatPrice(servicePrice)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Tambahan Biaya</Text>
            <Text>{additionalFees > 0 ? formatPrice(additionalFees) : '-'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Total Harga</Text>
            <Text style={styles.totalAmount}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>

        {/* Therapist Gender Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pilih Gender Terapis</Text>
          <View style={styles.genderOption}>
            <View style={styles.genderRow}>
              <Avatar.Icon 
                size={40} 
                icon="human-male"
                style={[styles.genderIcon, maleTherapist ? styles.selectedGenderIcon : null]}
              />
              <Text style={styles.genderText}>Pria</Text>
            </View>
            <Switch
              value={maleTherapist}
              onValueChange={(value) => {
                setMaleTherapist(value);
                if (value && femaleTherapist) {
                  setFemaleTherapist(false);
                }
              }}
              color="#00a699"
            />
          </View>
          <View style={styles.genderOption}>
            <View style={styles.genderRow}>
              <Avatar.Icon 
                size={40} 
                icon="human-female"
                style={[styles.genderIcon, femaleTherapist ? styles.selectedGenderIcon : null]}
              />
              <Text style={styles.genderText}>Wanita</Text>
            </View>
            <Switch
              value={femaleTherapist}
              onValueChange={(value) => {
                setFemaleTherapist(value);
                if (value && maleTherapist) {
                  setMaleTherapist(false);
                }
              }}
              color="#00a699"
            />
          </View>
        </View>

        {/* Payment Method */}
        <TouchableRipple onPress={() => {}}>
          <View style={styles.paymentMethod}>
            <Avatar.Icon 
              size={40} 
              icon="credit-card"
              style={styles.paymentIcon}
            />
            <Text>Bayar di Tempat</Text>
          </View>
        </TouchableRipple>
      </Card>

      {/* Book Now Button */}
      <Button
        mode="contained"
        style={styles.bookButton}
        contentStyle={styles.bookButtonContent}
        onPress={() => navigation.push('LocationSelectScreen', {
          service,
          selectedVariant,
          selectedDate: formattedDate,
          totalPrice,
          therapistGender: maleTherapist ? 'male' : 'female'
        })}
      >
        Pesan Sekarang
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 30
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  card: {
    margin: 16,
    borderRadius: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    padding: 16,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 16,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceDescription: {
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#666',
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#00a699',
  },
  genderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderIcon: {
    backgroundColor: '#e8f5e9',
  },
  selectedGenderIcon: {
    backgroundColor: '#00a699',
  },
  genderText: {
    marginLeft: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentIcon: {
    backgroundColor: '#e3f2fd',
    marginRight: 16,
  },
  bookButton: {
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#00a699',
  },
  bookButtonContent: {
    padding: 8,
  },
  variantDescription: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  variantText: {
    color: '#666',
    fontStyle: 'italic',
  },
});

export default BookingConfirmation;
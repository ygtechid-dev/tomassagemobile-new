import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DropDownPicker from 'react-native-dropdown-picker';

const JadwalkanScreen = ({ navigation }) => {
  // Selected values
  const [selectedPackage, setSelectedPackage] = useState('60 Menit');
  const [selectedDate, setSelectedDate] = useState('December, 20 2024');
  const [selectedTime, setSelectedTime] = useState('11.00 AM');

  // Dropdown open states
  const [packageOpen, setPackageOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  // Sample data for dropdown items
  const [packageItems, setPackageItems] = useState([
    { label: '30 Menit', value: '30 Menit' },
    { label: '45 Menit', value: '45 Menit' },
    { label: '60 Menit', value: '60 Menit' },
    { label: '90 Menit', value: '90 Menit' },
  ]);
  
  const [dateItems, setDateItems] = useState([
    { label: 'December, 19 2024', value: 'December, 19 2024' },
    { label: 'December, 20 2024', value: 'December, 20 2024' },
    { label: 'December, 21 2024', value: 'December, 21 2024' },
    { label: 'December, 22 2024', value: 'December, 22 2024' },
  ]);
  
  const [timeItems, setTimeItems] = useState([
    { label: '09.00 AM', value: '09.00 AM' },
    { label: '10.00 AM', value: '10.00 AM' },
    { label: '11.00 AM', value: '11.00 AM' },
    { label: '01.00 PM', value: '01.00 PM' },
    { label: '02.00 PM', value: '02.00 PM' },
  ]);

  // Control dropdown opening to ensure only one is open at a time
  const onPackageOpen = useCallback(() => {
    setDateOpen(false);
    setTimeOpen(false);
  }, []);

  const onDateOpen = useCallback(() => {
    setPackageOpen(false);
    setTimeOpen(false);
  }, []);

  const onTimeOpen = useCallback(() => {
    setPackageOpen(false);
    setDateOpen(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jadwalkan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Package Selector */}
        <View style={[styles.formGroup, { zIndex: 3000 }]}>
          <Text style={styles.label}>Paket</Text>
          <DropDownPicker
            open={packageOpen}
            value={selectedPackage}
            items={packageItems}
            setOpen={setPackageOpen}
            setValue={setSelectedPackage}
            setItems={setPackageItems}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            zIndex={3000}
            zIndexInverse={1000}
            onOpen={onPackageOpen}
            maxHeight={200}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
          />
        </View>

        {/* Date Selector */}
        <View style={[styles.formGroup, { zIndex: 2000 }]}>
          <Text style={styles.label}>Tanggal</Text>
          <DropDownPicker
            open={dateOpen}
            value={selectedDate}
            items={dateItems}
            setOpen={setDateOpen}
            setValue={setSelectedDate}
            setItems={setDateItems}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            zIndex={2000}
            zIndexInverse={2000}
            onOpen={onDateOpen}
            maxHeight={200}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
          />
        </View>

        {/* Time Selector */}
        <View style={[styles.formGroup, { zIndex: 1000 }]}>
          <Text style={styles.label}>Waktu</Text>
          <DropDownPicker
            open={timeOpen}
            value={selectedTime}
            items={timeItems}
            setOpen={setTimeOpen}
            setValue={setSelectedTime}
            setItems={setTimeItems}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            textStyle={styles.dropdownText}
            zIndex={1000}
            zIndexInverse={3000}
            onOpen={onTimeOpen}
            maxHeight={200}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
          />
        </View>
        
        {/* Add spacing to ensure dropdown content is visible */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          style={styles.continueButton}
          contentStyle={styles.buttonContent}
          onPress={() => navigation.push('BookingConfirmation')}
        >
          <Text style={styles.buttonText}>Lanjutkan</Text>
        </Button>
      </View>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 20
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40, // to balance the header
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100, // Add extra padding at the bottom
  },
  formGroup: {
    marginBottom: 24,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 16,
  },
  dropdownContainer: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
    position: 'absolute',
    width: '100%',
  },
  dropdownText: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  continueButton: {
    backgroundColor: '#14A49C', // Teal color matching your app
    borderRadius: 8,
    paddingVertical: 4,
  },
  buttonContent: {
    height: 50,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  spacer: {
    height: 150, // Extra space at the bottom to prevent content from being hidden behind the footer
  },
});

export default JadwalkanScreen;
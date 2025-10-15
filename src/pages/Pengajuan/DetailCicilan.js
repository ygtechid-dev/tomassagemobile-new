import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, ScrollView } from "react-native";
import { Card, Button, Modal, Portal, Provider, TextInput } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const banks = [
  { name: "Bank BCA", },
  { name: "Bank BSI", },
  { name: "Bank Mandiri",},
  { name: "Bank BNI", },
  { name: "Bank BRI",  },
];

const DetailCicilan = ({ navigation }) => {
  const [selectedBank, setSelectedBank] = useState(null);
  const [amount, setAmount] = useState("1000000");
  const [visible, setVisible] = useState(false);

  const quickAmounts = ["1000000", "10000000", "50000000"];
  const payments = [
    { id: 1, amount: 1280000, dueDate: '15 Februari 2025', status: 'paid' },
    { id: 2, amount: 1280000, dueDate: '15 Maret 2025', status: 'due' },
    { id: 3, amount: 1280000, dueDate: '15 April 2025', status: 'due' },
    { id: 4, amount: 1280000, dueDate: '15 Mei 2025', status: 'due' },
  ];

  const formatRupiah = (value) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

    
  return (
    <Provider>
      <View style={styles.container}>
        <ScrollView>
          {/* Header */}
          <ImageBackground source={require("../../assets/bground.png")} style={styles.headerBackground}>
          <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}  onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cicilan Berjalan</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="magnify" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
          </ImageBackground>

          {/* Card Section */}
          <Card style={styles.card}>
          <Text style={{ color: 'gray', fontWeight: 'bold' }}>PROJECT #5432545</Text>
          {payments.map((payment, index) => (
        <View key={payment.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              {formatRupiah(payment.amount)} ({index + 1}/10)
            </Text>
            <Text style={{ color: 'gray' }}>Jatuh Tempo: {payment.dueDate}</Text>
          </View>
          {payment.status === 'paid' ? (
            <Text style={{ color: '#1EAAA6', fontWeight: 'bold' }}>Sudah Dibayar</Text>
          ) : index === 1 ? (
            <TouchableOpacity  onPress={() => navigation.push('PembayaranCicilan')} style={{ backgroundColor: '#1EAAA6', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Bayar Sekarang</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
          </Card>
        </ScrollView>

        {/* Continue Button */}
        {/* <Button mode="contained" style={styles.continueButton} onPress={() => navigation.push('BankInstruction')}>
          Proses Pembayaran
        </Button> */}

        {/* Modal for Bank Selection */}
        <Portal>
          <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pilih Bank</Text>
            {banks.map((bank, index) => (
              <TouchableOpacity key={index} style={styles.bankItem} onPress={() => { setSelectedBank(bank); setVisible(false); }}>
           
                <Text style={styles.bankText}>{bank.name}</Text>
              </TouchableOpacity>
            ))}
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerBackground: {
    height: 180,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  iconButton: {
    padding: 10,
    borderRadius: 50,
    
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  iconButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    marginTop: -100,
    height:800
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E1E1E",
    marginBottom: 5,
    marginTop: 20
  },
  subtitle: {
    fontSize: 14,
    color: "#A0A0A0",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 10,
    marginTop: 5,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#1EAAA6",
    paddingVertical: 5,
    backgroundColor: 'transparent',
    marginTop: 10,
    textAlign: "center",
    color: "#333",
  },
  dropdownText: {
    fontSize: 14,
    color: "#A0A0A0",
  },
  amountText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  quickAmountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  quickAmountButton: {
    backgroundColor: "#E8F8F2",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  quickAmountText: {
    color: "#1EAAA6",
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#1EAAA6",
    borderRadius: 30,
    margin: 20,
    paddingVertical: 10,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  bankItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  bankIcon: {
    marginRight: 10,
  },
  bankText: {
    fontSize: 16,
    color: "#333",
  },
});

export default DetailCicilan;

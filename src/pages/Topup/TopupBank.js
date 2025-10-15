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

const TopupBank = ({ navigation }) => {
  const [selectedBank, setSelectedBank] = useState(null);
  const [amount, setAmount] = useState("1000000");
  const [visible, setVisible] = useState(false);

  const quickAmounts = ["1000000", "10000000", "50000000"];


    // Fungsi format angka ke Rupiah
    const formatRupiah = (value) => {
        const number = value.replace(/[^0-9]/g, ""); // Hanya angka
        return number ? `Rp ${parseInt(number).toLocaleString("id-ID")}` : "";
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
          <Text style={styles.headerTitle}>Topup Bank</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="magnify" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
          </ImageBackground>

          {/* Card Section */}
          <Card style={styles.card}>
            <View>
              <Text style={styles.sectionTitle}>Pilih Bank</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setVisible(true)}>
                <Text style={styles.dropdownText}>{selectedBank ? selectedBank.name : "Pilih Bank"}</Text>
                <Icon name="chevron-down" size={20} color="#A0A0A0" />
              </TouchableOpacity>
            </View>

            {/* Amount Section */}
            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>Jumlah Top Up</Text>
              <Text style={styles.subtitle}>Berapa yang akan Anda top-up?</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="Rp 0"
                value={formatRupiah(amount)}
                onChangeText={(text) => setAmount(text)}
              />
              <View style={styles.quickAmountContainer}>
                {quickAmounts.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.quickAmountButton} onPress={() => setAmount(item)}>
                    <Text style={styles.quickAmountText}>{(item / 1000000).toFixed(0)}jt</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        </ScrollView>

        {/* Continue Button */}
        <Button mode="contained" style={styles.continueButton} onPress={() => navigation.push('BankInstruction')}>
          Proses Pembayaran
        </Button>

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

export default TopupBank;

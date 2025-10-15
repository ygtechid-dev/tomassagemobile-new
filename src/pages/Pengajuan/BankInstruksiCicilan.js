import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, FlatList, Image } from "react-native";
import { Card, Button, Modal, Portal, Provider, TextInput, List} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";



const BankInstruksiCicilan = ({ navigation }) => {
  const [selectedBank, setSelectedBank] = useState(null);
  const [amount, setAmount] = useState("1000000");
  const [visible, setVisible] = useState(false);

  const instructions = {
    atm: [
      "Masukkan kartu ATM dan PIN Anda.",
      "Pilih TRANSFER, lalu klik Virtual Account.",
      "Masukkan nomor Virtual Account: 1234 5678 9012 3456.",
      "Masukkan jumlah top-up yang diinginkan.",
      "Ikuti petunjuk selanjutnya untuk menyelesaikan transaksi.",
    ],
    mobile: [
      "Buka aplikasi mobile banking Anda.",
      "Pilih menu TRANSFER, lalu pilih Virtual Account.",
      "Masukkan nomor Virtual Account: 1234 5678 9012 3456.",
      "Masukkan jumlah top-up yang diinginkan.",
      "Konfirmasi transaksi dan masukkan PIN Anda.",
    ],
    internet: [
      "Login ke akun internet banking Anda.",
      "Pilih menu TRANSFER, lalu pilih Virtual Account.",
      "Masukkan nomor Virtual Account: 1234 5678 9012 3456.",
      "Masukkan jumlah top-up yang diinginkan.",
      "Konfirmasi transaksi dan masukkan PIN Anda.",
    ],
  };


  const [expanded, setExpanded] = useState("atm");

  const renderSteps = (steps) =>
    steps.map((step, index) => (
      <View key={index} style={styles.stepContainer}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepText}>{index + 1}</Text>
        </View>
        <Text style={styles.stepDescription}>{step}</Text>
      </View>
    ));


  const banks = [
    { id: "1", name: "BRI", logo: require("../../assets/brilogo.png") },
    { id: "2", name: "BSI", logo: require("../../assets/bsilogo.png") },
    { id: "3", name: "BNI", logo: require("../../assets/bnilogo.png") },
  ];


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
 <View style={styles.containerBank}>
      <Text style={styles.title}>Bank Dipilih</Text>

      <FlatList
        data={banks}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedBank(item.id)}>
            <View
              style={[
                styles.cardBank,
                selectedBank === item.id && styles.selectedCard,
              ]}
            >
              <View style={styles.logoContainer}>
                <Image source={item.logo} style={styles.logo} />
              </View>
              <Text style={[styles.bankName, selectedBank === item.id && styles.selectedText]}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
        
          </ImageBackground>

          {/* Card Section */}
          <Card style={styles.card}>
           <Text style={[styles.title, {
            color: 'black'
           }]}>Petunjuk Pembayaran</Text>
      <Text style={styles.subtitle}>
       Silahkan ikuti petunjuk dibawah ini untuk melakukan pembayaran
      </Text>

      <List.Section>
        <List.Accordion
          title="Top up via ATM"
          expanded={expanded === "atm"}
          onPress={() => setExpanded(expanded === "atm" ? null : "atm")}
          titleStyle={styles.accordionTitle}
          left={(props) => <List.Icon {...props} icon="chevron-down" />}
        >
          {renderSteps(instructions.atm)}
        </List.Accordion>

        <List.Accordion
          title="Top up via m-Banking"
          expanded={expanded === "mobile"}
          onPress={() => setExpanded(expanded === "mobile" ? null : "mobile")}
          titleStyle={styles.accordionTitle}
          left={(props) => <List.Icon {...props} icon="chevron-down" />}
        >
          {renderSteps(instructions.mobile)}
        </List.Accordion>

        <List.Accordion
          title="Top up via Internet Banking"
          expanded={expanded === "internet"}
          onPress={() => setExpanded(expanded === "internet" ? null : "internet")}
          titleStyle={styles.accordionTitle}
          left={(props) => <List.Icon {...props} icon="chevron-down" />}
        >
          {renderSteps(instructions.internet)}
        </List.Accordion>
      </List.Section>

            {/* Amount Section */}
       
          </Card>
        </ScrollView>

        {/* Continue Button */}
        <Button mode="contained" style={styles.continueButton} onPress={() => navigation.push('PembayaranBerhasil')}>
         Saya Sudah Bayar
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
  containerBank: {
    padding: 16,
    marginTop: -10
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: 'white'
  },
  listContainer: {
    flexDirection: "row",
  },
  subtitle: {
    fontSize: 14,
    color: "#6e6e6e",
    marginBottom: 16,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    paddingLeft: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3CB371", // Hijau seperti di gambar
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  stepText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  stepDescription: {
    fontSize: 14,
    color: "#6e6e6e",
    flex: 1,
  },
  cardBank: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Shadow for Android
  },
  selectedCard: {
    backgroundColor: "#008080", // Warna hijau seperti di gambar
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  bankName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  selectedText: {
    color: "#fff",
  },
  headerBackground: {
    height: 250,
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
    marginTop: -20,
    height:500
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

export default BankInstruksiCicilan;

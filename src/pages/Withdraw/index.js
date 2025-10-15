import React, { useState } from "react";
import { ImageBackground } from "react-native";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Card, Button, TextInput, Switch } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Withdraw = ({ navigation }) => {
  const [amount, setAmount] = useState("10000000");
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const quickAmounts = ["10%", "50%", "100%"];

  const formatRupiah = (value) => {
    const number = value.replace(/[^0-9]/g, "");
    return number ? `Rp ${parseInt(number).toLocaleString("id-ID")}` : "";
  };

  return (
    <View style={styles.container}>
      <ScrollView>
      <ImageBackground source={require("../../assets/bground.png")} style={styles.headerBackground}>
          <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}  onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tarik Dana</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="magnify" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Card style={styles.balanceCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.balanceLabel}>Saldo</Text>
            {/* <Switch value={isEnabled} onValueChange={toggleSwitch} /> */}
          </View>
          <Text style={styles.balanceAmount}>Rp 13.000.000</Text>
        </Card>
          </ImageBackground>

      

        <View style={styles.transferSection}>
          <Text style={styles.transferLabel}>Transfer Ke</Text>
          <Text style={styles.transferDetail}>834324234 - Rebecca Copper</Text>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Set Jumlah</Text>
          <Text style={styles.subtitle}>Berapa yang akan anda Tarik?</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="numeric"
            value={formatRupiah(amount)}
            onChangeText={(text) => setAmount(text)}
          />
          <View style={styles.quickAmountContainer}>
            {quickAmounts.map((item, index) => (
              <TouchableOpacity key={index} style={styles.quickAmountButton}>
                <Text style={styles.quickAmountText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Button mode="contained" style={styles.withdrawButton} onPress={() => navigation.push('WithdrawSuccess')}>
        Tarik Saldo
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    backgroundColor: "#1EAAA6",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: 50,
  },
  headerBackground: {
    height: 200,
    paddingBottom: 20,
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20,
overflow: 'hidden'
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 16,
   
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
  balanceCard: {
    backgroundColor: "#4CD080",
    marginHorizontal: 20,
    padding: 20,
   borderTopLeftRadius: 10,
   borderTopRightRadius: 10,
    marginTop: 40
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#fff",
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  transferSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  transferLabel: {
    fontSize: 14,
    color: "#A0A0A0",
  },
  transferDetail: {
    fontSize: 16,
    fontWeight: "bold",
    color: 'black'
  },
  amountSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  subtitle: {
    fontSize: 14,
    color: "#A0A0A0",
    marginBottom: 10,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#1EAAA6",
    paddingVertical: 5,
    backgroundColor: "transparent",
    textAlign: "center",
    color: "#333",
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
  withdrawButton: {
    backgroundColor: "#1EAAA6",
    borderRadius: 30,
    margin: 20,
    paddingVertical: 10,
  },
});

export default Withdraw;
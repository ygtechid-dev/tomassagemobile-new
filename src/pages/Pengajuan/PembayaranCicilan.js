import React, { useState } from "react";
import { ImageBackground, TextInput } from "react-native";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Button, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import BackGS from "../../assets/bground.png";
import { ScrollView } from "react-native";

const PembayaranCicilan = ({navigation}) => {
  const [investment, setInvestment] = useState("10000000"); // Default value

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScrollView>
      <View>
      <ImageBackground source={BackGS} style={{ height: 200 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}  onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pembayaran Cicilan</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="magnify" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Product Card */}
      <Card style={styles.card}>
      <TouchableOpacity style={styles.containerCard} onPress={() => navigation.push('BankInstruksiCicilan')}>
      <View style={styles.iconContainer}>
        <Icon name="bank" size={24} color="#1EAAA6" />
      </View>
      <Text style={styles.title}>{"Bank Transfer"}</Text>
      <Icon name="chevron-right" size={24} color="#A0A0A0" />
    </TouchableOpacity>
    <TouchableOpacity style={styles.containerCard}>
      <View style={styles.iconContainer}>
        <Icon name="qrcode" size={24} color="#1EAAA6" />
      </View>
      <Text style={styles.title}>{"QRIS"}</Text>
      <Icon name="chevron-right" size={24} color="#A0A0A0" />
    </TouchableOpacity>
      </Card>
      </View>
      </ScrollView>
     
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  containerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 10,
    marginTop: 20
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
  iconContainer: {
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#1E1E1E",
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
  button: {
    width: '100%',
    backgroundColor: '#2ABCB4',
    padding: 8,
    borderRadius: 20,
    marginTop: 50, marginBottom: 50
  },
  loginText: {
    marginTop: 20,
    color: 'gray',
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    elevation: 2,
    marginTop: -110,
    height: 700
  },
  productImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
    alignSelf: "center",
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "black",
  },
  price: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    marginTop: 5,
  },
  bold: {
    fontWeight: "bold",
    color: "#000",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    color: "#000",
  },
  investSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: 'black'
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    color: 'black'

  },
  input: {
    width: "100%",
    height: 50,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    color: 'black'

  },
  percentageContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginRight: 10,
    

  },
  percentageButton: {
    backgroundColor: "#F1FBF5",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    marginRight: 10
    
  },
});

export default PembayaranCicilan;

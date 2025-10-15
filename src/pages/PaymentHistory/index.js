import React, { useState } from "react";
import { ImageBackground, TextInput } from "react-native";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Button, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import BackGS from "../../assets/bground.png";
import { ScrollView } from "react-native";

const PaymentHistory = ({navigation}) => {
  const [investment, setInvestment] = useState("10000000"); // Default value

  const transactions = [
    {
      id: "1",
      title: "Samsung Galaxy S25",
      amount: "-Rp 13.000.000",
      date: "2 Dec 2020 • 3:09 PM",
    },
  ];

  
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
          <Text style={styles.headerTitle}>Payment History</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="magnify" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Product Card */}
      <Card style={styles.card}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Card style={styles.cardDeb}>
      <View style={styles.containerDeb}>
        <Text style={styles.titleCard}>Saldo Utama</Text>

       
      </View>
      <Text style={styles.descCard}>Rp10.780.000</Text>

    </Card>
    <Card style={styles.cardDeb}>
      <View style={styles.containerDeb}>
        <Text style={styles.titleCard}>Total Invest</Text>
        
      </View>
      <Text style={styles.descCard}>Rp8.780.000</Text>

    </Card>
        </View>
     
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "#4AB19D",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon name="arrow-up" size={24} color="#fff" />
          </View>
          <TouchableOpacity onPress={() => navigation.push('InvestasiReport')} style={{ marginLeft: 10 }}>
            <Text style={{ color: "#6B7280", fontSize: 14 }}>
             {' Anda mendapatkan profit sebesar \n Rp 13.000.000'}
            </Text>
            <Text style={{ color: "#4AB19D", fontSize: 14, fontWeight: "bold", marginLeft: 5 }}>Lihat Laporan</Text>
          </TouchableOpacity>

          
        </View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 25, color: 'black' }}>History Transaksi</Text>

<View style={{ marginTop: 15 }}>
  <Text style={{ fontSize: 16, fontWeight: "bold" }}>Samsung Galaxy S25</Text>
  <Text style={{ color: "#6B7280", fontSize: 12 }}>2 Dec 2020 • 3:09 PM</Text>
  <Text style={{ fontSize: 18, fontWeight: "bold", color: "black", alignSelf: "flex-end", marginTop: -30 }}>
    -Rp 13.000.000
  </Text>
</View>
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
  cardDeb: {
    backgroundColor: "#23A6A5",
    borderRadius: 15,
    padding: 15,
    width: 150,
    height: 100,
  },
  containerDeb: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleCard: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  descCard: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "light",
    marginTop: 10
  },
  iconContainer: {
    flexDirection: "row",
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

export default PaymentHistory;

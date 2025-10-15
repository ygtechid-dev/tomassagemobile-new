import React, { useState } from "react";
import { ImageBackground, TextInput } from "react-native";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Button, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import BackGS from "../../assets/bground.png";
import { ScrollView } from "react-native";

const BookProject = ({navigation}) => {
  const [investment, setInvestment] = useState("10000000"); // Default value

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScrollView>
      <View>
      <ImageBackground source={BackGS} style={{ height: 200 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project #4353</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="magnify" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Product Card */}
      <Card style={styles.card}>
        <Image
          source={{
            uri: "https://ygtechdev.my.id/files/photo-1739937156596-623490198.png",
          }} // Ganti dengan URL gambar produk
          style={styles.productImage}
        />
        <Text style={styles.productTitle}>Samsung Galaxy S25 FE</Text>
        <Text style={styles.price}>
          Rp 1.900.000 dari <Text style={styles.bold}>Rp 25.000.000</Text>
        </Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Uang Muka</Text>
          <Text style={styles.infoValue}>: Rp 10.800.000</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Biaya Cicilan per Bulan</Text>
          <Text style={styles.infoValue}>: Rp 1.800.000</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Waktu Cicilan</Text>
          <Text style={styles.infoValue}>: 12 Bulan</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Profit Investor</Text>
          <Text style={[styles.infoValue, styles.bold]}>: 18,75%</Text>
        </View>

        <Divider style={{ marginTop: 24, marginBottom: 24 }} />

        {/* Investment Section */}
        <View style={styles.investSection}>
          <Text style={styles.sectionTitle}>Set Invest</Text>
          <Text style={styles.sectionSubtitle}>
            Berapa Jumlah yang Akan di Invest
          </Text>

          {/* TextInput untuk jumlah investasi */}
          <TextInput
            style={styles.input}
            value={investment}
            onChangeText={setInvestment}
            keyboardType="numeric"
            placeholder="Masukkan jumlah investasi"
          />

          {/* Persentase investasi */}
          <View style={styles.percentageContainer}>
            <Button
            textColor="#14A49C"

              mode="contained"
              style={styles.percentageButton}
              onPress={() => setInvestment("1000000")}
            >
              10%
            </Button>
            <Button
            textColor="#14A49C"

              mode="contained"
              style={styles.percentageButton}
              onPress={() => setInvestment("5000000")}
            >
              50%
            </Button>
            <Button
            textColor="#14A49C"
              mode="contained"
              style={styles.percentageButton}
              onPress={() => setInvestment("10000000")}
            >
              100%
            </Button>
          </View>
        </View>

        <Button mode="contained" style={styles.button} onPress={() => navigation.push('TransactionSuccess')}>
          Proses
      </Button>
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
    flex: 1,
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

export default BookProject;

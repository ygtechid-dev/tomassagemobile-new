import React from "react";
import { ImageBackground } from "react-native";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import BackGS from "../../assets/bgsuc.png";
import ICsuc from "../../assets/icsuc.png";


const TopupSuccess = ({navigation}) => {
  return (
    <ImageBackground source={BackGS} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Terima Kasih</Text>
      </View>
      
      <Card style={styles.card}>
        <View style={styles.iconContainer}>
        <Image source={ICsuc} style={{width: 80, height: 80}} />
        </View>
        <Text style={styles.successText}>Topup Berhasil!</Text>
        <Text style={styles.subText}>Proses Topup Anda Berhasil!</Text>
        <Text style={styles.amount}>Rp 10.000.000</Text>

        <Divider style={{marginTop: 16, marginBottom: 16}}/>
        
        <View style={styles.projectContainer}>
          <Text style={styles.projectText}>Destinasi </Text>
          <View style={styles.productContainer}>
            <Image
              source={{ uri: "https://ygtechdev.my.id/files/photo-1742080531339-956567367.png" }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>Saldo ToMassage</Text>
              <Text style={styles.productDetails}>ID: 84373-343 • 15:12</Text>
            </View>
          </View>

          
        </View>
        <TouchableOpacity style={styles.button} onPress={() => navigation.push('Home')}>
          <Text style={styles.buttonText}>Selesai</Text>
        </TouchableOpacity>
      
      </Card>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 50,
  },
  headerText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: -50,
    width: "90%",
    alignItems: "center",
    justifyContent: 'center'
  },
  iconContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000",
    textAlign: 'center'
  },
  subText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  amount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginVertical: 10,
    textAlign: 'center'
  },
  projectContainer: {
    width: 270,
    padding: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    marginTop: 10,
  },
  projectText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  productInfo: {
    marginLeft: 10,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productDetails: {
    fontSize: 12,
    color: "#666",
  },
  button: {
    backgroundColor: "#1EAAA6",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    width: 270,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TopupSuccess;

import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, Button } from "react-native-paper";

const SuccessSubmissionScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/imagesucc.png")} style={styles.image} />
      <Text style={styles.title}>Perjalanan Diajukan</Text>
      <Text style={styles.subtitle}>
        Perjalanan anda sedang diajukan. Menunggu approval pihak terkait.
      </Text>
      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={() => navigation.navigate("Home")}>
          Halaman Utama
        </Button>
        <Button style={{marginLeft: 10}} mode="contained" buttonColor="#007bff" onPress={() => navigation.navigate("DetailPengajuan")}>
          Detail Pengajuan
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
  },
  image: {
    width: 130,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "gray",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
});

export default SuccessSubmissionScreen;

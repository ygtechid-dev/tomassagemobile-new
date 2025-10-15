import React from 'react';
import { ScrollView } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const TentangKami = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome5Icon name="chevron-left" size={22} color={'white'} />
        </TouchableOpacity>
        <Text style={styles.header}>About LadjuRepair</Text>
      </View>
      <ScrollView>
      <View>
      <Text style={styles.description}>
      LadjuRepair adalah aplikasi inovatif yang dirancang khusus untuk memudahkan pemilik kendaraan dalam mengatur dan memesan berbagai layanan perawatan kendaraan. Dengan LadjuRepair, pengguna dapat melakukan reservasi untuk servis kendaraan, ganti oli, tambal ban, serta membeli onderdil motor dengan cepat dan mudah.

Aplikasi ini memberikan kemudahan akses ke berbagai layanan yang diperlukan oleh pemilik kendaraan, sehingga pengguna tidak perlu repot lagi mencari bengkel atau toko onderdil secara manual. Selain itu, LadjuRepair juga menawarkan fitur untuk melihat jadwal dan ketersediaan layanan, sehingga pengguna dapat merencanakan perawatan kendaraan mereka dengan lebih baik.

Dengan antarmuka yang user-friendly dan intuitif, LadjuRepair membuat proses pemesanan menjadi sangat sederhana. Pengguna cukup memilih jenis layanan yang dibutuhkan, menentukan lokasi bengkel, dan memilih waktu yang diinginkan. Aplikasi ini juga menyediakan informasi mengenai jenis oli yang direkomendasikan serta spesifikasi onderdil yang sesuai untuk kendaraan Anda.

Dengan menggunakan LadjuRepair, Anda akan mendapatkan layanan berkualitas tinggi dari teknisi yang berpengalaman dan terpercaya. Aplikasi ini tidak hanya membantu menjaga performa kendaraan Anda, tetapi juga memberikan rasa aman dan nyaman saat berkendara. Bergabunglah dengan komunitas LadjuRepair dan nikmati kemudahan dalam merawat kendaraan Anda!
      </Text>
      </View>
      </ScrollView>
    
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2c94df',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    marginLeft: -20
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: 20,
  },
});

export default TentangKami;

import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import BGgs from '../../assets/backgs.png';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const GetStarted = ({navigation}) => {
  return (
    <ImageBackground source={BGgs} style={styles.background}>
        <Text style={styles.text}>
        {"  Saatnya\nBerniaga Tanpa Riba"}
        </Text>
        <TouchableOpacity onPress={() => navigation.push('Login')} style={{backgroundColor: 'white', height: 70, width: '90%', borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={styles.textCaption}>
        {"Mulai Berniaga"}
        </Text>
        <Icon name="chevron-right" color={'#00A097'} size={20} style={{marginTop: 30, marginRight: 16}} />
        </TouchableOpacity>
    </ImageBackground>
  );
};

export default GetStarted;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end', // Menempatkan teks di bawah
    alignItems: 'center', // Membuat teks berada di tengah secara horizontal
    paddingBottom: 50, // Jarak dari bawah
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Latar belakang semi-transparan
    padding: 10,
    borderRadius: 10,
  },
  text: {
    fontFamily: 'Poppins-Bold',
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 100
  },
  textCaption: {
    fontFamily: 'Poppins-Bold',
    color: '#00A097',
    fontSize: 14,
    marginLeft: 12,
    marginTop: 24
  },
});

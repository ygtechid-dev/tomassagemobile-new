import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5'
import { Divider } from 'react-native-paper'
import Logo from '../../assets/ladjulogo.png';
import Maintenances from '../../assets/logomaintenance.png';
import Notif from '../../assets/snotif.png';
import Kalendar from '../../assets/skalendar.png';
import Reschedule from '../../assets/sreschedule.png';
import Laporan from '../../assets/slaporan.png';

import Chat from '../../assets/schat.png';
import Jadwal from '../../assets/sjadwal.png';




const System = ({navigation}) => {
  return (
    <View style={{flex: 1, backgroundColor: '#2c94df'}}>
      <View style={{   marginHorizontal: 30,
    marginTop: 30,}}>
      <TouchableOpacity  onPress={() => navigation.goBack()} style={{flexDirection: 'row'}}>
        
      <FontAwesome5Icon name="chevron-left" size={22} color={'white'} />
      
      <Text style={[styles.txtDesc, {
        marginLeft: 10
      }]}>System | LadjuRepair.</Text>
         </TouchableOpacity>
       
         <Divider style={{marginTop: 20, width: '100%', color: 'white'}} bold={true}/>
         <View style={{alignItems: 'center', marginTop: 20,}}>
        <Image source={Logo} style={{ width: 150, height: 150 }} />
       
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 30}}>
          <TouchableOpacity onPress={() => alert('Pengingat Aktif. Anda akan di kontak tim kami di tanggal reservasi')}>
        <Image source={Notif} style={{ width: 100, height: 100, borderRadius: 20 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.push('IntegrasiKalendar')}>
        <Image source={Kalendar} style={{ width: 100, height: 100, marginLeft: 5, borderRadius: 20 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.push('Reschedule')}>
        <Image source={Reschedule} style={{ width: 100, height: 100, marginLeft: 5, borderRadius: 20 }} />
          </TouchableOpacity>

        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 30}}>
          <TouchableOpacity onPress={() => navigation.push('RiwayatServis')}>
        <Image source={Laporan} style={{ width: 100, height: 100, borderRadius: 20 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.push('LiveChat')}>
        <Image source={Chat} style={{ width: 100, height: 100, marginLeft: 5, borderRadius: 20 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.push('JadwalBukaBengkel')}>
        <Image source={Jadwal} style={{ width: 100, height: 100, marginLeft: 5, borderRadius: 20 }} />
          </TouchableOpacity>

        </View>
        
      </View>
       
    </View>
  )
}

export default System

const styles = StyleSheet.create({
  txtDesc: {
    color: 'white',
    marginLeft: 0, 
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2
  },
})
import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const CardSenjata = ({img, title, tipe, qty, loc}) => {
  return (
    <View style={styles.box}>
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{flexDirection: 'row'}}>
        <Image source={img} style={{width: 100, height: 100, marginTop: 7}} />
    <View style={{marginTop: 10}}>
<Text style={{color: 'black',  fontSize: 12,  fontFamily: 'Poppins-Bold', marginLeft: 10, fontWeight: '400',flexWrap: 'wrap', textAlign: 'center'}}>{title}</Text>
<Text style={{color: '#949494',  fontSize: 12,  marginTop: 3, fontFamily: 'Poppins-Light',marginLeft: 10, }}>{tipe}</Text>
<Text style={{color: '#52A500',  fontSize: 12,  marginTop: 3, fontFamily: 'Poppins-Light',marginLeft: 10, }}>{"Kuantitas"}</Text>
<Text style={{color: '#949494',  fontSize: 12,  marginTop: 3, fontFamily: 'Poppins-Light',marginLeft: 10, }}>{"Lokasi"}</Text>
    </View>
        </View>
  
    <View style={{marginTop: 10}}>
<View style={{backgroundColor: '#FFE27A', width: 50, marginLeft: 45}}>
<Text style={{color: 'black',  fontSize: 12,  fontFamily: 'Poppins-Bold', fontWeight: '400',flexWrap: 'wrap', textAlign: 'center'}}>{"Edit"}</Text>

</View>
<Text style={{color: '#949494',  fontSize: 12,  marginTop: 3, fontFamily: 'Poppins-Light',marginLeft: 10, }}>{""}</Text>
<Text style={{color: '#52A500',  fontSize: 12,  marginTop: 5, fontFamily: 'Poppins-Light',marginLeft: 10, textAlign: 'right' }}>{qty}</Text>
<Text style={{color: '#949494',  fontSize: 12,  marginTop: 5, fontFamily: 'Poppins-Light',marginLeft: 10, }}>{loc}</Text>
    </View>
    </View>
</View>
  )
}

export default CardSenjata

const styles = StyleSheet.create({
    box: {backgroundColor: 'white',padding: 10, marginTop: 10,  width: '100%', height: 130, borderRadius: 10, shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    
    elevation: 8,}
})
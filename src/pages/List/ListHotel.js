import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Image, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ListHotel = ({route, navigation}) => {
    const {dataProperties, tamu, tglCheckin, tglCheckout, selectCity} = route.params;
    console.log('ss', selectCity);
    
  const [loading, setLoading] = useState(false)
    const filterProp = dataProperties.filter((e) => e.pricing.offers.length > 0)
    const filteredHotels = filterProp
  .filter((e) => e.content.informationSummary.rating === 3 && e.pricing.offers[0].roomOffers[0].room.pricing[0].price.perNight.inclusive.crossedOutPrice !== 0)
  .sort((a, b) => {
    // Prioritaskan hotel yang memiliki area.name sesuai selectCity
    const aMatch = a.content.informationSummary.address.area.name === selectCity ? 0 : 1;
    const bMatch = b.content.informationSummary.address.area.name === selectCity ? 0 : 1;
    return bMatch - aMatch;
  });
    console.log('datr', filteredHotels[0].content.informationSummary.geoInfo);

    const trimSlashes = (url) => {

        return url.replace(/^\/\//, 'https://');
        
      };

      const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
      };

      const handleDetailBook = (item) => {
        setLoading(true)
      setLoading(false)

        navigation.push('BookingScreen', {
          dataProperties: item,
          tglCheckin: tglCheckin,
          tglCheckout: tglCheckout
      })

      }
  return (
    <>
    <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{flexDirection: 'row'}}>
        <Icon name="chevron-left" size={24} color="black" />

      <Text variant="titleMedium" style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 16, color: 'black' }}>
        Hasil Pencarian
      </Text>
        </TouchableOpacity>
      
    <ScrollView>
    {filteredHotels.length > 0 ?
      
      filteredHotels.filter((e) => e.content.informationSummary.rating == 3 && e.pricing.offers[0].roomOffers[0].room.pricing[0].price.perNight.inclusive.crossedOutPrice !== 0).map((i, index) => {
        return (
            <Card style={{ borderRadius: 12, overflow: 'hidden', elevation: 3, marginBottom: 20 }} onPress={() => handleDetailBook(i)}>
            <Image
              source={{ uri: trimSlashes(i.content.images.hotelImages[0].urls[0].value) }} // Ganti dengan URL gambar asli
              style={{ width: '100%', height: 150 }}
            />
    
            <View style={{ padding: 12 }}>
              <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>{i.content.informationSummary.defaultName}</Text>
              
            
              
              <Text variant="bodyMedium" style={{ color: 'gray' }}>{i.content.informationSummary.address.area.name}</Text>
    
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Icon name="emoji-events" size={16} color="purple" />
                <Text variant="bodyMedium" style={{ marginLeft: 4 }}>{"Rating " + i.content.informationSummary.rating + "/5"}</Text>
              </View>
    
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', alignSelf: 'flex-end', marginTop: 8 }}>
               {formatRupiah(i.pricing.offers.length > 0 ? i.pricing.offers[0].roomOffers[0].room.pricing[0].price.perNight.inclusive.display : 10000)}
              </Text>
            </View>
          </Card>
        )
      })
    : null}
    </ScrollView>
     
   
    </View>
    <Modal visible={loading}>
      <ActivityIndicator size="large" color="black" />
    </Modal>
    
    </>
  );
};

export default ListHotel;

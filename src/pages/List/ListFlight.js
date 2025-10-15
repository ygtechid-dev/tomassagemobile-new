import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CardFlight from '../../component/CardFlight'
import Icon from 'react-native-vector-icons/FontAwesome5';


const ListFlight = ({route, navigation}) => {
    const {dataBundle, penumpang} = route.params;

    console.log('xxx', dataBundle.length);

    const filterBundle = dataBundle.filter((e) => e.itineraries[0].itineraryInfo.availableSeats > 0)
    const formatTime = (dateTime) => {
        return new Date(dateTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      };

      const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
      };
  return (
    <View style={{flex:1 }}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 22, backgroundColor: 'white', width: '100%', height: 70, flexDirection: 'row', justifyContent: 'space-between'}}>
        <Icon name="chevron-left" size={20} />
        <Text style={styles.airportCode}>LIST FLIGHT</Text>
        <Text style={styles.airportCode}></Text>

        </TouchableOpacity>

<ScrollView>
<View>
        {dataBundle.map((i, index) => {
            return (
                <CardFlight 
                pressed={() => navigation.push('PassengerForm', {
                  penumpang: penumpang,
                  itemFlight: i
                })}
                logo={i.outboundSlice.segments[0].carrierContent.carrierIcon} 
                code={i.outboundSlice.segments[0].carrierContent.carrierCode + i.outboundSlice.segments[0].flightNumber } 
                duration={i.itineraries[0].itineraryInfo.totalTripDuration + "m"}
                flightTime={formatTime(i.outboundSlice.segments[0].departDateTime)}
                arriveTime={formatTime(i.outboundSlice.segments[0].arrivalDateTime)}
                iatadari={i.outboundSlice.segments[0].originAirport}
                iatake={i.outboundSlice.segments[0].destinationAirport}
                namedari={i.outboundSlice.segments[0].airportContent.departureAirportName}
                nameke={i.outboundSlice.segments[0].airportContent.arrivalAirportName}
                kelas={i.outboundSlice.segments[0].cabinClassContent.cabinName}
                harga={formatRupiah(i.itineraries[0].itineraryInfo.price.idr.display.averagePerPax.allInclusive)}
                />
                
            )
        })}
        </View>
</ScrollView>
      
   
    </View>
  )
}

export default ListFlight

const styles = StyleSheet.create({
    airportCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black'
      },
})
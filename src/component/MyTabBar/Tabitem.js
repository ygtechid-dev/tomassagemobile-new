import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import FontAwesomeIcon5 from 'react-native-vector-icons/FontAwesome5';

const TabItem = ({title, active, onPress, onLongPress}) => {
  const Icon = () => {
    if (title == 'Beranda') {
      return active ?  <FontAwesomeIcon5 name="home" size={30} color="#2c94df" /> :  <FontAwesomeIcon5 name="home" size={30} color="grey" />;
    }
    if (title == 'Menu') {
        return active ?   <FontAwesomeIcon5 name="history" size={30} color="#2c94df" /> :  <FontAwesomeIcon5 name="history" size={30} color="grey" />;
      }
      if (title == 'Profil') {
        return active ?   <FontAwesomeIcon5 name="user" size={30} color="#2c94df" /> :  <FontAwesomeIcon5 name="user" size={30} color="grey" />
      }
      if (title == 'Setting') {
        return active ?   <FontAwesomeIcon5 name="th-list" size={30} color="#2c94df" /> :  <FontAwesomeIcon5 name="th-list" size={30} color="grey" />
      }
      // if (title == 'Setting') {
      //   return active ?   <FontAwesomeIcon5 name="user" size={25} color="#3E67F4" /> :  <FontAwesomeIcon5 name="user" size={25} color="grey" />
      // }
    return  <Icon name='area-chart' color="white" size={20} />;
  };
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} onLongPress={onLongPress}>
      <Icon />
    </TouchableOpacity>
  );
}

export default TabItem;

const styles = StyleSheet.create({
  container: {alignItems: 'center', },
  text: (active) => ({
    fontSize: 10,
    marginTop: 3,
    color: active ? 'white' : 'grey',


  
  }),
})
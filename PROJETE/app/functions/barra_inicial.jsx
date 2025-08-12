import React from "react";
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

//adicionar outras pages conforme tiver
import HomeScreen from '../pages/principal/principal';


export default function BarraInicial(){
  return(
 <View style={styles.barra }>
      <TouchableOpacity>🏠</TouchableOpacity>
      <TouchableOpacity>🔍</TouchableOpacity>
      <TouchableOpacity>➕</TouchableOpacity>
      <TouchableOpacity>💬</TouchableOpacity>
      <TouchableOpacity>👤</TouchableOpacity>

      
    </View>
  );
}
const styles = StyleSheet.create({
   barra: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
   }
});


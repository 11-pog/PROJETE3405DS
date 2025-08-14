import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

//adicionar outras pages conforme tiver
import HomeScreen from '../pages/principal/principal';


export default function BarraInicial() {
  return (
    <View style={styles.barra}>
      <TouchableOpacity><Ionicons name="home" size={24} color="white" /></TouchableOpacity>
      <TouchableOpacity><Ionicons name="library" size={24} color="white" /></TouchableOpacity>
      <TouchableOpacity> <Ionicons name="add" size={24} color="white" /></TouchableOpacity>
      <TouchableOpacity><Ionicons name="chatbox-ellipses" size={24} color="white" /></TouchableOpacity>
      <TouchableOpacity><Ionicons name="person" size={24} color="white" /></TouchableOpacity>



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
    backgroundColor: '#335c67',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  }
});


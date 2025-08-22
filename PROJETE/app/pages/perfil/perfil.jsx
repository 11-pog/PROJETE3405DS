import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import Botao from '../../functions/botoes';
import { navigate } from 'expo-router/build/global-state/routing';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MeuInput from '../../functions/textBox';
import BarraInicial from '../../functions/barra_inicial';


export default function Perfil() {
  return (
    <View style={styles.container}>
      {/* Foto de perfil */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/1999/1999625.png" }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editIcon}>
          <Ionicons name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Inputs */}


      <Botao texto="Editar" aoApertar={() => navigate("/pages/perfil/editar")} />
      <Botao texto="Sair" aoApertar={() => navigate("/pages/login/Login")} />
      <BarraInicial />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    paddingTop: 40,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ddd",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#335C67",
    padding: 5,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",

  }
});   
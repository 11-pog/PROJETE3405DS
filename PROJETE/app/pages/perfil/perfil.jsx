import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Botao from '../../functions/botoes';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BarraInicial from '../../functions/barra_inicial';
import { useRouter } from 'expo-router';

export default function Perfil() {
  const router = useRouter();

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

   
      <Botao texto="Editar" aoApertar={() => router.push("/pages/perfil/editar")} />
      <Botao texto="Sair" aoApertar={() => router.push("/pages/login/Login")} />
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
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
    textAlign: "center",
  }
});

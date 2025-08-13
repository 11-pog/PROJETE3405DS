import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";

export default function Botao({ aoApertar, texto }) {
  return (
    <View style={{ marginTop: 10 }}>
      <TouchableOpacity
        onPress={aoApertar}
        style={styles.button}

      >
        <Text style={styles.text}>{texto}</Text>

      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#335C67",
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginVertical: 10,

    //tentativa de fazer a sombra funcionar no mobile, ai tem uma versao pra android e uma pra ios. nao sei se ta funcionando, no meu aparelho telemovel nao abre
    // Sombra no iOS
    shadowColor: '#1c292cff',
    shadowOffset: {
      width: 1,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3,

    // Sombra no Android
    elevation: 5,
  },

  text: {
    color: "#F5F5F5",
    fontSize: 16,
    textAlign: "center",
  },
});


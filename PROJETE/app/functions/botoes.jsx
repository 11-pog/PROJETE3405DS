import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";

export default function Botao({ aoApertar, texto }) {
  return (
    <View style={{ marginTop: 10 }}>
      <TouchableOpacity
        onPress={aoApertar}
        style={styles.button}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>{texto}</Text>


      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#335C67",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginVertical: 10,

    
    // Sombra no iOS
    shadowColor: '#1c292cff',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // Sombra no Android
    elevation: 10,
  },

  text: {
    color: "#F5F5F5",
    fontSize: 16,
    textAlign: "center",
  },
});


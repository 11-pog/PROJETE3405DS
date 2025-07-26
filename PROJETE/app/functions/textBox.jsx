// components/MeuInput.jsx
import React from "react";
import { TextInput, Text, View, StyleSheet } from "react-native";

export default function MeuInput({ label, valor, onChange, placeholder, senha = false }) {
  return (
    <View style={{ marginBottom: 5 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder={"Escreva aqui..."}
        secureTextEntry={senha}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    padding: 10,
          borderRadius: 30,
          borderWidth: 0,
          marginTop: 10,
          marginBottom: 20,
          backgroundColor: "#fff",
  },
});

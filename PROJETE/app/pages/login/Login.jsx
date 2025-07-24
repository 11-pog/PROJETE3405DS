import React, { useState } from "react";
import { Text, View, Button, TextInput, Alert } from "react-native";

function Login() {
  const [texto, setTexto] = useState(""); // controla o campo de texto

  function Alerta() {
    Alert.alert("Você digitou:", texto); // alerta do React Native
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: "#F5F5F5",
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color: "#E09F3E",
          marginBottom: 20,
        }}
      >
        Página de login
      </Text>

      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#333",
        }}
      >
        E-mail
      </Text>

      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder="Escreva aqui..."
        style={{
          padding: 10,
          borderRadius: 30,
          borderWidth: 1,
          borderColor: "#ccc",
          marginTop: 10,
          marginBottom: 20,
          backgroundColor: "#fff",
        }}
      />

      <Button title="Mostrar" onPress={Alerta} color="#335C67" />
    </View>
  );
}

export default Login;

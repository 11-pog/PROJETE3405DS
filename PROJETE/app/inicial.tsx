import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { navigate } from "expo-router/build/global-state/routing";
const logo = require('./img/logo.png');


export default function Inicial() {

  function GoToLogin() {
    navigate('/pages/login/Login');
  }

  function GoToCadastrar() {
    navigate('/pages/cadastrar/cadastrar');
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 50,
        backgroundColor: "#F5F5F5",
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color: "#E09F3E",
        }}
      >
        Read-Cycle
      </Text>

      {/* Botão Entrar */}
      <TouchableOpacity
        onPress={GoToLogin}
        style={{
          backgroundColor: "#335C67",
          borderRadius: 100,
          paddingVertical: 10,
          paddingHorizontal: 30,
          marginTop: 105,
        }}
      >
        <Text style={{ color: "#F5F5F5", fontSize: 16, textAlign: "center" }}>
          Entrar
        </Text>
      </TouchableOpacity>

      {/* Botão Cadastrar */}
      <TouchableOpacity
        onPress={GoToCadastrar}
        style={{
          backgroundColor: "#335C67",
          borderRadius: 100,
          paddingVertical: 10,
          paddingHorizontal: 30,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#F5F5F5", fontSize: 16, textAlign: "center" }}>
          Cadastrar
        </Text>
      </TouchableOpacity>

      {/* Texto final */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          color: "#9E2A2B",
          marginTop: 20,
          textAlign: "center",
        }}
      >
        Troque livros,{"\n"}troque ideias,{"\n"}toque o mundo.
      </Text>
    </View>
  );
}

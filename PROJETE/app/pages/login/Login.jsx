import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import MeuInput from "../../functions/textBox";
import Botao from "../../functions/botoes";
import { router } from "expo-router";

export default function Login() {
  const [Email, setEmail] = useState("");
  const [Senha, setSenha] = useState("");

  function GoToPrincipal() {
    router.push("/pages/principal/principal");
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
        Faça login na sua conta
      </Text>

      <MeuInput label="Email:" valor={Email} onChange={setEmail} />
      <MeuInput label="Senha:" valor={Senha} onChange={setSenha} />

      <Botao aoApertar={GoToPrincipal} texto="Entrar" />

      <Pressable onPress={() => router.push("/pages/cadastrar/cadastrar")}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "#a86e17ff",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Ainda não tem uma conta? Clique aqui.
        </Text>
      </Pressable>
    </View>
  );
}

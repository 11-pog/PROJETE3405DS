import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import MeuInput from "../../functions/textBox";
import Botao from "../../functions/botoes";
import { router } from "expo-router";
import axios from 'axios';


export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  

   const fazerLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/login/', {

        email: email,
        senha: senha,
        
      });

     if (response.status === 200){
        router.push("/pages/principal/principal");
    }

    } catch (error) {
  if (error.response) {
    console.log("Erro no login:", error.response.data);
  } else {
    console.log("Erro no login:", error.message);
  }
}
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

      <MeuInput label="Email:" valor={email} onChange={setEmail} />
      <MeuInput label="Senha:" valor={senha} onChange={setSenha} />

      <Botao aoApertar={fazerLogin} texto="Entrar" />

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

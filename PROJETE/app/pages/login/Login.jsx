import React, { useState } from "react";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import MeuInput from "../../functions/textBox";
import Botao from "../../functions/botoes";
import { navigate } from "expo-router/build/global-state/routing";



export default function Login() {
  const [Email, setEmail] = useState(""); 
  const [Senha, setSenha] = useState(""); 

function GoToPrincpal() {
    navigate('/pages/principal/principal');
  }

  function Alerta() {
    console.log("funcionou"); 
    //"Login", `Email: ${Email}\nSenha: ${Senha}`
    

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

      <MeuInput
        label={"Email:"}
        valor={Email}
        onChange={setEmail}
      />


      <MeuInput
        label={"Senha: "}
        valor={Senha}
        onChange={setSenha}
        />
        
      <Botao
       aoApertar={GoToPrincpal}
       texto={"Entrar"}
      />
       
      

    </View>
  );
}


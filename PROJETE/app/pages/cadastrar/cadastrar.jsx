import React, { useState } from "react";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import MeuInput from "../../functions/textBox";
import Botao from "../../functions/botoes";
import { navigate } from "expo-router/build/global-state/routing";

function Cadastrar() {
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [Cidade, setCidade] = useState("");

const enviarUsuario = async () => {
  const response = await fetch ('http://localhost:8000/api/cadastrar/',{
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario: usuario, senha: senha, email: email}),

  });
  const data = await response.json();
  console.log(data);


}

  function Alerta() {
    Alert.alert("Email digitado:", email); // alerta do React Native
    Alert.alert("Senha digitada:", senha); // alerta do React Native

  }

  //tirar depois
  function GoToPrincpal() {
    navigate('/pages/principal/principal');
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
        Cadastrar novo usuário
      </Text>

      <MeuInput 
        label={"Nome de usuário: "}
        valor={usuario}
        onChange={setUsuario}


      />

      <MeuInput
        label={"Email: "}
        valor={email}
        onChange={setEmail}

      />

      <MeuInput
        label={"Senha: "}
        valor={senha}
        onChange={setSenha}


      />




      <MeuInput
        label={"Cidade: "}
        valor={Cidade}
        onChange={setCidade}
      />



      <Botao
        aoApertar={enviarUsuario}
        texto={"Cadastrar"}
      />

    </View>
  );
}

export default Cadastrar;

import React, { useState } from "react";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import MeuInput from "../../functions/textBox";

function Login() {
  const [Nome, setNome] = useState("");
  const [Email, setEmail] = useState("");
  const [Senha, setSenha] = useState("");
  const [Cidade, setCidade] = useState("");



  function Alerta() {
    Alert.alert("Email digitado:", Email); // alerta do React Native
    Alert.alert("Senha digitada:", Senha); // alerta do React Native

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
       label = {"Nome do usuário: "}
       valor={Nome}
       onChange={setNome}       
        
      />

      <MeuInput
        label={"Email: "}
        valor={Email}
        onChange={setEmail}
        
      />

      <MeuInput
        label={"Senha: "}
        valor={Senha}
        onChange={setSenha}
        
        
      />


  

      <MeuInput
        label={"Cidade: "}
        valor={Cidade}
        onChange={setCidade}       
      />



      <TouchableOpacity
        onPress={Alerta}
        style={{
          backgroundColor: "#335C67",
          borderRadius: 100,
          paddingVertical: 10,
          paddingHorizontal: 30,
        }}>
        <Text
          style={{ color: "#F5F5F5", fontSize: 16, textAlign: "center", }}>Mostar</Text>
      </TouchableOpacity>

    </View>
  );
}

export default Login;

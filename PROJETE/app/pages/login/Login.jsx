import React, { useState } from "react";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import MeuInput from "../../functions/textBox";

function Login() {
  const [Email, setEmail] = useState(""); 
  const [Senha, setSenha] = useState(""); 


  function Alerta() {
    Alert.alert("Login", `Email: ${Email}\nSenha: ${Senha}`); 
    

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

<<<<<<< HEAD
      <MeuInput
        label={"Email:"}
        valor={Email}
        onChange={setEmail}
      />


      <MeuInput
        label={"Senha: "}
        valor={Senha}
        onChange={setSenha}
        
=======

      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#333",
        }}
      >
        E-mail:
      </Text>


      <TextInput
        value={Email}
        onChangeText={setEmail}
        placeholder="Escreva aqui..."
        style={{
          padding: 10,
          borderRadius: 30,
          borderWidth: 0,
          marginTop: 10,
          marginBottom: 20,
          backgroundColor: "#fff",
        }}
      />


      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#333",
        }}
      >
        Senha:
      </Text>

      <TextInput
        value={Senha}
        onChangeText={setSenha}
        placeholder="Escreva aqui..."
        style={{
          padding: 10,
          borderRadius: 30,
          borderWidth: 0,
          marginTop: 10,
          marginBottom: 20,
          backgroundColor: "#fff",
        }}
>>>>>>> 31e69c2ab3f0c595b32282876c8b42ca39cfc86d
      />

      <TouchableOpacity
        onPress={Alerta}
        style={{

    
        }}

      >
        <Text
          style={{ color: "#F5F5F5", fontSize: 16, textAlign: "center" }}>Mostar</Text>
      </TouchableOpacity>

    </View>
  );
}

export default Login;

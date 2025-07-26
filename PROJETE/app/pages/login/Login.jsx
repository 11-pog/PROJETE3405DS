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

      <MeuInput
        label={"Email:"}
        valor={Email}
        onChange={setEmail}
      />


      <MeuInput
        label={"Senha: "}
        valor={Senha}
        onChange={setSenha}
        
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

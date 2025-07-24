import React, { useState } from "react";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";

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
        Página de login
      </Text>

    <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#333",
        }}
      >
        Nome de usuário:
      </Text>


      <TextInput
        value={Nome}
        onChangeText={setNome}
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


      <Text // EMAIL
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
          borderWidth: 1,
          borderColor: "#ccc",
          marginTop: 10,
          marginBottom: 20,
          backgroundColor: "#fff",
        }}
      />


      <Text // SENHA
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
          borderWidth: 1,
          borderColor: "#ccc",
          marginTop: 10,
          marginBottom: 20,
          backgroundColor: "#fff",
        }}
      />

       
            <Text CIDADE
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#333",
        }}
      >
        Cidade
      </Text>

      <TextInput
        value={Cidade}
        onChangeText={setCidade}
        placeholder="Escreva aqui..."
        style={{
          padding: 10,
          borderRadius: 30,
          borderWidth: 1,
          borderColor: "#ccc",
          marginTop: 5,
          marginBottom: 20,
          backgroundColor: "#fff",
        }}
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
        style={{ color: "#F5F5F5", fontSize: 16, textAlign: "center",}}>Mostar</Text>
        </TouchableOpacity>
      
    </View>
  );
}

export default Login;


import { navigate } from "expo-router/build/global-state/routing";
import React from "react";
import { Text, View, Button } from "react-native";
import Login from './pages/login/login';
import Cadastrar from './pages/cadastrar/cadastrar'
export default function Inicial() {


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
      
      <Text style=
      {{
          fontSize: 32,
          fontWeight: "bold",
          color: "#E09F3E",
      }}>
          Read-Cycle</Text>

    <button
    style={{
    backgroundColor: "#335C67",
  color:"#F5F5F5",
  border: 0,
  borderRadius: 100, 
  padding: 10, 
  fontSize: 16,
  marginTop: 105,


    }}  

    onClick={GoToLogin}>
      Entrar
    </button>
    
    <button 
     style={{
    backgroundColor: "#335C67",
    color:"#F5F5F5",
    border: 0,
    borderRadius: 100, 
    padding: 10, 
    fontSize: 16,
    marginTop: 20,
    
     }}
    onClick={GoToCadastrar} >
      Cadastrar
    </button>

    <text
    style={{
          fontSize: 16,
          fontWeight: "bold",
          color: "#9E2A2B",
          marginTop: 20,


    }}>
  Troque livros. 
Troque ideias. 
Toque o mundo.
    </text>
    </View>
  );

  function GoToLogin() {
      navigate('/pages/login/login');
    }
  function GoToCadastrar(){
    navigate ('/pages/cadastrar/cadastrar');
  }
    
}





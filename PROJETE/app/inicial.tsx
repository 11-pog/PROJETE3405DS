
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
  borderRadius: 9999, 
  padding: 10, 
  fontSize: 16,
  marginTop: 105,


    }}  

    onClick={BotaoLogin}>
      Entrar
    </button>
    
    <button 
     style={{
    backgroundColor: "#335C67",
    color:"#F5F5F5",
    border: 0,
    borderRadius: 9999, 
    padding: 10, 
    fontSize: 16,
    marginTop: 20,
    
     }}
    onClick={BotaoCadastrar} >
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

  function BotaoLogin() {
      navigate('/pages/login/login');
    }
  function BotaoCadastrar(){
    navigate ('/pages/cadastrar/cadastrar');
  }
  
  //encontrar uma forma de usar essa function para não ficar repetindo em todos os botões
   function Btn(){
  backgroundColor: "#335C67";
  color:"#F5F5F5";
  border: 0;
  borderRadius: 9999; 
  padding: 10; 30;
  fontSize: 16;
      }
}




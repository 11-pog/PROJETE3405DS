
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
        backgroundColor: "#335C67",
      }}
    >
      
      <Text style=
      {{
          fontSize: 32,
          fontWeight: "bold",
          color: "#E09F3E",
      }}>
          Read-Cycle</Text>

    <button  onClick={BotaoLogin}>
      Login
    </button>
    
    <button onClick={BotaoCadastrar} >
      Cadastrar
    </button>
    
    </View>
  );

  function BotaoLogin() {
      navigate('/pages/login/login');
    }
  function BotaoCadastrar(){
    navigate ('/pages/cadastrar/cadastrar');
  }
}




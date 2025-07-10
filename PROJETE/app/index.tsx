import React from "react";
import { Text, View, Button } from "react-native";
import Login from './pages/login/Login';

export default function Index() {
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

 <Button title="Ir para a outra página"/>

    <div>
      <Login />
    </div>

    </View>

    
  );
}

import React from "react";
import { Text, View, Button } from "react-native";

export default function Index({navigation}) {
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
    </View>
  );
}

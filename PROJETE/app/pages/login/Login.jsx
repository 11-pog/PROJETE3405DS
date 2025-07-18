
import { navigate } from "expo-router/build/global-state/routing";
import React from "react";
import { Text, View, Button } from "react-native";
function Login(){
   return (
       <View
         style={{
           flex: 1,
           justifyContent: "flex-start",
           paddingTop: 0,
           backgroundColor: "#335C67",
         }}
       >
         
         <Text style=
         {{
             fontSize: 32,
             fontWeight: "",
             color: "#E09F3E",
         }}>
             Página de login</Text>
       
       </View>
     );
}
export default Login 

import { navigate } from "expo-router/build/global-state/routing";
import React, {useRef} from "react";
import { Text, View, Button } from "react-native";

function Login(){
  const inputRef = useRef(null);

   return (
       <View
         style={{
           flex: 1,
           justifyContent: "flex-start",
           paddingTop: 0,
           backgroundColor: "#F5F5F5",
         }}
       >
         
         <Text style=
         {{
            
             fontSize: 32,
             fontWeight: "",
             color: "#E09F3E",
         }}>
             Página de login</Text>   
    <Text style=
         {{
             fontSize: 18,
             fontWeight: "",
             color: "",
         }}>
             E-mail</Text> 
      <input 
        type="text" 
        ref = {inputRef}
        placeholder="Escreva aqui..." 
        style={{ padding: '8px', borderRadius: '30px', border: '1px solid #ccc' }}
      />
      <div>
      <button      
      style={{
        backgroundColor: "#335C67",
        color:"#F5F5F5",
        border: 0,
        borderRadius: 100, 
        padding: 8, 
        fontSize: 16,
        marginTop: 20,
    
      }}
     onClick={Alerta}>Mostrar</button>
      </div>
        

       </View>
     );



function Alerta()
  {
    alert('Você digitou: ' + inputRef.current.value);
  }
}
export default Login 

/*Caixinha de comentários dos Devs
*Criar uma variável para receber os valores(quando apertar um botão) do que foi escrito e depois ligar isso a back-end
*Mudar as const que recebe o que foi escrito por uma variável
*/
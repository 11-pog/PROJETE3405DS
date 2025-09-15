import React, { use, useState } from 'react'
import { Text, View, Alert } from 'react-native'
import MeuInput from '../../functions/textBox'
import Botao from '../../functions/botoes'
import { BASE_API_URL } from '../../functions/api'
import { useRouter } from 'expo-router'
import axios from 'axios';

function Cadastrar() {
  const [usuario, setUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cidade, setCidade] = useState('')

  const router = useRouter();

  const enviarUsuario = async () => {
    try {
      const response = await axios.post('cadastrar/', {
        usuario: usuario,
        email: email,
        senha: senha,
        cidade: cidade
      });

      alert("Sucesso", response.data.mensagem);


    } catch (error) {
      if (error.response) {
        console.log(error.response.data);

        if (error.response.data && error.response.data.error) {
          Alert.alert("Erro", error.response.data.error);
        } else {
          Alert.alert("Erro", "Erro ao cadastrar");
        }

      } else {
        console.log(error.message);
        Alert.alert("Erro", "Erro ao cadastrar");
      }
    }
    router.push({
      pathname: "/pages/login/Login",
      params: { usuario, email, cidade }
    });

  }



  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 60,
        paddingHorizontal: 20,
        backgroundColor: '#F5F5F5'
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: 'bold',
          color: '#E09F3E',
          marginBottom: 20
        }}
      >
        Cadastrar novo usuário
      </Text>

      <MeuInput label={'Nome de usuário: '} valor={usuario} onChange={setUsuario} />
      <MeuInput label={'Email: '} valor={email} onChange={setEmail} />
      <MeuInput label={'Senha: '} valor={senha} onChange={setSenha} />
      <MeuInput label={'Cidade: '} valor={cidade} onChange={setCidade} />

      <Botao aoApertar={enviarUsuario} texto={'Cadastrar'} />
    </View>
  )
}

export default Cadastrar

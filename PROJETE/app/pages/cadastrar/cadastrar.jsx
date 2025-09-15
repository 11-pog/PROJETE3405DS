import React, { use, useState } from 'react'
import { Text, View, Alert } from 'react-native'
import MeuInput from '../../functions/textBox'
import Botao from '../../functions/botoes'
import { BASE_API_URL } from '../../functions/api'
import { useRouter } from 'expo-router'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'


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

      const login_response = await axios.post(`login/`, {
        email: email,
        password: senha
      })

      console.log('Response do login:', login_response.data)

      // Ajuste conforme o nome do token que o backend retorna
      const token = login_response.data.token || login_response.data.access
      const refresh = login_response.data.refresh;
      console.log('Token recebido:', token)
      console.log('Refresh: ', refresh)

      // Salva o token no AsyncStorage
      await AsyncStorage.setItem('access', token)
      await AsyncStorage.setItem('refresh', refresh)
      
      router.push({
        pathname: "/pages/principal/principal",
        params: { usuario, email, cidade }
      });
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

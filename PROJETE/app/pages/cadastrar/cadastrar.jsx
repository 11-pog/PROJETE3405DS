import React, { useState } from 'react'
import { Text, View, Alert } from 'react-native'
import MeuInput from '../../functions/textBox'
import Botao from '../../functions/botoes'
import { BASE_API_URL } from '../../functions/api'
import { useRouter } from 'expo-router'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { validatePassword, validateEmail } from './regex'

function Cadastrar() {
  const [usuario, setUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cidade, setCidade] = useState('')

  const [emailErr, setEmailErr] = useState(false)
  const [senhaErr, setSenhaErr] = useState(false)

  const validate = () => {
    var result = false

    if (!validateEmail.test(email)) {
      setEmailErr(true)
      result = true
    } else {
      setEmailErr(false)
    }

    if (!validatePassword.test(senha)) {
      setSenhaErr(true)
      result = true
    } else {
      setSenhaErr(false)
    }

    return result
  }

  const router = useRouter();

  const enviarUsuario = async () => {
    // garante que valida antes de enviar
    if (validate()) {
      return;
    }

    try {
      const response = await axios.post('usuario/', {
        usuario: usuario,
        email: email,
        senha: senha,
        cidade: cidade
      });

      alert("Sucesso", response.data.mensagem);

      const token = response.data.access
      await AsyncStorage.setItem('access', token)

      const refresh = response.data.refresh;
      await AsyncStorage.setItem('refresh', refresh)

      router.push({
        pathname: "/pages/principal/principal"
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
      {emailErr && <Text style={{ color: 'red' }}>Digite um email válido!</Text>}

      <MeuInput label={'Senha: '} valor={senha} onChange={setSenha} />
      {senhaErr && <Text style={{ color: 'red' }}>Digite uma senha mais segura!</Text>}

      <MeuInput label={'Cidade: '} valor={cidade} onChange={setCidade} />
      <Botao aoApertar={enviarUsuario} texto={'Continuar'} />
    </View>
  )
}

export default Cadastrar

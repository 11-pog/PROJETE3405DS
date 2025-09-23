import React, { useState } from 'react'
import { Text, View, Pressable } from 'react-native'
import MeuInput from '../../functions/textBox'
import Botao from '../../functions/botoes'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../../functions/api'

export default function Login () {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [tentouLogin, setTentouLogin] = useState(false)

  const limparTokens = async () => {
    await AsyncStorage.removeItem('access')
    await AsyncStorage.removeItem('refresh')
    setErro('')
    console.log('Tokens limpos')
  }

  const fazerLogin = async () => {
    setTentouLogin(true)
    try {
      const response = await axios.post('login/', {
        email: email,
        password: senha
      })

      const token = response.data.token || response.data.access
      const refresh = response.data.refresh

      await AsyncStorage.setItem('access', token)
      await AsyncStorage.setItem('refresh', refresh)

      console.log(' token salvo.', token )
      router.push('/pages/principal/principal')
    } catch (error) {
      if (error.response) {
        console.log('Erro no login:', error.response.data)
        setErro(error.response.data.detail || 'E-mail ou senha inválidos.')
      } else {
        console.log('Erro no login:', error.message)
        setErro('Erro de conexão. Verifique sua internet.')
      }
    }
  }

  const temErroEmail = tentouLogin && erro.toLowerCase().includes('email')
  const temErroSenha = tentouLogin && erro.toLowerCase().includes('senha')

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
        Faça login na sua conta
      </Text>

{/* Campo de email */} 
<MeuInput 
label='Email:' 
valor={email} 
onChange={setEmail} 
erro={temErroEmail} 
mensagemErro={temErroEmail ? erro : ''} 
/> 
{/* Campo de senha */} 
<MeuInput 
label='Senha:'
 valor={senha}
  onChange={setSenha}
   erro={temErroSenha}
    mensagemErro={temErroSenha ? erro : ''} 
    />


      {/* Mensagem de erro genérica */}
      {tentouLogin && erro && !temErroEmail && !temErroSenha && (
        <Text style={{ color: 'red', marginBottom: 10, fontSize: 14 }}>{erro}</Text>
      )}

      <Botao aoApertar={fazerLogin} texto='Entrar' />

      <Pressable onPress={() => router.push('/pages/cadastrar/cadastrar')}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: '#a86e17ff',
            marginBottom: 20,
            textAlign: 'center'
          }}
        >
          Ainda não tem uma conta? Clique aqui.
        </Text>
      </Pressable>

      <Pressable onPress={limparTokens}>
        <Text
          style={{
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
            marginTop: 10
          }}
        >
          Limpar dados salvos
        </Text>
      </Pressable>
    </View>
  )
}

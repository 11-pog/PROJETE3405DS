import React, { useState } from 'react'
import { Text, View, Alert } from 'react-native'
import MeuInput from '../../functions/textBox'
import Botao from '../../functions/botoes'
import { useRouter } from 'expo-router'

function Cadastrar () {
  const [usuario, setUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [Cidade, setCidade] = useState('')

  const router = useRouter() // Hook para navegação

  const enviarUsuario = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cadastrar/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario, senha, email })
      })

      const data = await response.json()
      console.log(data)

      // Se cadastro for sucesso, vai para a página principal
      if (response.ok) {
        router.push('/pages/principal/principal')
      } else {
        Alert.alert('Erro', data.message || 'Erro ao cadastrar usuário')
      }
    } catch (error) {
      router.push('/pages/principal/principal') // aqui é pra colocar uma mensagem de erro caso de errado o cadastro, deixei assim so pra ver se deu certo 
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
      <MeuInput label={'Cidade: '} valor={Cidade} onChange={setCidade} />

      <Botao aoApertar={enviarUsuario} texto={'Cadastrar'} />
    </View>
  )
}

export default Cadastrar

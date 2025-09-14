import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity
} from 'react-native'
import Botao from '../../functions/botoes'
import { navigate } from 'expo-router/build/global-state/routing'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MeuInput from '../../functions/textBox'
import api from '../../functions/api'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Editar() {
  const router = useRouter()

  const [usuario, setUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cidade, setCidade] = useState('')

  const Editar = async () => {
    try {
      const response = await api.patch(
        'editar/',
        {
          username: usuario,
          password: senha,
          email: email,
          cidade: cidade
        }
      )

      if (response.status === 200) {
        await AsyncStorage.setItem('access', response.data.access)
        await AsyncStorage.setItem('refresh', response.data.refresh)
        console.log('Editado com sucesso')
        router.push('/pages/perfil/perfil')
      }
    } catch (error) {
      if (error.response) {
        console.log('Erro na edição:', error.response)
      } else {
        console.log('Erro na edição:', error.message)
      }
    }
  }

  return (
    <View style={styles.container}>
      <MeuInput
        label={'Nome de usuário: '}
        onChange={setUsuario}
        valor={usuario}
      />

      <MeuInput label={'Email: '} onChange={setEmail} valor={email} />

      <MeuInput label={'Senha: '} onChange={setSenha} valor={senha} />

      <MeuInput label={'Cidade: '} onChange={setCidade} valor={cidade} />
      <Botao texto='Salvar' aoApertar={Editar} />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 40,
    paddingHorizontal: 20
  }
})

import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import Botao from '../../functions/botoes'
import MeuInput from '../../functions/textBox'
import api from '../../functions/api'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'

export default function Editar() {
  const router = useRouter()

  const [usuario, setUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cidade, setCidade] = useState('')
  const [selected, setSelected] = useState({})

  const categorias = [
    { id: "1", nome: "Romance" },
    { id: "2", nome: "Poesia" },
    { id: "3", nome: "Peça Teatral" },
    { id: "4", nome: "Didático" },
    { id: "5", nome: "Não-ficção" },
  ];

  function toggleCategoria(id) {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  const Editar = async () => {
    const generosSelecionados = categorias
      .filter(cat => selected[cat.id])
      .map(cat => cat.id)
    
    try {
      const data = {
        username: usuario,
        password: senha,
        email: email,
        cidade: cidade,
        preferred_genres: generosSelecionados
      };

      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => value !== '' || key === 'preferred_genres')
      );

      const response = await api.patch('usuario/', filteredData)
      // "patch" atualiza campos especificos apenas

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
      <ScrollView showsVerticalScrollIndicator={true}>
      <MeuInput
        label={'Nome de usuário: '}
        onChange={setUsuario}
        valor={usuario}
      />

      <MeuInput label={'Email: '} onChange={setEmail} valor={email} />

      <MeuInput label={'Senha: '} onChange={setSenha} valor={senha} />

      <MeuInput label={'Cidade: '} onChange={setCidade} valor={cidade} />
      
      <Text style={styles.sectionTitle}>Preferências de Gêneros:</Text>
      <FlatList
        data={categorias}
        renderItem={({ item }) => {
          const marcado = selected[item.id] || false;
          return (
            <TouchableOpacity style={styles.genreItem} onPress={() => toggleCategoria(item.id)}>
              <Ionicons
                name={marcado ? "checkbox" : "square-outline"}
                size={24}
                color={marcado ? "#E09F3E" : "#888"}
              />
              <Text style={styles.genreText}>{item.nome}</Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
      
        <Botao texto='Salvar' aoApertar={Editar} />
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 40,
    paddingHorizontal: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333'
  },
  genreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  genreText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333'
  }
})

import { React, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform
} from 'react-native'
import Botao from '../../functions/botoes'
import api from '../../functions/api'
import Ionicons from 'react-native-vector-icons/Ionicons'
import BarraInicial from '../../functions/barra_inicial'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'

export default function Perfil() {
  const router = useRouter()
  const [profileImage, setProfileImage] = useState(
    'https://cdn-icons-png.flaticon.com/512/1999/1999625.png' // fallback default
  )
  const [username, setUsername] = useState('User')

  async function handleEditPicture() {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      alert('Preciso de permissão para acessar as suas imagens!')
      return
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1], // square crop
      quality: 1
    }) //essa parte aqui abre a galeria no celular e o explorador de arquivos no pc

    if (pickerResult.canceled) return

    const image_uri = pickerResult.assets[0].uri
    console.log(image_uri)
    uploadProfilePicture(image_uri)
  }

  async function uploadProfilePicture(uri) {
    const formData = new FormData()

    if (Platform.OS === 'web') {
      const response = await fetch(uri)
      const blob = await response.blob()
      formData.append('profile_picture', blob, 'user.jpg')
    } else {
      formData.append('profile_picture', {
        uri,
        name: 'user.png',
        type: 'image/png'
      })
    }

    try {
      const res = await api.patch('usuario/mudarfoto/', formData)

      if (res.status !== 200) throw new Error('Upload failed')

      const data = await res.data
      setProfileImage(data.image_url + "?t=" + new Date().getTime()); // update the avatar immediately
    } catch (err) {
      console.error(err)
      alert('Falha ao enviar a imagem.')
    }
  }

  useEffect(() => {
    async function fetchUserData() {
      const token = await AsyncStorage.getItem('access')
      console.log(token)

      try {
        const res = await api.get('usuario/')
        console.log(res)

        if (res.status !== 200) throw new Error('Failed to fetch user data')

        const data = await res.data
        if (data.image_url) {
          setProfileImage(data.image_url + "?t=" + new Date().getTime());
        }
        if (data.username) {
          setUsername(data.username)
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchUserData()
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: profileImage }} style={styles.avatar} />
          <TouchableOpacity style={styles.editIcon} onPress={handleEditPicture}>
            <Ionicons name='pencil' size={16} color='#fff' />
          </TouchableOpacity>
        </View>
        <Text style={styles.username}>{username}</Text>
      </View>

      <Botao
        texto='Editar perfil'
        aoApertar={() => router.push('/pages/perfil/editar')}
      />
      <Botao
        texto='Meus livros'
        aoApertar={() => router.push('/pages/perfil/minhasPublicacoes')} />
      <Botao
        texto='Meus pontos'
        aoApertar={() => {
          router.push('/pages/perfil/meusPontos');
        }} />
      <Botao
        texto='Minhas avaliações'
        aoApertar={() => {
          console.log('Navegando para minhasAvaliacoes...');
          router.push('/pages/perfil/minhasAvaliacoes');
        }}
      />
      <Botao
        texto='Sair'
        aoApertar={() => router.push('/pages/login/Login')}
      />

      <BarraInicial />


    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    paddingTop: 40
  },
  avatarContainer: {
    alignItems: 'center', // centers children horizontally
    marginBottom: 20,
    width: '100%' // optional: ensures full width container
  },
  avatarWrapper: {
    position: 'relative', // keeps pencil absolute to image
    alignItems: 'center' // centers Image + pencil
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ddd'
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#e09f3e',
    padding: 5,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff'
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    textAlign: 'center'
  },
  username: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center'
  }
})

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, Platform, Pressable, ActionSheetIOS } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import api from '../../functions/api';
import MeuInput from '../../functions/textBox';

export default function EditarPublicacao() {
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState('emprestimo');
  const [genero, setGenero] = useState('');
  const [bookImage, setBookImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const params = useLocalSearchParams();
  const bookId = params.bookId;

  const getImageBaseUrl = () => {
    return Platform.OS === 'web' ? 'http://localhost:8000' : 'http://192.168.0.102:8000';
  };

  useEffect(() => {
    if (bookId) {
      loadBookData();
    }
  }, [bookId]);

  const loadBookData = async () => {
    try {
      const response = await api.get(`livros/${bookId}/`);
      const book = response.data.book;

      setBookTitle(book.book_title || '');
      setBookAuthor(book.book_author || '');
      setBookPublisher(book.book_publisher || '');
      setBookDescription(book.book_description || '');
      setTipo(book.post_type || 'troca');
      setGenero(book.book_genre || '');
      
      if (book.post_cover) {
        const imageUrl = book.post_cover.startsWith('http') 
          ? book.post_cover 
          : `${getImageBaseUrl()}${book.post_cover}`;
        setBookImage(imageUrl);
      }

      console.log('[EDITAR_FRONTEND] Dados carregados:', book);
    } catch (error) {
      console.error('[EDITAR_FRONTEND] Erro ao carregar dados do livro:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do livro');
    }
  };

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
    setShowCamera(true);
  };

  const handleTakePicture = async () => {
    if (cameraRef.current && cameraReady) {
      const photo = await cameraRef.current.takePictureAsync();
      setBookImage(photo.uri);
      setShowCamera(false);
      setCameraReady(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!result.canceled) {
      setBookImage(result.assets[0].uri);
    }
  };

  const handlePickImageFromCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert("Permissão necessária", "Você precisa conceder acesso à câmera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!result.canceled) {
      setBookImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === "web") {
      handlePickImage();
    } else if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancelar", "Escolher da Galeria", "Tirar Foto"],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            handlePickImage();
          } else if (buttonIndex === 2) {
            handlePickImageFromCamera();
          }
        }
      );
    } else {
      Alert.alert("Escolher foto", "De onde você quer pegar a imagem?", [
        { text: "Galeria", onPress: handlePickImage },
        { text: "Câmera", onPress: handlePickImageFromCamera },
        { text: "Cancelar", style: "cancel" },
      ]);
    }
  };

  const saveChanges = async () => {
    if (!bookTitle.trim()) {
      Alert.alert('Erro', 'O título do livro é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('book_title', bookTitle);
      formData.append('book_author', bookAuthor);
      formData.append('book_publisher', bookPublisher);
      formData.append('book_description', bookDescription);
      formData.append('post_type', tipo);
      formData.append('book_genre', genero);

      if (bookImage && !bookImage.startsWith('http')) {
        formData.append('post_cover', {
          uri: bookImage,
          type: 'image/jpeg',
          name: 'book_cover.jpg',
        });
      }

      console.log('[EDITAR_FRONTEND] Enviando dados para livro ID:', bookId);

      const response = await api.put(`livros/${bookId}/editar/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[EDITAR_FRONTEND] Resposta recebida:', response.data);

      Alert.alert('Sucesso!', 'Livro atualizado com sucesso!', [
        { text: 'OK', onPress: () => {
          // Força atualização da imagem no cache
          if (bookImage) {
            const timestamp = Date.now();
            console.log('🔄 Forçando atualização da imagem com timestamp:', timestamp);
          }
          router.back();
        }}
      ]);
    } catch (error) {
      console.error('[EDITAR_FRONTEND] Erro ao atualizar livro:', error);
      Alert.alert(
        'Erro',
        `Não foi possível atualizar o livro: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (showCamera) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          ref={cameraRef}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
        />
        <TouchableOpacity
          style={[
            styles.captureButton,
            { backgroundColor: cameraReady ? "#E09F3E" : "#ccc" }
          ]}
          onPress={handleTakePicture}
          disabled={!cameraReady}
        >
          <Text style={styles.captureText}>Tirar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setShowCamera(false)}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Livro</Text>

      <Text style={styles.label}>Título do Livro</Text>
      <MeuInput
        valor={bookTitle}
        onChange={setBookTitle}
        placeholder="Digite o título do livro"
      />

      <Text style={styles.label}>Autor</Text>
      <MeuInput
        valor={bookAuthor}
        onChange={setBookAuthor}
        placeholder="Digite o nome do autor"
      />

      <Text style={styles.label}>Tipo de Publicação</Text>
      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[styles.typeButton, tipo === 'emprestimo' && styles.selectedType]}
          onPress={() => setTipo('emprestimo')}
        >
          <Text style={[styles.typeText, tipo === 'emprestimo' && styles.selectedTypeText]}>
            Empréstimo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, tipo === 'troca' && styles.selectedType]}
          onPress={() => setTipo('troca')}
        >
          <Text style={[styles.typeText, tipo === 'troca' && styles.selectedTypeText]}>
            Troca
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Editora</Text>
      <MeuInput
        valor={bookPublisher}
        onChange={setBookPublisher}
        placeholder="Digite o nome da editora"
      />

      <Text style={styles.label}>Descrição</Text>
      <MeuInput
        style={styles.textArea}
        valor={bookDescription}
        onChange={setBookDescription}
        placeholder="Digite uma descrição do livro"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Foto do Livro</Text>
      <TouchableOpacity style={styles.imageContainer} onPress={showImageOptions}>
        {bookImage ? (
          <Image source={{ uri: bookImage }} style={styles.bookImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="camera" size={40} color="#888" />
            <Text style={styles.placeholderText}>Toque para adicionar foto</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => {
          console.log('[DEBUG] Chamando showImageOptions');
          showImageOptions();
        }} 
        style={styles.changePhotoButton}
      >
        <Text style={styles.changePhotoText}>Alterar Foto</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Gênero do livro:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScrollContainer}>
        <View style={styles.genreContainer}>
          {[
            { key: 'romance_narrativa', label: 'Romance/Narrativa' },
            { key: 'poesia', label: 'Poesia' },
            { key: 'peca_teatral', label: 'Peça Teatral' },
            { key: 'didatico', label: 'Didático' },
            { key: 'nao_ficcao', label: 'Não-ficção' }
          ].map((genre) => (
            <TouchableOpacity
              key={genre.key}
              style={[styles.genreButton, genero === genre.key && styles.selectedGenre]}
              onPress={() => setGenero(genero === genre.key ? '' : genre.key)}
            >
              <Text style={[styles.genreText, genero === genre.key && styles.selectedGenreText]}>
                {genre.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.disabledButton]}
        onPress={saveChanges}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#335c67',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 15,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: "#335C67",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#335c67",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  typeContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
  },
  selectedType: {
    borderColor: "#E09F3E",
    backgroundColor: "#E09F3E",
  },
  typeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  selectedTypeText: {
    color: "white",
  },
  genreScrollContainer: {
    marginBottom: 15,
  },
  genreContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
  },
  genreButton: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ddd",
    minWidth: 100,
    alignItems: "center",
  },
  selectedGenre: {
    borderColor: "#335c67",
    backgroundColor: "#335c67",
  },
  genreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  selectedGenreText: {
    color: "white",
  },
  imageContainer: {
    width: 150,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignSelf: 'center',
    marginVertical: 10,
    overflow: 'hidden',
  },
  bookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  captureText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  changePhotoButton: {
    backgroundColor: '#a13b3dff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'center',
    shadowColor: '#1c292cff',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 10,
  },
  changePhotoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
});

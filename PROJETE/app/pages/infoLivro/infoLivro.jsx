import React, { useState, useRef } from "react";
import { View,Text, TouchableOpacity, StyleSheet, Image, StatusBar, ActivityIndicator, Alert, ScrollView, Platform, ActionSheetIOS, Modal} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Botao from "../../functions/botoes";
import MeuInput from "../../functions/textBox";
import BarraInicial from "../../functions/barra_inicial";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import api from '../../functions/api';


export default function CadastroLivro() {
  const router = useRouter();

  // estados para os inputs
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [editora, setEditora] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("emprestimo");
  const [genero, setGenero] = useState("");

  // estados para a câmera
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState("isbn"); // "isbn" ou "foto"
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const cameraRef = useRef(null);

  // estados auxiliares
  const [isbn, setIsbn] = useState(null);
  const [livro, setLivro] = useState(null);
  const [loadingLivro, setLoadingLivro] = useState(false);
  const [fotoLivro, setFotoLivro] = useState(null);
  const [rating, setRating] = useState(0);

  // salva livro no backend
  const SalvarLivro = async () => {
    const formData = new FormData();
    formData.append("book_title", titulo);
    formData.append("book_author", autor);
    formData.append("book_publisher", editora);
    formData.append("book_description", descricao);
    formData.append("book_genre", genero);
    formData.append("post_type", tipo);
    formData.append("book_rating", rating); // Adiciona a avaliação

    if (fotoLivro) {

      
      if (Platform.OS === 'web') {
        try {
          const response = await fetch(fotoLivro);
          const blob = await response.blob();
          const file = new File([blob], 'livro.jpg', { type: 'image/jpeg' });
          formData.append('post_cover', file);
        } catch (error) {
          // Erro ao processar imagem web
        }
      } else {
        // Android e iOS
        formData.append('post_cover', {
          uri: fotoLivro,
          type: 'image/jpeg',
          name: 'livro.jpg'
        });
      }
    }



    try {
      const response = await api.post('livros/cadastrar/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      Alert.alert("Sucesso", "Livro cadastrado com sucesso!");

      /*setTimeout(() => {
        Alert.alert(
          "📚 Novo livro disponível!",
          `${titulo} foi adicionado por ${response.data.user || "um usuário"}`,
          [{ text: "OK" }]
        );

      }, 2000);*/

      router.push('/pages/principal/principal');
    } catch (error) {


      if (error.response) {
        let errorMessage = "Erro desconhecido";
        if (error.response.status === 500) {
          errorMessage = "Erro interno do servidor. Verifique os logs do Django.";
        } else if (typeof error.response.data === "string") {
          errorMessage = "Erro no servidor";
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
        Alert.alert("Erro", errorMessage);
      } else {
        Alert.alert("Erro", error.message);
      }
    }
  };

  const handleStarPress = (value) => setRating(value);

  const handleOpenCamera = async (mode) => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permissão necessária", "Você precisa conceder acesso à câmera.");
        return;
      }
    }
    setCameraMode(mode);
    setCameraError(false);
    setShowCamera(true);
    setLivro(null);
  };

  // abre opções de foto
  const handleChoosePhoto = () => {
    if (Platform.OS === "web") {
      pickImageFromLibrary();
    } else if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancelar", "Escolher da Galeria", "Tirar Foto"],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImageFromLibrary();
          } else if (buttonIndex === 2) {
            pickImageFromCamera();
          }
        }
      );
    } else {
      Alert.alert("Escolher foto", "De onde você quer pegar a imagem?", [
        { text: "Galeria", onPress: pickImageFromLibrary },
        { text: "Câmera", onPress: pickImageFromCamera },
        { text: "Cancelar", style: "cancel" },
      ]);
    }
  };

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!result.canceled) {
      setFotoLivro(result.assets[0].uri);
    }
  };

  const pickImageFromCamera = async () => {
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
      setFotoLivro(result.assets[0].uri);
    }
  };

  // QUANDO O ISBN FOR ESCANEADO
  const [scanned, setScanned] = useState(false);

  function handleBarCodeScanned({ type, data }) {
    setScanned(true); // bloqueia novas leituras

    setIsbn(data);
    setShowCamera(false);
    buscarLivro(data);
  };

  const buscarLivro = async (isbn) => {
    setLoadingLivro(true);
    try {
      const response = await api.get("isbn/", { params: { isbn } });
      const data = response.data;

      if (data) {
        setTitulo(data.title || "");
        setAutor(data.author || "");
        setEditora(data.publisher || "");
        setDescricao(data.description || "");
        
        setLivro({
          titulo: data.title || "Título não encontrado",
          autor: data.author || "Autor não encontrado",
        });

        // Fecha automaticamente a câmera quando encontra o livro
        setModalIsVisible(false);
        setScanned(false);
        
        Alert.alert("Livro encontrado!", "As informações foram preenchidas automaticamente. Preencha as informações restantes e salve o livro.");
      } else {
        Alert.alert("Livro não encontrado", "Não foi possível encontrar informações para este ISBN.");
      }
    } catch (error) {
      // Erro ao buscar livro
      Alert.alert("Erro", "Falha ao buscar dados do livro.", "Tente novamente. Se não der certo provavelmente seu livro não está em nossa API",
        "Então você pode preencher os dados manualmente."
      );
    } finally {
      setLoadingLivro(false);
    }
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        setFotoLivro(photo.uri);
        setShowCamera(false);
      } catch (error) {
        // Erro ao tirar foto
      }
    }
  };
 

  // Tela principal
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <StatusBar hidden />
        <Text style={styles.header}>Digite as informações do livro</Text>

        <MeuInput width={80} label="Título do Livro:" valor={titulo} onChange={setTitulo} />
        <MeuInput width={80} label="Autor(a):" valor={autor} onChange={setAutor} />
        <MeuInput width={80} label="Editora" valor={editora} onChange={setEditora} />
        <MeuInput width={80} label="Descrição" valor={descricao} onChange={setDescricao} />

        {loadingLivro && <ActivityIndicator size="large" color="#E09F3E" />}
        {livro && (
          <View style={{ marginTop: 20, alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 10, marginHorizontal: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#E09F3E", marginBottom: 10 }}>Livro encontrado:</Text>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>{livro.titulo}</Text>
            <Text style={{ fontSize: 12, color: "#666" }}>{livro.autor}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Tipo de publicação:</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              tipo === 'emprestimo' && styles.selectedType
            ]}
            onPress={() => setTipo('emprestimo')}
          >
            <Text style={[
              styles.typeText,
              tipo === 'emprestimo' && styles.selectedTypeText
            ]}>Empréstimo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              tipo === 'troca' && styles.selectedType
            ]}
            onPress={() => setTipo('troca')}
          >
            <Text style={[
              styles.typeText,
              tipo === 'troca' && styles.selectedTypeText
            ]}>Troca</Text>
          </TouchableOpacity>
        </View>

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
                style={[
                  styles.genreButton,
                  genero === genre.key && styles.selectedGenre
                ]}
                onPress={() => setGenero(genero === genre.key ? '' : genre.key)}
              >
                <Text style={[
                  styles.genreText,
                  genero === genre.key && styles.selectedGenreText
                ]}>{genre.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
              <Ionicons
                name={star <= rating ? "star" : "star-outline"}
                size={28}
                color="#E09F3E"
              />
            </TouchableOpacity>
          ))}
        </View>

        {fotoLivro && (
          <Image
            source={{ uri: fotoLivro }}
            style={{ width: 150, height: 200, borderRadius: 8, marginTop: 10 }}
          />
        )}

      <Botao texto="Ler ISBN" aoApertar={() => {
        setModalIsVisible(true);
        setScanned(false); // Reset antes de abrir
      }} />
        <Modal visible={modalIsVisible} animationType="slide">
          <View style={{ flex: 1 }}>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["ean13"]
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalIsVisible(false);
                setScanned(false); // Reset para permitir nova leitura
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Modal><Botao texto="Adicionar Foto do Livro" aoApertar={handleChoosePhoto} />
<TouchableOpacity onPress={SalvarLivro} style={styles.botaoSalvar}>
  <Text style={styles.textoBotao}>Salvar Livro</Text>
</TouchableOpacity>
      
    </ScrollView>
      <BarraInicial />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 20,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E09F3E",
    marginBottom: 20,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginVertical: 10,
    justifyContent: "center",
  },
  ouTexto: {
    color: "#E09F3E",
    fontWeight: "bold",
    marginVertical: 5,
    textAlign: "center",
  },
  botaoSalvar: {
    backgroundColor: '#a13b3dff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 16,
    // Sombra no iOS
    shadowColor: '#1c292cff',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // Sombra no Android
    elevation: 10,
  },
  textoBotao: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  tipoContainer: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  tipoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  tipoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  tipoButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E09F3E',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  tipoButtonSelected: {
    backgroundColor: '#E09F3E',
  },
  tipoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E09F3E',
  },
  tipoButtonTextSelected: {
    color: '#fff',
  },
  captureButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#E09F3E",
    padding: 15,
    borderRadius: 50,
  },
  errorButton: {
    backgroundColor: "#9e2a2b",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
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
    paddingVertical: 15,
    paddingHorizontal: 12,
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
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
});

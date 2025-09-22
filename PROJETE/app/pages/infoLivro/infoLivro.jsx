import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, ActivityIndicator, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Botao from "../../functions/botoes";
import MeuInput from "../../functions/textBox";
import BarraInicial from "../../functions/barra_inicial";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import api from '../../functions/api'


export default function CadastroLivro() {
  const router = useRouter();

  // estados para os inputs
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [editora, setEditora] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("troca")

  // estados para a câmera
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState("isbn"); // "isbn" ou "foto"
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const cameraRef = useRef(null);

  // estados auxiliares
  const [isbn, setIsbn] = useState(null);
  const [livro, setLivro] = useState(null);
  const [loadingLivro, setLoadingLivro] = useState(false);
  const [fotoLivro, setFotoLivro] = useState(null);
  const [rating, setRating] = useState(0);


  // salva livro no backend
  const SalvarLivro = async () => {
    console.log("botão apertado");
    console.log("Escolhido", tipo, tipo, tipo);

    try {
      const response = await api.post("livros/cadastrar/", {
        book_title: titulo,
        book_author: autor,
        book_publisher: editora,
        book_publication_date: data,
        book_description: descricao,
        post_type: tipo,
        post_location_city: "São Paulo",
      });

      Alert.alert("Sucesso", "Livro cadastrado com sucesso!");
      
      // Simula notificação para outros usuários
      setTimeout(() => {
        Alert.alert(
          "📚 Novo livro disponível!", 
          `${titulo} foi adicionado por ${response.data.user || 'um usuário'}`,
          [{text: 'OK'}]
        );
      }, 2000);
      
      console.log("salvo");
      router.push('/pages/principal/principal')
    } catch (error) {
      console.log("Erro completo:", error);
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Erro no cadastro:", error.response.data);
        
        let errorMessage = "Erro desconhecido";
        if (error.response.status === 500) {
          errorMessage = "Erro interno do servidor. Verifique os logs do Django.";
        } else if (typeof error.response.data === 'string') {
          errorMessage = "Erro no servidor";
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
        
        Alert.alert("Erro", errorMessage);
      } else {
        console.log("Erro inesperado:", error.message);
        Alert.alert("Erro", error.message);
      }
    }
  };

  const handleStarPress = (value) => setRating(value);

  const handleOpenCamera = async (mode) => {
    if (!permission?.granted) {
      await requestPermission();
    }
    setCameraMode(mode);
    setCameraError(false);
    setShowCamera(true);
    setLivro(null);
  };

  // quando ISBN é escaneado
  const handleBarCodeScanned = ({ data }) => {
    setIsbn(data);
    setShowCamera(false);
    buscarLivro(data);
  };

  const buscarLivro = async (isbn) => {
    setLoadingLivro(true);
    try {
      const response = api.get('isbn/',
        {
          params: {
            isbn: isbn
          }
        }
      )
      const data = await response.data;

      if (data) {
        setLivro({
          titulo: data.title || "Título desconhecido",
          autor: data.authors ? data.authors.map((a) => a.name).join(", ") : "Autor desconhecido",
          capa: data.cover?.medium || null,
        });
      } else {
        alert("Livro não encontrado", "Não foi possível encontrar informações para este ISBN.");
      }
    } catch (error) {
      alert("Erro", "Falha ao buscar dados do livro.");
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
        console.log("Erro ao tirar foto:", error);
      }
    }
  };

  // Tela da câmera
  if (showCamera) {
    return (
      <View style={{ flex: 1 }}>
        {!cameraError ? (
          <>
            <CameraView
              style={{ flex: 1, width: "100%" }}
              ref={cameraRef}
              facing="back"
              onCameraReady={() => setCameraReady(true)}
              onMountError={() => setCameraError(true)}
              onBarcodeScanned={cameraMode === "isbn" ? handleBarCodeScanned : undefined}
            />

            {!cameraReady && (
              <ActivityIndicator
                size="large"
                color="#E09F3E"
                style={{
                  position: "absolute",
                  top: "50%",
                  alignSelf: "center",
                }}
              />
            )}

            {cameraMode === "foto" && cameraReady && (
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePicture}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>📸 Capturar</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ marginBottom: 10 }}>Câmera não disponível.</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Tela principal
  return (

    <View style={styles.container}>
      <ScrollView>
        <StatusBar hidden />
        <Text style={styles.header}>Digite as informações do livro</Text>

        <MeuInput width={80} label="Título do Livro:" value={titulo} onChange={setTitulo} />
        <MeuInput width={80} label="Autor(a):" value={autor} onChange={setAutor} />
        <MeuInput width={80} label="Editora" value={editora} onChange={setEditora} />
        <MeuInput width={80} label="Data de publicação" value={data} onChange={setData} />
        <MeuInput width={80} label="Descrição" value={descricao} onChange={setDescricao} />
        {/* Seletor de tipo */}
        <Text style={styles.tipoLabel}>Tipo de publicação:</Text>
        <View style={styles.tipoContainer}>
          <TouchableOpacity 
            style={[styles.tipoButton, tipo === 'troca' && styles.tipoButtonSelected]}
            onPress={() => setTipo('troca')}
          >
            <Text style={[styles.tipoText, tipo === 'troca' && styles.tipoTextSelected]}>Troca</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tipoButton, tipo === 'emprestimo' && styles.tipoButtonSelected]}
            onPress={() => setTipo('emprestimo')}
          >
            <Text style={[styles.tipoText, tipo === 'emprestimo' && styles.tipoTextSelected]}>Empréstimo</Text>
          </TouchableOpacity>
        </View>
        {/* estrelas de avaliação */}
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

        {/* mostra foto capturada */}
        {fotoLivro && (
          <Image
            source={{ uri: fotoLivro }}
            style={{ width: 150, height: 200, borderRadius: 8, marginTop: 10 }}
          />
        )}

        {/* mostra informações do livro via ISBN */}
        {loadingLivro && <ActivityIndicator size="large" color="#E09F3E" />}
        {livro && (
          <View style={{ marginTop: 20, alignItems: "center" }}>
            {livro.capa && (
              <Image
                source={{ uri: livro.capa }}
                style={{ width: 100, height: 150, borderRadius: 8, marginBottom: 10 }}
              />
            )}
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>{livro.titulo}</Text>
            <Text>{livro.autor}</Text>
          </View>
        )}

        <Botao texto="Salvar Livro" aoApertar={SalvarLivro} />

        <Text style={styles.ouTexto}>ou</Text>

        {/* botões para abrir câmera */}
        <Botao texto="Ler ISBN" aoApertar={() => handleOpenCamera("isbn")} />
        <Botao texto="Tirar Foto" aoApertar={() => handleOpenCamera("foto")} />
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
  tipoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  tipoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  tipoButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E09F3E',
    backgroundColor: 'transparent',
  },
  tipoButtonSelected: {
    backgroundColor: '#E09F3E',
  },
  tipoText: {
    color: '#E09F3E',
    fontWeight: 'bold',
  },
  tipoTextSelected: {
    color: 'white',
  },
});
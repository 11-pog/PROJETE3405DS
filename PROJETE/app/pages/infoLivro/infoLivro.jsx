import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import Botao from "../../functions/botoes";
import MeuInput from "../../functions/textBox";
import BarraInicial from "../../functions/barra_inicial";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRoute } from "@react-navigation/native";


export default function CadastroLivro() {

//iniciando o post para pegar informações do livro
  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [editora, setEditora] = useState('')
  const [data, setData] = useState('')
  const [descricao, setDescricao] = useState('')
  
  const SalvarLivro = async () => {
    console.log("botão apertado");
    try{
      const response = await axios.post('http://127.0.0.1:8000/api/cadastrarlivro/',{
          book_title: titulo,
          book_author: autor,
          book_publisher: editora,
          book_publication_date: data,
          book_description: descricao,
      });
       Alert.alert("Sucesso", "Livro cadastrado com sucesso!");
      console.log("salvo");
    
  }  catch (error) {
  if (error.response) {
    console.log("Erro no cadastro:", error.response.data);
  } else {
    console.log("Erro inesperado:", error.message);
  }
}
}//fim da const


  const [rating, setRating] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [isbn, setIsbn] = useState(null);
  const [livro, setLivro] = useState(null);
  const [loadingLivro, setLoadingLivro] = useState(false);

  const cameraRef = useRef(null);

  const handleStarPress = (value) => setRating(value);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
    setCameraError(false);
    setShowCamera(true);
    setLivro(null); // reseta dados anteriores
  };

  // Quando o ISBN é escaneado
  const handleBarCodeScanned = ({ data }) => {
    setIsbn(data);
    setShowCamera(false);
    buscarLivro(data);
  };

  // Buscar informações do livro pelo ISBN na Open Library API
  const buscarLivro = async (isbn) => {
    setLoadingLivro(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/isbn/${isbn}.json`
      );
      const data = await response.json();
      const bookData = data[`ISBN:${isbn}`];
      if (bookData) {
        setLivro({
          titulo: bookData.title || "Título desconhecido",
          autor: bookData.authors ? bookData.authors.map(a => a.name).join(", ") : "Autor desconhecido",
          capa: bookData.cover?.medium || null,
        });
      } else {
        Alert.alert("Livro não encontrado", "Não foi possível encontrar informações para este ISBN.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao buscar dados do livro.");
    } 
  };

   // Tela de cadastro de livro
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Text style={styles.header}>Digite as informações do livro</Text>

      <MeuInput width={80} label="Título do Livro:" value={titulo} onChange={setTitulo}/>
      <MeuInput width={80} label="Autor(a):" value={autor} onChange={setAutor} />
      <MeuInput width={80} label="Editora" value={editora} onChange={setEditora} />
      <MeuInput width={80} label="Data de publicação" value={data} onChange={setData} />
      <MeuInput width={80} label="Descrição" value={descricao} onChange={setDescricao} />



      {/* Estrelas de avaliação */}
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

      <Botao texto="Salvar informações" aoApertar={SalvarLivro}/>
       
      <Text style={styles.ouTexto}>ou</Text>

      <Botao texto="Ler ISBN" aoApertar={handleOpenCamera} />



      {/* Dados do livro carregado */}
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

      <BarraInicial />
    </View>
  );

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
              onBarcodeScanned={handleBarCodeScanned}
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
          </>
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ marginBottom: 10 }}>Câmera não disponível.</Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#9e2a2b",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
              onPress={() => setShowCamera(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Tela de cadastro de livro
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Text style={styles.header}>Digite as informações do livro</Text>

     <MeuInput width={80} label="Título do Livro:" value={titulo} onChange={setTitulo}/>
      <MeuInput width={80} label="Autor(a):" value={autor} onChange={setAutor} />
      <MeuInput width={80} label="Editora" value={editora} onChange={setEditora} />
      <MeuInput width={80} label="Data de publicação" value={data} onChange={setData} />
      <MeuInput width={80} label="Descrição" value={descricao} onChange={setDescricao} />

      {/* Estrelas de avaliação */}
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

      {/* Dados do livro carregado */}
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
      <Botao texto="Salvar Livro" onPress={SalvarLivro} />  
      
      <Text style={styles.ouTexto}>ou</Text>

      <Botao texto="Ler ISBN" onPress={handleOpenCamera} />
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
  label: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
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
});

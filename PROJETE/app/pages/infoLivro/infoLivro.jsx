import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Botao from "../../functions/botoes";
import MeuInput from "../../functions/textBox";
import BarraInicial from "../../functions/barra_inicial";
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CadastroLivro() {
  const [rating, setRating] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const cameraRef = useRef(null);

  const handleStarPress = (value) => setRating(value);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
    setCameraError(false);
    setShowCamera(true);
  };

  const handleTakePicture = async () => {
    if (cameraRef.current && cameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setPhotoUri(photo.uri);
        setShowCamera(false);
        setCameraReady(false);
      } catch (e) {
        Alert.alert("Erro", "Não foi possível tirar a foto.");
      }
    } else {
      Alert.alert("Atenção", "A câmera ainda não está pronta ou não disponível.");
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
            />

            {/* Indicador de carregamento */}
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

            
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: 40,
                alignSelf: "center",
                width: 70,
                height: 70,
                borderRadius: 35,
                borderWidth: 4,
                backgroundColor: "#fff",
                justifyContent: "center",
                alignItems: "center",
                opacity: cameraReady ? 1 : 0.5,
              }}
              onPress={handleTakePicture}
              disabled={!cameraReady}
            >
              <Ionicons name="camera" size={30} color="#9e2a2b" />
            </TouchableOpacity>
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

      <MeuInput width={80} label="Título do Livro:" />
      <MeuInput width={80} label="Autor(a):" />
      <MeuInput width={80} label="Troca/Empréstimo:" />

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

      {/* Foto do livro */}
      <Text style={styles.label}>Foto do Livro:</Text>
      <TouchableOpacity style={styles.fotoContainer} onPress={handleOpenCamera}>
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={{ width: "100%", height: "100%", borderRadius: 8 }}
          />
        ) : (
          <Ionicons name="camera" size={30} color="#888" />
        )}
      </TouchableOpacity>

      <Text style={styles.ouTexto}>ou</Text>

      <Botao texto="Ler ISBN" />
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
  fotoContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  ouTexto: {
    color: "#E09F3E",
    fontWeight: "bold",
    marginVertical: 5,
    textAlign: "center",
  },
});

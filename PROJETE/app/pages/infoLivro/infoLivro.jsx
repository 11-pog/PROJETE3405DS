import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from "react-native";
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
  const cameraRef = useRef(null);

  const handleStarPress = (value) => setRating(value);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      await requestPermission();
    }
    setShowCamera(true);
  };

  const handleTakePicture = async () => {
    if (cameraRef.current && cameraReady) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
      setShowCamera(false);
      setCameraReady(false); // reset para próxima abertura
    } else {
      alert("A câmera ainda não está pronta!");
    }
  };

  // Tela da câmera
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
      </View>
    );
  }

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
          <Image source={{ uri: photoUri }} style={{ width: "100%", height: "100%", borderRadius: 8 }} />
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
  captureButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  captureText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

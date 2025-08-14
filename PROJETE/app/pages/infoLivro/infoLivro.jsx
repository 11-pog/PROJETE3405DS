import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Botao from "../../functions/botoes";
import MeuInput from "../../functions/textBox";
import BarraInicial from "../../functions/barra_inicial";

export default function CadastroLivro() {
  const [rating, setRating] = useState(0);

  const handleStarPress = (value) => {
    setRating(value);
  };

  return (
    <View style={styles.container}>
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
      <TouchableOpacity style={styles.fotoContainer}>
        <Ionicons name="camera" size={30} color="#888" />
      </TouchableOpacity>

      <Text style={styles.ouTexto}>ou</Text>

      <Botao texto="Ler ISBN" />
      <BarraInicial/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    paddingTop: 20,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E09F3E",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    marginLeft: "10%",
    fontSize: 14,
    color: "#333",
    marginTop: 1,
  },
  starsContainer: {
    flexDirection: "row",
    marginVertical: 10,
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
  },
  
});

import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Botao from "../../functions/botoes";
import api from "../../functions/api";

export default function Categorias() {
  const [selected, setSelected] = useState({});
  const router = useRouter();

  const categorias = [
    { id: "1", nome: "Romance", descricao: "Histórias contadas em prosa, com personagens e enredo. Não é só romance amoroso, mas também aventura, policial, fantasia, etc." },
    { id: "2", nome: "Poesia", descricao: "Textos que expressam sentimentos e ideias em forma artística, geralmente em versos." },
    { id: "3", nome: "Peça Teatral", descricao: "Escritos para serem representados no palco, com falas e diálogos entre personagens." },
    { id: "4", nome: "Didático", descricao: "Textos feitos para ensinar ou transmitir uma ideia. Inclui ensaios, sermões, discursos." },
    { id: "5", nome: "Não-ficção", descricao: "Relatos de fatos reais, memórias, biografias, diários, crônicas de acontecimentos, livros de viagem." },
  ];

  function toggleCategoria(id) {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id], // alterna true/false
    }));
  }

  const salvarPreferencias = async () => {
    try {
      const generosSelecionados = categorias
        .filter(cat => selected[cat.id])
        .map(cat => cat.id);

      await api.patch("usuario/", {
        preferred_genres: generosSelecionados
      });

      router.push("/pages/principal/principal");
    } catch (error) {
      Alert.alert("Erro", "Erro ao salvar preferências");
    }
  };

  function renderCategoria({ item }) {
    const marcado = selected[item.id] || false;

    return (
      <TouchableOpacity style={styles.card} onPress={() => toggleCategoria(item.id)}>
        {/* Ícone de checkbox */}
        <Ionicons
          name={marcado ? "checkbox" : "square-outline"}
          size={26}
          color={marcado ? "#E09F3E" : "#888"}
          style={{ marginRight: 12 }}
        />

        {/* Conteúdo */}
        <View style={styles.content}>
          <Text style={styles.title}>{item.nome}</Text>
          <Text style={styles.desc}>{item.descricao}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Lista de categorias */}
      <FlatList
        data={categorias}
        renderItem={renderCategoria}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      <View style={{ padding: 20 }}>
        <Botao
          texto="Cadastrar"
          aoApertar={salvarPreferencias}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 50,
    justifyContent: "space-between",
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1c1c1c",
  },
  desc: {
    marginTop: 2,
    fontSize: 12,
    color: "#666",
  },
});

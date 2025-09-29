import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Botao from '../../functions/botoes';

export default function Categorias() {
  const [selected, setSelected] = useState({});
  const router = useRouter(); 

  const categorias = [
    { id: "1", nome: "Romance", descricao: "Livros de romance (não necessariamente românticos) e narrativa." },
    { id: "2", nome: "Poesia", descricao: "Versos e poemas." },
    { id: "3", nome: "Peça Teatral", descricao: "Textos de teatro e roteiros." },
    { id: "4", nome: "Didático", descricao: "Materiais educativos e escolares." },
    { id: "5", nome: "Não-ficção", descricao: "Biografias, história e ciência." },
  ];

  function toggleCategoria(id) {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id], // alterna true/false
    }));
  }

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
          aoApertar={() => router.push("/pages/principal/principal")}
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

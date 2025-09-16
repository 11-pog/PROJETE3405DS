import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BarraInicial from '../../functions/barra_inicial';
import axios from 'axios';
import { router } from 'expo-router'



export default function FeedLivros() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchBooks() {
    try {
      const response = await axios.get('livros/');
      setBooks(response.data); // lista de livros
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
      return [];
    }

  }

  useEffect(() => {

    fetchBooks();
  }, []);

  function renderBook({ item }) {
    return (
      <View style={styles.card}>
        {/* Imagem do livro */}
        <Image source={{ uri: item.cover }} style={styles.image} />

        {/* Título e tipo */}
        <View style={styles.content}>
          <Pressable
            onPress={() => router.push({
              pathname: '/pages/infoIsolado/infoisolado',
              params: {
                id: item.id,
                title: item.book_title,
                author: item.book_author,
                description: item.book_description, // só se tiver na API
                cover: item.cover
              }
            })}
          >
            <Text style={styles.title}>
              {item.book_title} - {item.book_author}
            </Text>
          </Pressable>

          <Text style={styles.tipoAcao}>
            {
              (() => {
                if (item.post_type === "TROCA") {
                  return "Troca";
                } else {
                  return "Empréstimo";
                }
              })()
            }
          </Text>
        </View>

        {/* Botões de interação */}
        <View style={styles.actions}>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={22} color="#9e2a2b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.commentBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#E09F3E" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Campo de pesquisa no topo */}
      <View style={styles.pesquisarArea}>
        <TextInput
          placeholder="Buscar um livro"
          placeholderTextColor="#333"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.iconePesquisa}
          onPress={() => console.log('Pesquisar clicado')}
        >
          <Ionicons name="search" size={22} color="#9e2a2b" />
        </TouchableOpacity>
      </View>


      {/* lista de livros */}
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={fetchBooks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && <ActivityIndicator size="large" />}
        contentContainerStyle={styles.listContent}
      />

      {/* Barra inferior */}
      <BarraInicial />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 60, // espaço para a barra inferior
  },
  listContent: {
    paddingBottom: 80, // evita sobreposição com a barra inferior
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#e7dedeff',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  image: {
    width: 55,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#ddd',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1c1c1c',
  },
  tipoAcao: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
  actions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  chatBtn: {
    padding: 6,
    borderRadius: 8,
  },
  pesquisarArea: {
    position: 'relative',
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 40, // espaço para o ícone
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconePesquisa: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -11 }], // centraliza o ícone verticalmente
  },
});

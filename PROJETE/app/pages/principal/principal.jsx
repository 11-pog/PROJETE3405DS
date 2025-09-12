import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchLivrosMock } from '../../mocks/mockBooks';
import BarraInicial from '../../functions/barra_inicial';

const PAGE_SIZE = 10;

export default function FeedLivros() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function fetchBooks() {
    if (loading || !hasMore) return;

    setLoading(true);
    const newBooks = await fetchLivrosMock(page, PAGE_SIZE);

    if (newBooks.length > 0) {
      setBooks((prevBooks) => [...prevBooks, ...newBooks]);
      setPage((prevPage) => prevPage + 1);
    } else {
      setHasMore(false);
    }

    setLoading(false);
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
          <Text style={styles.title}>{item.title} - {item.author}</Text>
          <Text style={styles.tipoAcao}>Empréstimo / Troca</Text>
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
      {/* Ícone de pesquisa no topo */}
      <View style={styles.pesquisarBtn}>
        <TouchableOpacity onPress={() => console.log('Pesquisar clicado')}>
          <Ionicons name="search" size={28} color="#9e2a2b" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
          <Text style={styles.textBusca}>Buscar livro</Text>
        </View>

      {/* Lista de livros */}
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
    backgroundColor: '#fff',
    paddingBottom: 60, // espaço para a barra inferior
  },
  pesquisarBtn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 5,
    marginVertical: 8,
    marginHorizontal: 35,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#e7dedeff',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 3,
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
  textBusca: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 4,
    fontSize: 15,
    color: '#888',
  },
});

import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchLivrosMock } from '../../mocks/mockBooks';
import BarraInicial from '../../functions/barra_inicial';

// quantidade de livros por pagina 
const PAGE_SIZE = 10;

export default function FeedLivros() {
  // livros carregados até o momento
  const [books, setBooks] = useState([]);
  // pagina atual (para saber qual lote de livros buscar)
  const [page, setPage] = useState(1);
  // controle de carregamento pra evitar bug
  const [loading, setLoading] = useState(false);
  // verifica se ainda tem mais livros para carregar
  const [hasMore, setHasMore] = useState(true);

  // função que busca mais livros e atualiza a lista
  async function fetchBooks() {
    // nao busca novamente caso já esteja carregando ou nao tenha mais livros
    if (loading || !hasMore) return;

    setLoading(true);

    // isso aqui simula uma API
    const newBooks = await fetchLivrosMock(page, PAGE_SIZE);

    if (newBooks.length > 0) {
      // adiciona os novos livros à lista existente
      setBooks((prevBooks) => [...prevBooks, ...newBooks]);
      setPage((prevPage) => prevPage + 1);
    } else {
      // se não existir livros novos, marca que chegou ao fim
      setHasMore(false);
    }

    setLoading(false);
  }

  // carrega a primeira página ao montar o componente
  useEffect(() => {
    fetchBooks();
  }, []);

  // renderiza cada livro
  function renderBook({ item }) {
    return (
      <View style={styles.card}>
        {/* imagem de capa */}
        <Image source={{ uri: item.cover }} style={styles.image} />

        {/* título, autor e tipo */}
        <View style={styles.content}>
          <Text style={styles.title}>{item.title} - {item.author}</Text>
          <Text style={styles.tipoAcao}>Empréstimo / Troca</Text>
        </View>

        {/* botões de interação */}
        <View style={styles.actions}>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={22} color="#9e2a2b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.commentBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color='#E09F3E' />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={fetchBooks} // carrega mais livros ao chegar no final
        onEndReachedThreshold={0.5} // define quando carregar (0.5 = metade da tela antes do fim)
        ListFooterComponent={loading && <ActivityIndicator size="large" />} // mostra indicador de carregamento
      />
      <BarraInicial />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60,
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
    backgroundColor: 'transparent',
  },
});

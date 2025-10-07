import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, FlatList, Dimensions, LayoutAnimation, Platform, UIManager, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BarraInicial from '../../functions/barra_inicial';
import { fetchLivrosMock } from '../../mocks/mockBooks';
import { router, usePathname } from 'expo-router'
import api from '../../functions/api';

// Função para obter a URL base correta para imagens
const getImageBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  } else {
    return 'http://192.168.0.102:8000';
  }
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Habilitar animação no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Favoritos() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [nextPage, setNextPage] = useState(null)
  const path_back = usePathname()

  const fetchBooks = useCallback(async (url = "usuario/favoritos/", isFirstLoad = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await api.get(url);
      
      if (isFirstLoad) {
        setBooks(response.data.results);
      } else {
        setBooks((prev) => [...prev, ...response.data.results]);
      }
      
      setNextPage(response.data.next);
      console.log(response.data)
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    } finally {
      setLoading(false);
    }
  }, [loading])

  function handleLoadMore() {
    if (nextPage) {
      fetchBooks(nextPage);
    }
  }

  useEffect(() => {
    fetchBooks("usuario/favoritos/", true)
  }, []);

  const removeFavorite = (id) => {
    // Animação de remoção
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBooks((prev) => prev.filter((book) => book.id !== id));

    api.delete(`livros/${id}/favoritar/`)
  };

  const renderBook = ({ item }) => (
    <View style={styles.card}>
      <Pressable onPress={() => router.push({
        pathname: '/pages/infoIsolado/infoisolado',
        params: {
          id: item.id,
          path_back: path_back
        
        }
      })}>
        {/* Capa */}
        {item.post_cover && !item.post_cover.includes('default_thumbnail') ? (
          <Image 
            source={{ uri: item.post_cover.startsWith('http') ? item.post_cover : getImageBaseUrl() + item.post_cover }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="book" size={40} color="#777" />
          </View>
        )}

        {/* Texto */}
        <Text style={styles.title} numberOfLines={2}>
          {item.book_title} - {item.book_author}
        </Text>
        <Text style={styles.tipoAcao}>
          {item.post_type === 'Troca' ? 'Empréstimo' : 'Troca'}
        </Text>

        {/* Ações */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.actionBtn}>
            <Ionicons name="heart" size={20} color="#9e2a2b" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => console.log('Ir para chat')} style={styles.actionBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#E09F3E" />
          </TouchableOpacity>
        </View>
      </Pressable>
    </View >
  );


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="heart" size={24} color="#9e2a2b" style={{ marginRight: 6 }} />
        <Text style={styles.headerText}>Meus Favoritos ({books.length})</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        numColumns={2}
        ListFooterComponent={loading && <ActivityIndicator size="large" />}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.listContent}
      />

      <BarraInicial />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    paddingBottom: 80, // evita sobreposição com a barra inferior
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1c',
  },
  card: {

    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    width: CARD_WIDTH,
    alignItems: 'center',
    shadowColor: '#e7dede',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 1.0, // was 1.2
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#ddd',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1c1c1c',
    textAlign: 'center',
  },
  tipoAcao: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 6,
    width: '100%',
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#bbb',
  },

});

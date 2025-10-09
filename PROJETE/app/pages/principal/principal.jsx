import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity, TextInput, Pressable, Alert, RefreshControl, TextComponent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BarraInicial from '../../functions/barra_inicial';
import { router, usePathname } from 'expo-router'
import api, { BASE_URL } from '../../functions/api'
import { Platform } from 'react-native'

// Função para obter a URL base correta para imagens
const getImageBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  } else {
    return 'http://192.168.0.102:8000';
  }
};
import { useNotifications } from '../../hooks/useNotifications'
import { useFocusEffect } from '@react-navigation/native'

export default function FeedLivros() {
  const [books, setBooks] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false); // para indicar se o usuário está no modo busca
  const [refreshing, setRefreshing] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  const { notifications } = useNotifications();
  const path_back = usePathname()

  // Funções de busca com useCallback para evitar re-renders
  const performSearch = useCallback(async (query) => {


    setIsSearching(true);
    setLoading(true);

    try {
      const response = await api.post('search/livros/', {
        book_title: query
      });



      if (response.data.livros) {
        const searchResults = response.data.livros.map(book => ({
          ...book,
          is_saved: false
        }));
        setBooks(searchResults);
        setNextPage(null);
      }
    } catch (error) {
      // Erro na busca
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetToFeed = useCallback(async () => {

    setIsSearching(false);
    setLoading(true);

    try {
      const response = await api.get("livros/feed/");
      if (response.data?.results) {
        setBooks(response.data.results);
        setNextPage(response.data.next);
      }
    } catch (error) {
      // Erro ao carregar feed
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBooks = useCallback(async (url = "livros/feed/", isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await api.get(url);
      if (response.data && response.data.results) {
        if (isRefresh || url === "livros/feed/") {
          // Se é refresh ou primeira página, substitui
          setBooks(response.data.results);
        } else {
          // Se é paginação, adiciona
          setBooks((prev) => [...prev, ...response.data.results]);
        }
        setNextPage(response.data.next);
      }
    } catch (error) {
      // Erro ao buscar livros
      // Se for erro de servidor, mostra uma mensagem mais amigável
      if (error.response?.status === 500) {
        Alert.alert("Erro", "Servidor temporariamente indisponível");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [])

  // useEffect para busca em tempo real
  useEffect(() => {


    // Cancela timeout anterior se existir
    const timeoutId = setTimeout(() => {


      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);// Busca em tempo real

      } else {
        resetToFeed(); // Campo vazio - volta ao feed normal
      }
    }, 500);

    return () => {

      clearTimeout(timeoutId);
    };
  }, [searchQuery, performSearch, resetToFeed]);

  // useEffect inicial para carregar o feed
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Função para atualizar manualmente
  const onRefresh = useCallback(() => {

    if (!isSearching) {
      fetchBooks("livros/feed/", true);
    }
  }, [fetchBooks, isSearching]);

  // Recarrega quando a tela ganha foco (volta de outras telas)
  useFocusEffect(
    useCallback(() => {

      if (!isSearching) {

        setImageRefreshKey(Date.now()); // Força refresh das imagens
        fetchBooks("livros/feed/", true); // Força reload completo
      }
    }, [fetchBooks, isSearching])
  );

  // Função global para refresh forçado
  useEffect(() => {
    global.refreshFeed = () => {
      const newKey = Date.now();
      setImageRefreshKey(newKey);
      // Força re-render da lista
      setBooks([]);
      setTimeout(() => {
        fetchBooks("livros/feed/", true);
      }, 100);
    };
    return () => {
      delete global.refreshFeed;
    };
  }, [fetchBooks]);

  function handleLoadMore() {
    if (nextPage) {
      fetchBooks(nextPage);
    }
  }

  // Busca é feita automaticamente pelo useEffect

  function toggleSaved(item) {
    let bookId = item.id
    const willBeSaved = !item.is_saved;

    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === bookId
          ? { ...book, is_saved: willBeSaved }
          : book
      )
    );

    const endpoint = `livros/${bookId}/favoritar/`;

    if (willBeSaved) {
      api.post(endpoint).catch(error => {
        // Erro ao favoritar

        // Se o livro não existe mais (404), remove da lista
        if (error.response?.status === 404) {
          setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
          Alert.alert('Aviso', 'Este livro não existe mais e foi removido da lista.');
        } else {
          // Reverte o estado se for outro erro
          setBooks(prevBooks =>
            prevBooks.map(book =>
              book.id === bookId
                ? { ...book, is_saved: !willBeSaved }
                : book
            )
          );
        }
      });
    }
    else {
      api.delete(endpoint).catch(error => {
        // Erro ao desfavoritar
        // Reverte o estado se der erro
        setBooks(prevBooks =>
          prevBooks.map(book =>
            book.id === bookId
              ? { ...book, is_saved: !willBeSaved }
              : book
          )
        );
      });
    }
  }

  function renderBook({ item }) {
    //=/const finalImageUrl = item.post_cover.startsWith('http') 
     // ? `${item.post_cover}?t=${imageRefreshKey}` 
     // : `${getImageBaseUrl()}${item.post_cover}?t=${imageRefreshKey}`;
    return (
      <View style={styles.card}>
        {/* Imagem do livro */}
        {item.post_cover && !item.post_cover.includes('default_thumbnail') ? (
          <Image
            source={{ uri: item.post_cover }}
            style={styles.image}
            resizeMode="cover"
            key={`image-${item.id}-${item.post_cover}-${imageRefreshKey}`}
          />
        ) : (
          <View style={[styles.image, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#ddd' }]}>
        <Ionicons name="book" size={24} color="#999" />
        </View>
        )}

        {/* Título e tipo */}
        <View style={styles.content}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/pages/infoIsolado/infoisolado',
                params: {
                  id: item.id,
                  path_back: path_back
                }
              }
              )
            }
          >
            <Text style={styles.title}>
              {item.book_title} - {item.book_author}
            </Text>
          </Pressable>

 {(item.post_creator_username || item.post_creator || item.username || item.author_username) && (
            <TouchableOpacity onPress={async () => {
              try {
                const response = await api.get(`livros/${item.id}/author/`);
                const creatorId = response.data.author_id;
                if (creatorId) {
                  router.push(`/pages/perfil/perfilUsuario?userId=${creatorId}`);
                }
              } catch (error) {
                // Erro ao buscar ID do autor
              }
            }}>
              <Text style={styles.usernameText}>
                Postado por: {item.post_creator_username || item.post_creator || item.username || item.author_username}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.tipoAcao}>
            {
              (() => {
                if (item.post_type === "troca") {
                  return "Troca";
                } else {
                  return "Empréstimo";
                }
              })()
            }
          </Text>

          {item.book_genre && (
            <Text style={styles.genreText}>
              📚 {{
                'romance_narrativa': 'Romance/Narrativa',
                'poesia': 'Poesia',
                'peca_teatral': 'Peça Teatral',
                'didatico': 'Didático',
                'nao_ficcao': 'Não-ficção'
              }[item.book_genre] || item.book_genre}
            </Text>
          )}

         
        </View>

        {/* Botões de interação */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => toggleSaved(item)}>
            <Ionicons
              name={item.is_saved ? "heart" : "heart-outline"} // 🔹 filled if saved
              size={22}
              color={item.is_saved ? "#e63946" : "#9e2a2b"} // 🔹 red if saved
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commentBtn}
            onPress={async () => {
              try {
                const response = await api.get(`livros/${item.id}/author/`);
                const authorUsername = response.data.author_username;

                if (!authorUsername) {
                  return;
                }
                router.push({
                  pathname: '/pages/chat/privatechat',
                  params: {
                    chatPartner: authorUsername
                  }
                });
              } catch (error) {
                // Erro ao buscar autor
              }
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#E09F3E" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botão para limpar busca */}
      {isSearching && (
        <TouchableOpacity
          style={{ backgroundColor: '#9e2a2b', padding: 8, margin: 10, borderRadius: 5 }}
          onPress={() => {
            setSearchQuery('');
            setBooks([]);
            setIsSearching(false);
            fetchBooks();
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>Limpar busca</Text>
        </TouchableOpacity>
      )}

      {/* Campo de pesquisa no topo */}
      <View style={styles.pesquisarArea}>
        <TextInput
          placeholder="Buscar um livro"
          placeholderTextColor="#333"
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}//onde atualiza a cada tecla
          onSubmitEditing={() => {}}
        />
        <TouchableOpacity
          style={styles.iconePesquisa}
          onPress={() => {}}
        >
          <Ionicons name="search" size={22} color="#9e2a2b" />
        </TouchableOpacity>
      </View>


      {/* lista de livros */}
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={loading && <ActivityIndicator size="large" />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E09F3E']}
            tintColor={'#E09F3E'}
          />
        }
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
  genreText: {
    marginTop: 2,
    fontSize: 11,
    color: '#335c67',
    fontWeight: '500',
  },
  usernameText: {
    marginTop: 2,
    fontSize: 11,
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

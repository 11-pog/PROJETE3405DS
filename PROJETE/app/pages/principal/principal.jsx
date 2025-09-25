import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity, TextInput, Pressable, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BarraInicial from '../../functions/barra_inicial';
import { router } from 'expo-router'
import api from '../../functions/api'
import { useNotifications } from '../../hooks/useNotifications'
import { useFocusEffect } from '@react-navigation/native'

export default function FeedLivros() {
  const [books, setBooks] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false); // para indicar se o usuário está no modo busca
  const [refreshing, setRefreshing] = useState(false);
  const { notifications } = useNotifications();

  // Funções de busca com useCallback para evitar re-renders
  const performSearch = useCallback(async (query) => {
    console.log("Iniciando busca para:", query);
    setIsSearching(true);
    setLoading(true);

    try {
      const response = await api.post('search/livros/', {
        book_title: query
      });
      
      console.log("Resultado da busca:", response.data);
      
      if (response.data.livros) {
        const searchResults = response.data.livros.map(book => ({
          ...book,
          is_saved: false
        }));
        setBooks(searchResults);
        setNextPage(null);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetToFeed = useCallback(async () => {
    console.log("Resetando para feed normal");
    setIsSearching(false);
    setLoading(true);
    
    try {
      const response = await api.get("livros/feed/");
      if (response.data?.results) {
        setBooks(response.data.results);
        setNextPage(response.data.next);
      }
    } catch (error) {
      console.error("Erro ao carregar feed:", error);
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
      console.error("Erro ao buscar livros:", error);
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
    console.log("searchQuery mudou:", searchQuery);
    
    // Cancela timeout anterior se existir
    const timeoutId = setTimeout(() => {
      console.log("Executando busca para:", searchQuery);
      
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);// Busca em tempo real

      } else {
        resetToFeed(); // Campo vazio - volta ao feed normal
      }
    }, 500);

    return () => {
      console.log("Cancelando timeout anterior");
      clearTimeout(timeoutId);
    };
  }, [searchQuery, performSearch, resetToFeed]);

  // useEffect inicial para carregar o feed
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Função para atualizar manualmente
  const onRefresh = useCallback(() => {
    console.log('Atualizando feed manualmente');
    if (!isSearching) {
      fetchBooks("livros/feed/", true);
    }
  }, [fetchBooks, isSearching]);

  // Recarrega quando a tela ganha foco (volta de outras telas)
  useFocusEffect(
    useCallback(() => {
      console.log('Tela principal ganhou foco - recarregando feed');
      if (!isSearching) {
        onRefresh();
      }
    }, [onRefresh, isSearching])
  );

  function handleLoadMore() {
    if (nextPage) {
      fetchBooks(nextPage);
    }
  }

  //faz a pesquisa dos livros
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Se busca vazia, recarrega feed normal
      setBooks([]);
      setIsSearching(false);
      fetchBooks();
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const response = await api.post('pesquisadelivro/', {
        book_title: searchQuery
      });
      
      if (response.data.livros) {
        // Usa os dados da busca diretamente
        const searchResults = response.data.livros.map(book => ({
          ...book,
          is_saved: false // Valor padrão para busca
        }));
        setBooks(searchResults);
        setNextPage(null); // Busca não tem paginação
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      if (error.response?.status === 404) {
        Alert.alert('Nenhum resultado', 'Nenhum livro encontrado com esse título');
        setBooks([]);
      } else {
        Alert.alert('Erro', 'Erro ao buscar livros');
      }
    } finally {
      setLoading(false);
    }
  };//fim const handleSearch

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
        console.error('Erro ao favoritar:', error);
        
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
        console.error('Erro ao desfavoritar:', error);
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
    return (
      <View style={styles.card}>
        {/* Imagem do livro */}
        <Image source={{ uri: item.post_cover }} style={styles.image} />

        {/* Título e tipo */}
        <View style={styles.content}>
          <Pressable
            onPress={() => router.push({
              pathname: '/pages/infoIsolado/infoisolado',
              params: {
                id: item.id
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
                if (item.post_type === "troca") {
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
                console.log('Buscando autor para livro ID:', item.id);
                const response = await api.get(`livros/${item.id}/author/`);
                console.log('Resposta da API:', response.data);
                const authorUsername = response.data.author_username;
                
                if (!authorUsername) {
                  console.error('Autor não encontrado!');
                  return;
                }
                
                console.log('Navegando para chat com:', authorUsername);
                router.push({
                  pathname: '/pages/chat/privatechat',
                  params: {
                    chatPartner: authorUsername
                  }
                });
              } catch (error) {
                console.error('Erro ao buscar autor:', error);
                console.error('Detalhes do erro:', error.response?.data);
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
          style={{backgroundColor: '#9e2a2b', padding: 8, margin: 10, borderRadius: 5}}
          onPress={() => {
            setSearchQuery('');
            setBooks([]);
            setIsSearching(false);
            fetchBooks();
          }}
        >
          <Text style={{color: 'white', textAlign: 'center', fontSize: 12}}>Limpar busca</Text>
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
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.iconePesquisa}
          onPress={handleSearch}
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

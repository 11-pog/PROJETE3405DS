import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BarraInicial from '../../functions/barra_inicial';
import { router, usePathname } from 'expo-router';
import api from '../../functions/api';
import { Platform } from 'react-native';

// Função para obter a URL base correta para imagens
const getImageBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  } else {
    return 'http://192.168.0.102:8000';
  }
};

export default function MinhasPublicacoes() {
  const [publicacoes, setPublicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());


  const path_back = usePathname()

  const fetchMinhasPublicacoes = useCallback(async (url = 'usuario/publicacoes/') => {
    try {
      console.log("requisitando para", url);
      const response = await api.get(url);
      console.log("resposta da api", response.data);
      if (response.data && response.data.results) {
        console.log('Publicações encontradas:', response.data.results.length);
        // Se é a primeira página, substitui. Se não, adiciona (paginação)
        if (url === 'usuario/publicacoes/') {
          setPublicacoes(response.data.results); // Substitui completamente
        } else {
          setPublicacoes((prev) => [...prev, ...response.data.results]); // Adiciona para paginação
        }
        setNextPage(response.data.next);
      } else {
        setPublicacoes([]);
      }
    } catch (error) {
      console.error('Erro ao buscar publicações do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas publicações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMinhasPublicacoes();
  }, [fetchMinhasPublicacoes]);

  // Atualiza imagens quando a tela ganha foco (igual página principal)
  useFocusEffect(
    useCallback(() => {
      console.log('Minhas Publicações ganhou foco - recarregando');
      const newKey = Date.now();
      console.log('Novo imageRefreshKey:', newKey);
      setImageRefreshKey(newKey); // Força refresh das imagens
      fetchMinhasPublicacoes();
    }, [fetchMinhasPublicacoes])
  );

  async function confirmDelete(item) {
    console.log('confirmDelete iniciado para item:', item.id);
    if (excluindo) {
      console.log('Já está excluindo, retornando...');
      return;
    }
    setExcluindo(true);
    try {
      const deleteUrl = `usuario/publicacoes/${item.id}/delete/`;
      console.log('Fazendo requisição DELETE para:', deleteUrl);
      console.log('URL completa será:', api.defaults.baseURL + deleteUrl);
      const response = await api.delete(deleteUrl);
      console.log('Resposta da API:', response.data);
      setPublicacoes((prev) => prev.filter((pub) => pub.id !== item.id));
      console.log('Publicação excluída com sucesso');
      Alert.alert('Sucesso', 'Publicação excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir publicação:', error);
      console.error('Detalhes do erro:', error.response?.data);
      console.error('Status do erro:', error.response?.status);
      Alert.alert('Erro', `Não foi possível excluir esta publicação. ${error.response?.data?.error || error.message}`);
    } finally {
      setExcluindo(false);
    }
  }

  function handleDelete(item) {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${item.book_title}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmDelete(item)
        }
      ]
    );
  }
  
  function handleEdit(item) {
    router.push({
      pathname: '/pages/perfil/editarPublicacao',
      params: { bookId: item.id },
    });
  }

  function renderBook({ item }) {
    // Força cache-busting mais agressivo
    const cacheBuster = `${imageRefreshKey}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const finalImageUrl = item.post_cover && item.post_cover.startsWith('http') 
      ? `${item.post_cover}?cb=${cacheBuster}` 
      : `${getImageBaseUrl()}${item.post_cover}?cb=${cacheBuster}`;
    
    console.log(`🖼️ [FEED_DEBUG] ===== Livro ${item.id} - ${item.book_title} =====`);
    console.log(`🖼️ [FEED_DEBUG] URL do banco (post_cover):`, item.post_cover);
    console.log(`🖼️ [FEED_DEBUG] URL final com cache-bust:`, finalImageUrl);
    console.log(`🖼️ [FEED_DEBUG] CacheBuster:`, cacheBuster);
    console.log(`🖼️ [FEED_DEBUG] =====================================`);
    
    return (
      <View style={styles.card} key={`card-${item.id}-${imageRefreshKey}`}>
        {item.post_cover && !item.post_cover.includes('default_thumbnail') ? (
          <View style={styles.image}>
            <Image 
              source={{ uri: finalImageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              key={cacheBuster}
              onLoad={() => console.log(`✅ [DEBUG] Imagem carregada para livro ${item.id}`)}
              onError={(error) => console.log(`❌ [DEBUG] Erro ao carregar imagem livro ${item.id}:`, error.nativeEvent.error)}
            />
          </View>
        ) : (
          <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="book" size={24} color="#999" />
          </View>
        )}

        <View style={styles.content}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/pages/infoIsolado/infoisolado',
                params: {
                  id: item.id,
                  path_back: path_back
                },
              })
            }
          >
            <Text style={styles.title}>
              {item.book_title} - {item.book_author}
            </Text>
          </Pressable>

          <Text style={styles.tipoAcao}>
            {item.post_type === 'troca' ? 'Troca' : 'Empréstimo'}
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

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <Ionicons name="create" size={22} color="#9e2a2b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={{ padding: 5 }}
          >
            <Ionicons name="trash" size={22} color="#9e2a2b" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : publicacoes.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
          Você ainda não fez nenhuma publicação.
        </Text>
      ) : (
        <FlatList
          data={publicacoes}
          renderItem={renderBook}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
      <BarraInicial />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 60,
  },
  listContent: {
    paddingBottom: 80,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  genreText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

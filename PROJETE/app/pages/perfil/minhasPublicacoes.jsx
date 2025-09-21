import React, { useEffect, useState, useCallback } from 'react';
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
import { router } from 'expo-router';
import api from '../../functions/api';

export default function MinhasPublicacoes() {
  const [publicacoes, setPublicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const fetchMinhasPublicacoes = useCallback(async (url = 'usuario/publicacoes/') => {
    try {
      const response = await api.get(url);
      if (response.data && response.data.results) {
        setPublicacoes((prev) => [...prev, ...response.data.results]);
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

  async function confirmDelete(item) {
    if (excluindo) return;
    setExcluindo(true);
    try {
      await api.delete(`usuario/publicacoes/${item.id}/delete/`);
      setPublicacoes((prev) => prev.filter((pub) => pub.id !== item.id));
    } catch (error) {
      console.error('Erro ao excluir publicação:', error.response?.data || error);
      Alert.alert('Erro', 'Não foi possível excluir esta publicação.');
    } finally {
      setExcluindo(false);
    }
  }

  function handleDelete(item) {
    Alert.alert(
      'Excluir publicação',
      `Tem certeza que deseja excluir "${item.book_title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmDelete(item),
        },
      ],
      { cancelable: true }
    );
  }

  function handleEdit(item) {
    router.push({
      pathname: '/pages/perfil/editarPublicacao',
      params: { id: item.id },
    });
  }

  function renderBook({ item }) {
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.post_cover }} style={styles.image} />

        <View style={styles.content}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/pages/infoIsolado/infoisolado',
                params: {
                  id: item.id,
                  title: item.book_title,
                  author: item.book_author,
                  description: item.book_description,
                  cover: item.post_cover,
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
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)}>
            <Ionicons name="create" size={22} color="#9e2a2b" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleDelete(item)}>
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
});

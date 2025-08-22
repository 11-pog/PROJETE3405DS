import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BarraInicial from '../../functions/barra_inicial';
import { fetchLivrosMock } from '../../mocks/mockBooks';

const PAGE_SIZE = 10;
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Habilitar animação no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Favoritos() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    async function loadFavorites() {
      const data = await fetchLivrosMock(1, PAGE_SIZE);
      setBooks(data);
    }
    loadFavorites();
  }, []);

  const removeFavorite = (id) => {
    // Animação de remoção
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBooks((prev) => prev.filter((book) => book.id !== id));
  };

  const renderBook = ({ item }) => (
    <View style={styles.card}>
      {/* Capa */}
      <Image source={{ uri: item.cover }} style={styles.image} />

      {/* Texto */}
      <Text style={styles.title} numberOfLines={2}>
        {item.title} - {item.author}
      </Text>
      <Text style={styles.tipoAcao}>Empréstimo / Troca</Text>

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => removeFavorite(item.id)} style={styles.actionBtn}>
          <Ionicons name="heart" size={20} color="#9e2a2b" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log('Ir para chat')} style={styles.actionBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#E09F3E" />
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Ionicons name="heart" size={24} color="#9e2a2b" style={{ marginRight: 6 }} />
        <Text style={styles.headerText}>Meus Favoritos ({books.length})</Text>
      </View>

      {/* Lista em Grid */}
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 70 }}
      />

      <BarraInicial />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf7f2',
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
    height: CARD_WIDTH * 1.2,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#ddd',
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1c1c1c',
    textAlign: 'center',
  },
  tipoAcao: {
    fontSize: 11,
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

});

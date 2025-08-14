import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { fetchLivrosMock } from '../../mocks/mockBooks';
import { Ionicons } from '@expo/vector-icons';
import BarraInicial from '../../functions/barra_inicial';


const PAGE_SIZE = 10;

export default function FeedLivros() {


  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const newBooks = await fetchLivrosMock(page, PAGE_SIZE);

    if (newBooks.length > 0) {
      setBooks((prev) => [...prev, ...newBooks]);
      setPage((prev) => prev + 1);
    } else {
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);



  const renderBook = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.cover }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{item.title} - {item.author}</Text>
        <Text style={styles.tipoAcao}>Empréstimo/ Troca</Text>
      </View>

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

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={fetchBooks}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && <ActivityIndicator size="large" />}

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
    shadowOffset: {
      width: 2,
      height: 4,
    },
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


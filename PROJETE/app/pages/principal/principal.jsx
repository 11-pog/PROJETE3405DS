import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const PAGE_SIZE = 10;

export default function FeedLivros() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const generateFakeBooks = (pageNumber) => {
    const startId = (pageNumber - 1) * PAGE_SIZE + 1;
    return Array.from({ length: PAGE_SIZE }, (_, i) => ({
      id: startId + i,
      title: `Livro ${startId + i}`,
      author: `Autor ${startId + i}`,
    }));
  };

  const fetchBooks = () => {
    if (loading || !hasMore) return;
    setLoading(true);

    setTimeout(() => {
      const newBooks = generateFakeBooks(page);
      if (newBooks.length > 0) {
        setBooks(prev => [...prev, ...newBooks]);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const renderBook = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.author}>{item.author}</Text>
    </View>
  );

  return (
    <FlatList
      data={books}
      renderItem={renderBook}
      keyExtractor={(item) => item.id.toString()}
      onEndReached={fetchBooks}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading && <ActivityIndicator size="large" />}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f8f8',
    margin: 10,
    padding: 15,
    borderRadius: 30,
    elevation: 2, // sombra no Android
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9e2a2b',
  },
  author: {
    marginTop: 5,
    color: '#666',
  },
});

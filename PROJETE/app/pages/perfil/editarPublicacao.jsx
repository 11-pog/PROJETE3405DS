import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import api from '../../functions/api';
import MeuInput from '../../functions/textBox';

export default function EditarPublicacao() {
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState('emprestimo');

  const params = useLocalSearchParams();
  const bookId = params.bookId;

  useEffect(() => {
    if (bookId) {
      loadBookData();
    }
  }, [bookId]);

  const loadBookData = async () => {
    try {
      const response = await api.get(`livros/${bookId}/`);
      const book = response.data.book;

      setBookTitle(book.book_title || '');
      setBookAuthor(book.book_author || '');
      setBookPublisher(book.book_publisher || '');
      setBookDescription(book.book_description || '');
      setTipo(book.post_type || 'troca');
      setGenero(book.book_genre || '');

      console.log('[EDITAR_FRONTEND] Dados carregados:', book);
    } catch (error) {
      console.error('[EDITAR_FRONTEND] Erro ao carregar dados do livro:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do livro');
    }
  };

  const saveChanges = async () => {
    if (!bookTitle.trim()) {
      Alert.alert('Erro', 'O título do livro é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        book_title: bookTitle,
        book_author: bookAuthor,
        book_publisher: bookPublisher,
        book_description: bookDescription,
        post_type: tipo,
        book_genre: genero,
      };

      console.log('[EDITAR_FRONTEND] Enviando dados:', updateData);
      console.log('[EDITAR_FRONTEND] Para livro ID:', bookId);

      const response = await api.put(`livros/${bookId}/editar/`, updateData);
      console.log('[EDITAR_FRONTEND] Resposta recebida:', response.data);

      await loadBookData();

      Alert.alert('Sucesso!', 'Livro atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('[EDITAR_FRONTEND] Erro ao atualizar livro:', error);
      Alert.alert(
        'Erro',
        `Não foi possível atualizar o livro: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Livro</Text>

      <Text style={styles.label}>Título do Livro</Text>
      <MeuInput
        value={bookTitle}
        onChangeText={setBookTitle}
        placeholder="Digite o título do livro"
      />

      <Text style={styles.label}>Autor</Text>
      <MeuInput
        value={bookAuthor}
        onChangeText={setBookAuthor}
        placeholder="Digite o nome do autor"
      />

      <Text style={styles.label}>Tipo de Publicação</Text>
      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[styles.typeButton, tipo === 'emprestimo' && styles.selectedType]}
          onPress={() => setTipo('emprestimo')}
        >
          <Text style={[styles.typeText, tipo === 'emprestimo' && styles.selectedTypeText]}>
            Empréstimo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, tipo === 'troca' && styles.selectedType]}
          onPress={() => setTipo('troca')}
        >
          <Text style={[styles.typeText, tipo === 'troca' && styles.selectedTypeText]}>
            Troca
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Editora</Text>
      <MeuInput
        value={bookPublisher}
        onChangeText={setBookPublisher}
        placeholder="Digite o nome da editora"
      />

      <Text style={styles.label}>Descrição</Text>
      <MeuInput
        style={styles.textArea}
        value={bookDescription}
        onChangeText={setBookDescription}
        placeholder="Digite uma descrição do livro"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.sectionTitle}>Gênero do livro:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScrollContainer}>
        <View style={styles.genreContainer}>
          {[
            { key: 'romance_narrativa', label: 'Romance/Narrativa' },
            { key: 'poesia', label: 'Poesia' },
            { key: 'peca_teatral', label: 'Peça Teatral' },
            { key: 'didatico', label: 'Didático' },
            { key: 'nao_ficcao', label: 'Não-ficção' }
          ].map((genre) => (
            <TouchableOpacity
              key={genre.key}
              style={[styles.genreButton, genero === genre.key && styles.selectedGenre]}
              onPress={() => setGenero(genero === genre.key ? '' : genre.key)}
            >
              <Text style={[styles.genreText, genero === genre.key && styles.selectedGenreText]}>
                {genre.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.disabledButton]}
        onPress={saveChanges}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#335c67',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 15,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: "#335C67",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#335c67",
    marginTop: 15,
    marginBottom: 10,
    textAlign: "center",
  },
  typeContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
  },
  selectedType: {
    borderColor: "#E09F3E",
    backgroundColor: "#E09F3E",
  },
  typeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  selectedTypeText: {
    color: "white",
  },
  genreScrollContainer: {
    marginBottom: 15,
  },
  genreContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
  },
  genreButton: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ddd",
    minWidth: 100,
    alignItems: "center",
  },
  selectedGenre: {
    borderColor: "#335c67",
    backgroundColor: "#335c67",
  },
  genreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  selectedGenreText: {
    color: "white",
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import api from '../../functions/api';

export default function EditarPublicacao() {
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
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
    } catch (error) {
      console.error('Erro ao carregar dados do livro:', error);
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
        book_description: bookDescription
      };

      await api.put(`livros/${bookId}/editar/`, updateData);
      Alert.alert('Sucesso!', 'Livro atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o livro');
    } finally {
      setLoading(false);
    }

    router.push("pages/perfil/minhasPublicacoes")
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Livro</Text>

      <Text style={styles.label}>Título do Livro</Text>
      <TextInput
        style={styles.input}
        value={bookTitle}
        onChangeText={setBookTitle}
        placeholder="Digite o título do livro"
      />

      <Text style={styles.label}>Autor</Text>
      <TextInput
        style={styles.input}
        value={bookAuthor}
        onChangeText={setBookAuthor}
        placeholder="Digite o nome do autor"
      />

      <Text style={styles.label}>Editora</Text>
      <TextInput
        style={styles.input}
        value={bookPublisher}
        onChangeText={setBookPublisher}
        placeholder="Digite o nome da editora"
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={bookDescription}
        onChangeText={setBookDescription}
        placeholder="Digite uma descrição do livro"
        multiline
        numberOfLines={4}
      />

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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#335c67',
    borderRadius: 10,
    padding: 15,
    marginTop: 30,
    marginBottom: 50,
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
});
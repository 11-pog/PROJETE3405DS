import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUser } from '../../hooks/useUser';
import api from '../../functions/api';

export default function CriarEmprestimo() {
  const [ownerBooks, setOwnerBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [requestType, setRequestType] = useState('emprestimo');
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const { user } = useUser();
  
  const chatPartner = params.chatPartner;

  useEffect(() => {
    fetchOwnerBooks();
  }, []);

  const fetchOwnerBooks = async () => {
    try {
      const response = await api.get(`usuarios/${chatPartner}/livros/`);
      console.log('Livros do dono:', response.data);
      setOwnerBooks(response.data.results || []);
    } catch (error) {
      console.error('Erro ao buscar livros do dono:', error);
    }
  };

  const formatDateForBackend = (dayMonth) => {
    if (!dayMonth) return '';
    const currentYear = new Date().getFullYear();
    const [day, month] = dayMonth.split('/');
    return `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const createLoanRequest = async () => {
    console.log('🔍 Verificando campos:');
    console.log('selectedBook:', selectedBook);
    console.log('meetingLocation:', meetingLocation);
    console.log('meetingDate:', meetingDate);
    console.log('returnDate:', returnDate);
    
    if (!selectedBook || !meetingLocation || !meetingDate || !returnDate) {
      console.log('❌ Campos não preenchidos!');
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    
    console.log('✅ Todos os campos preenchidos, enviando solicitação...');
    
    // Enviar direto (Alert não funciona no React Native Web)
    sendLoanRequest();
  };

  const sendLoanRequest = async () => {
    console.log('📤 FUNÇÃO EXECUTADA - Enviando solicitação...');
    console.log('🎯 Tipo atual:', requestType);
    console.log('chatPartner:', chatPartner);
    setLoading(true);
    try {
      const formattedDate = formatDateForBackend(returnDate);
      const requestData = {
        publication_id: selectedBook.id,
        owner_username: chatPartner,
        meeting_location: meetingLocation,
        meeting_date: formatDateForBackend(meetingDate),
        expected_return_date: formattedDate,
        request_type: requestType
      };
      
      console.log('🔍 Dados enviados:', requestData);
      console.log('🔍 Tipo selecionado:', requestType);
      
      const response = await api.post('emprestimos/solicitar/', requestData);
      console.log('✅ Solicitação enviada com sucesso!');
      console.log('Response:', response.data);
      
      // Redirecionar automaticamente para o chat
      console.log('🔄 Redirecionando para chat com:', chatPartner);
      router.push({
        pathname: '/pages/chat/privatechat',
        params: { chatPartner: chatPartner }
      });
    } catch (error) {
      console.error('Erro ao solicitar empréstimo:', error);
      Alert.alert('Erro', 'Não foi possível enviar a solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Solicitar Livro de {chatPartner}</Text>
      
      <Text style={styles.sectionTitle}>Escolha um livro:</Text>
      {ownerBooks.length === 0 ? (
        <Text style={styles.noBooks}>{chatPartner} não tem livros cadastrados</Text>
      ) : (
        ownerBooks.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={[
              styles.bookItem,
              selectedBook?.id === book.id && styles.selectedBook
            ]}
            onPress={() => setSelectedBook(book)}
          >
            <Text style={styles.bookTitle}>{book.book_title}</Text>
            <Text style={styles.bookAuthor}>por {book.book_author}</Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionTitle}>Local de encontro:</Text>
      <TextInput
        style={styles.input}
        value={meetingLocation}
        onChangeText={setMeetingLocation}
        placeholder="Ex: Biblioteca Central, Praça da Sé..."
      />

      <Text style={styles.sectionTitle}>Data do encontro:</Text>
      <TextInput
        style={styles.input}
        value={meetingDate}
        onChangeText={setMeetingDate}
        placeholder="DD/MM (Ex: 10/02)"
      />

      <Text style={styles.sectionTitle}>Data de devolução:</Text>
      <TextInput
        style={styles.input}
        value={returnDate}
        onChangeText={setReturnDate}
        placeholder="DD/MM (Ex: 15/02)"
      />

      <Text style={styles.sectionTitle}>Tipo de solicitação:</Text>
      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            requestType === 'emprestimo' && styles.selectedType
          ]}
          onPress={() => setRequestType('emprestimo')}
        >
          <Text style={[
            styles.typeText,
            requestType === 'emprestimo' && styles.selectedTypeText
          ]}>Empréstimo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            requestType === 'troca' && styles.selectedType
          ]}
          onPress={() => setRequestType('troca')}
        >
          <Text style={[
            styles.typeText,
            requestType === 'troca' && styles.selectedTypeText
          ]}>Troca</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.createButton, loading && styles.disabledButton]}
        onPress={() => {
          console.log('🔴 BOTÃO CLICADO!');
          console.log('🔴 Tipo no clique:', requestType);
          createLoanRequest();
        }}
        disabled={loading}
      >
        <Text style={styles.createButtonText}>
          {loading ? 'Enviando...' : `Solicitar ${requestType === 'emprestimo' ? 'Empréstimo' : 'Troca'}`}
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  bookItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBook: {
    borderColor: '#E09F3E',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#335c67',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 50,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noBooks: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  typeButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedType: {
    borderColor: '#E09F3E',
    backgroundColor: '#E09F3E',
  },
  typeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  selectedTypeText: {
    color: 'white',
  },
});
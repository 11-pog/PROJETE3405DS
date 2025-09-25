import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../functions/api';

export default function AvaliarCuidado() {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  
  const { loanId, borrowerName, borrowerImage, bookTitle } = params;

  const submitRating = async () => {
    if (rating === 0) {
      Alert.alert('Erro', 'Selecione uma avaliação');
      return;
    }

    setLoading(true);
    try {
      await api.post('emprestimos/avaliar/', {
        loan_id: loanId,
        care_rating: rating,
        comments: comments
      });
      
      Alert.alert('Sucesso', 'Avaliação enviada!', [
        { text: 'OK', onPress: () => router.push('/pages/principal/principal') }
      ]);
    } catch (error) {
      console.error('Erro ao avaliar:', error);
      Alert.alert('Erro', 'Não foi possível enviar a avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avaliar Cuidado com o Livro</Text>
      
      <View style={styles.userInfo}>
        <Image 
          source={{ uri: borrowerImage || 'http://localhost:8000/media/defaults/default_user.png' }} 
          style={styles.userImage} 
        />
        <Text style={styles.userName}>{borrowerName}</Text>
        <Text style={styles.bookTitle}>devolveu: {bookTitle}</Text>
      </View>

      <Text style={styles.questionText}>
        Como {borrowerName} cuidou do seu livro?
      </Text>

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? '#FFD700' : '#ccc'}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.ratingText}>
        {rating === 0 && 'Selecione uma avaliação'}
        {rating === 1 && 'Muito ruim'}
        {rating === 2 && 'Ruim'}
        {rating === 3 && 'Regular'}
        {rating === 4 && 'Bom'}
        {rating === 5 && 'Excelente'}
      </Text>

      <Text style={styles.sectionTitle}>Comentários (opcional):</Text>
      <TextInput
        style={styles.commentsInput}
        value={comments}
        onChangeText={setComments}
        placeholder="Como estava o estado do livro ao ser devolvido?"
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={submitRating}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Enviando...' : 'Enviar Avaliação'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bookTitle: {
    fontSize: 14,
    color: '#666',
  },
  questionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  star: {
    marginHorizontal: 5,
  },
  ratingText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentsInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: '#335c67',
    padding: 15,
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
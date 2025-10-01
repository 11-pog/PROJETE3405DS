import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../functions/api';

export default function Avaliar() {
  const [avaliacaoPessoa, setAvaliacaoPessoa] = useState(0);
  const [avaliacaoCuidado, setAvaliacaoCuidado] = useState(0);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);
  const params = useLocalSearchParams();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await api.get(`usuarios/`);
        const user = response.data.find(u => u.username === params.chatPartner);
        setUserName(user ? user.first_name || user.username : params.chatPartner);
        setUserId(user ? user.id : null);
      } catch (error) {
        setUserName(params.chatPartner);
      }
    };
    
    if (params.chatPartner) {
      fetchUserName();
    }
  }, [params.chatPartner]);

  const renderStars = (rating, setRating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={30}
              color={star <= rating ? "#FFD700" : "#ccc"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = async () => {
    if (avaliacaoPessoa === 0 || avaliacaoCuidado === 0) {
      Alert.alert('Erro', 'Por favor, avalie ambos os aspectos');
      return;
    }

    try {
      const response = await api.post('avaliar/', {
        rated_user_id: userId,
        person_rating: avaliacaoPessoa,
        book_care_rating: avaliacaoCuidado
      });

      Alert.alert('Sucesso', 'Avaliação enviada com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.push('/pages/feed')
        }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avaliar Empréstimo</Text>
      <Text style={styles.userInfo}>Avaliando: {userName}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avaliar Pessoa</Text>
        {renderStars(avaliacaoPessoa, setAvaliacaoPessoa)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avaliar Cuidado com Livro</Text>
        {renderStars(avaliacaoCuidado, setAvaliacaoCuidado)}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 60
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#335c67'
  },
  userInfo: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8
  },
  section: {
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center'
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10
  },
  submitButton: {
    backgroundColor: '#335c67',
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
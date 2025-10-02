import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../functions/api';

export default function PerfilUsuario() {
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`usuarios/`);
        const userData = response.data.find(u => u.id == userId);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <Text>Usuário não encontrado</Text>
      </View>
    );
  }

  const roundRating = (rating) => {
    const decimal = rating % 1;
    return decimal < 0.5 ? Math.floor(rating) : Math.ceil(rating);
  };

  const personAverage = user.person_rating_count > 0 ? roundRating(user.total_person_rating / user.person_rating_count) : 0;
  const bookCareAverage = user.book_care_rating_count > 0 ? roundRating(user.total_book_care_rating / user.book_care_rating_count) : 0;

  const renderStars = (rating) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 5 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={20}
            color="#FFD700"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5', padding: 20, paddingTop: 60 }}>
      <View style={{ alignItems: 'center' }}>
        {user.image_url ? (
          <Image
            source={{ uri: user.image_url }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 3,
              borderColor: '#e09f3e',
              marginBottom: 20
            }}
          />
        ) : (
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#e09f3e',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20
            }}
          >
            <Ionicons name="person" size={60} color="#F5F5F5" />
          </View>
        )}

        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#335c67', marginBottom: 10 }}>
          {user.username}
        </Text>

        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 15, width: '100%', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#335c67', marginBottom: 15 }}>
            Avaliações
          </Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 5 }}>
              Avaliação da Pessoa
            </Text>
            {renderStars(personAverage)}
            <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
              {personAverage}/5 ({user.person_rating_count} avaliações)
            </Text>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 5 }}>
              Cuidado com o Livro
            </Text>
            {renderStars(bookCareAverage)}
            <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
              {bookCareAverage}/5 ({user.book_care_rating_count} avaliações)
            </Text>
          </View>


        </View>
      </View>
    </View>
  );
}
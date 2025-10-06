import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import BarraInicial from '../../../functions/barra_inicial';
import api from '../../../functions/api';

export default function Pontos() {
  const [pontos, setPontos] = useState(0);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await api.get('usuario/');
        setPontos(response.data.points || 0);
        setUsername(response.data.username || '');
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9e2a2b" />
      </View>
    );
  }

  return (
    
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Meus Pontos</Text>
        <Text style={styles.username}>{username}</Text>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsNumber}>{pontos}</Text>
          <Text style={styles.pointsLabel}>pontos</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Como ganhar:</Text>
          <Text style={styles.infoText}>• Empréstimo: 10 pts/dia</Text>
          <Text style={styles.infoText}>• Troca: 150 pts cada</Text>
        </View>

        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardsTitle}>Trocar por:</Text>
         \
          <View style={styles.rewardItem}>
            <Text style={styles.rewardName}>Frete grátis</Text>
            <Text style={styles.rewardCost}>2000</Text>
          </View>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardName}>Desconto 20%</Text>
            <Text style={styles.rewardCost}>3000</Text>
          </View>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardName}>Assinatura Skeelo</Text>
            <Text style={styles.rewardCost}>5000</Text>
          </View>
        </View>
      </View>
      
      <BarraInicial />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  pointsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pointsNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#9e2a2b',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
    lineHeight: 16,
  },
  rewardsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  rewardsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  rewardName: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  rewardCost: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9e2a2b',
  },
});
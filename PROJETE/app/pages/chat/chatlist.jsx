import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../functions/api';
import { useUser } from '../../hooks/useUser';

export default function ChatList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get('search/usuarios/');
        if (response.data.success && response.data.usuarios_disponiveis) {
          // Filtrar usuários sem username válido
          const validUsers = response.data.usuarios_disponiveis.filter(u => u.username && u.username.trim() !== '');
          setUsers(validUsers);
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const startChat = (selectedUser) => {
    const chatPartner = selectedUser.username || selectedUser.email;
    
    console.log('ChatList - startChat chamado com:', selectedUser);
    console.log('ChatList - user atual:', user);
    console.log('ChatList - Navegando com params:', {
      currentUser: user?.username,
      chatPartner: chatPartner
    });
    
    router.push({
      pathname: '/pages/chat/privatechat',
      params: {
        currentUser: user?.username,
        chatPartner: chatPartner
      }
    });
  };

  const renderUser = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.userItem} 
        onPress={() => startChat(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username}</Text>
          <Text style={styles.userUsername}>{item.email}</Text>
          <Text style={styles.status}>
            {item.is_active ? '• Online' : '• Offline'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Iniciar Conversa</Text>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        style={styles.usersList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#335c67',
    color: 'white',
  },
  usersList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#335c67',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 4,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
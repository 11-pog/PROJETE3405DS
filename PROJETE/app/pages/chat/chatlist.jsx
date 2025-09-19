import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChatList({ currentUser }) {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Aqui você pode buscar a lista de usuários da sua API
    // Por enquanto, vou usar dados mockados
    setUsers([
      { id: 1, username: 'joao', name: 'João Silva' },
      { id: 2, username: 'maria', name: 'Maria Santos' },
      { id: 3, username: 'ana', name: 'Ana Costa' },
      { id: 4, username: 'pedro', name: 'Pedro Lima' },
    ]);
  }, []);

  const startChat = (user) => {
    // Navega para o chat privado
    router.push({
      pathname: '/pages/chat/privatechat',
      params: {
        currentUser: currentUser,
        chatPartner: user.username,
        chatPartnerName: user.name
      }
    });
  };

  const renderUser = ({ item }) => {
    if (item.username === currentUser) return null; // Não mostra o próprio usuário
    
    return (
      <TouchableOpacity 
        style={styles.userItem} 
        onPress={() => startChat(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
        </View>
      </TouchableOpacity>
    );
  };

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
    backgroundColor: '#007AFF',
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
    backgroundColor: '#007AFF',
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
});
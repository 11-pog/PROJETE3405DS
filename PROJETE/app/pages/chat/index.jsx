import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChatIndex() {
  const router = useRouter();

  const openChatList = () => {
    router.push('/pages/chat/chatlist');
  };

  const testPrivateChat = () => {
    router.push({
      pathname: '/pages/chat/privatechat',
      params: {
        currentUser: 'joao',
        chatPartner: 'maria'
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat - Teste</Text>
      
      <TouchableOpacity style={styles.button} onPress={openChatList}>
        <Text style={styles.buttonText}>Lista de Usuários</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testPrivateChat}>
        <Text style={styles.buttonText}>Teste Chat João ↔ Maria</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
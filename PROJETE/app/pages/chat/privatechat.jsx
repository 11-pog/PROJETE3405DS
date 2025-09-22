import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useUser } from '../../hooks/useUser';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PrivateChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const scrollViewRef = useRef();
  const socketRef = useRef(null);
  const params = useLocalSearchParams();
  const { user } = useUser();
  
  const currentUser = user?.username;
  const chatPartner = params.chatPartner;
  const chatKey = `chat_${[currentUser, chatPartner].sort().join('_')}`;
  
  console.log('PrivateChat - Params:', params);
  console.log('PrivateChat - User:', user);
  console.log('PrivateChat - CurrentUser:', currentUser);
  console.log('PrivateChat - ChatPartner:', chatPartner);

  // Salvar mensagens no AsyncStorage
  const saveMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem(chatKey, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Erro ao salvar mensagens:', error);
    }
  };

  // Carregar mensagens do AsyncStorage
  const loadMessages = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem(chatKey);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  useEffect(() => {
    if (!currentUser || !chatPartner) return;
    
    // Limpar estado anterior
    setMessages([]);
    setIsConnected(false);
    
    // Fechar conexão anterior se existir
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    // Carregar mensagens salvas
    loadMessages();
    
    // Conecta no WebSocket do chat privado
    const wsUrl = `ws://192.168.0.105:8000/ws/private/${currentUser}/${chatPartner}/`;
    console.log('Tentando conectar WebSocket:', wsUrl);
    console.log('Usuários:', { currentUser, chatPartner });
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'private_message') {
        const newMessage = {
          id: Date.now(),
          text: data.message,
          sender: data.sender,
          isMe: data.sender === currentUser,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => {
          const updatedMessages = [...prev, newMessage];
          saveMessages(updatedMessages);
          return updatedMessages;
        });
      }
    };

    socketRef.current.onopen = () => {
      console.log(`✅ Chat conectado: ${currentUser} ↔ ${chatPartner}`);
      setIsConnected(true);
    };
    
    socketRef.current.onclose = () => {
      console.log('🔌 Chat desconectado');
      setIsConnected(false);
    };
    
    socketRef.current.onerror = (err) => {
      console.error('❌ Erro no chat:', err);
      console.error('URL tentada:', wsUrl);
      console.error('Estado do WebSocket:', socketRef.current?.readyState);
      setIsConnected(false);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      setIsConnected(false);
    };
  }, [currentUser, chatPartner]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !currentUser || !isConnected) {
      console.log('Não pode enviar:', { inputMessage: !!inputMessage.trim(), currentUser: !!currentUser, isConnected });
      return;
    }
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        message: inputMessage,
        sender: currentUser
      }));
      setInputMessage('');
    } else {
      console.log('WebSocket não está pronto');
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Carregando usuário...</Text>
      </View>
    );
  }
  
  if (!currentUser) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Erro: Usuário não encontrado</Text>
        <Text style={{fontSize: 12, marginTop: 10}}>User: {JSON.stringify(user)}</Text>
      </View>
    );
  }
  
  if (!chatPartner) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Erro: Parceiro de chat não encontrado</Text>
        <Text style={{fontSize: 12, marginTop: 10}}>Params: {JSON.stringify(params)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable  >
      <Text style={styles.header}>Chat com {chatPartner}</Text>
      </Pressable>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.messageContainer,
              msg.isMe ? styles.myMessage : styles.otherMessage
            ]}
          >
            <Text style={styles.senderName}>{msg.sender}</Text>
            <Text style={[styles.messageText, { color: msg.isMe ? 'white' : '#333' }]}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Digite sua mensagem..."
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !isConnected && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!isConnected}
        >
          <Text style={styles.sendButtonText}>
            {isConnected ? 'Enviar' : 'Conectando...'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
    backgroundColor: '#335c67',
    color: 'white',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#335c67',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#666',
  },
  messageText: {
    fontSize: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#335c67',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
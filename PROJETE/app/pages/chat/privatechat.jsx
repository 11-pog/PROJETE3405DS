import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import PrivateChatService from '../../services/privatechat';

export default function PrivateChat({ currentUser, chatPartner }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef();

  console.log("Current User:", currentUser, "Chat Partner:", chatPartner);
  useEffect(() => {
    // Conecta no chat privado
    PrivateChatService.connect(currentUser, chatPartner);

    // Listener para receber mensagens
    const handleMessage = (data) => {
      if (data.type === 'private_message') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: data.message,
          sender: data.sender,
          isMe: data.sender === currentUser
        }]);
      }
    };

    PrivateChatService.addListener(handleMessage);

    return () => {
      PrivateChatService.removeListener(handleMessage);
      PrivateChatService.disconnect();
    };
  }, [currentUser, chatPartner]);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      PrivateChatService.sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat com {chatPartner}</Text>
      
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
            <Text style={styles.messageText}>{msg.text}</Text>
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
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Enviar</Text>
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
    color: '#333',
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
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
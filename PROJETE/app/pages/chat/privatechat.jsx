import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUser } from '../../hooks/useUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../functions/api';
import { Ionicons } from "@expo/vector-icons";

export default function PrivateChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [respondedLoans, setRespondedLoans] = useState(new Set());
  const [loanResponses, setLoanResponses] = useState(new Map());
  const [countdown, setCountdown] = useState(null);
  const [countdownLoanId, setCountdownLoanId] = useState(null);
  const scrollViewRef = useRef();
  const socketRef = useRef(null);
  const params = useLocalSearchParams();
  const { user } = useUser();

  const currentUser = user?.username;
  const chatPartner = params.chatPartner;
  const chatKey = `chat_${[currentUser, chatPartner].sort().join('_')}`;

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

    setMessages([]);
    setIsConnected(false);

    if (socketRef.current) {
      socketRef.current.close();
    }

    loadMessages();

    const wsUrl = `ws://192.168.0.105:8000/ws/private/${currentUser}/${chatPartner}/`;

    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'loan_response') {
        setRespondedLoans(prev => new Set([...prev, data.loan_id]));
        setLoanResponses(prev => new Map([...prev, [data.loan_id, data.action]]));
        return;
      }

      if (data.type === 'start_countdown') {
        setCountdownLoanId(data.loan_id);
        setCountdown(10);
        const intervalo = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(intervalo);
              setCountdown(null);
              setCountdownLoanId(null);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        return;
      }

      if (data.type === 'private_message') {
        const newMessage = {
          id: Date.now(),
          text: data.message,
          sender: data.sender,
          isMe: data.sender === currentUser,
          timestamp: new Date().toISOString(),
          loanId: data.loan_id || null
        };

        setMessages(prev => {
          const updatedMessages = [...prev, newMessage];
          saveMessages(updatedMessages);
          return updatedMessages;
        });
      }
    };

    socketRef.current.onopen = () => {
      setIsConnected(true);
    };

    socketRef.current.onclose = () => {
      setIsConnected(false);
    };

    socketRef.current.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      setIsConnected(false);
    };
  }, [currentUser, chatPartner]);

  const handleFinalizePeriod = () => {
    router.push({
      pathname: '/pages/avaliacao/avaliar',
      params: {
        chatPartner: chatPartner
      }
    });
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !currentUser || !isConnected) {
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        message: inputMessage,
        sender: currentUser
      }));
      setInputMessage('');
    }
  };

  const handleLoanResponse = async (loanId, action) => {
    try {
      let endpoint = "";
      if (action === "accept") {
        endpoint = "emprestimos/aceitar/";
      } else {
        endpoint = "emprestimos/rejeitar/";
      }

      const response = await api.post(endpoint, { loan_id: loanId });

      setRespondedLoans(prev => new Set([...prev, loanId]));
      setLoanResponses(prev => new Map([...prev, [loanId, action]]));

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'loan_response',
          loan_id: loanId,
          action: action,
          sender: currentUser
        }));
      }

      if (action === 'accept' && response.data.points_earned) {
        Alert.alert('🎉 Sucesso!', 'Empréstimo aceito!');
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'start_countdown',
            loan_id: loanId,
            sender: currentUser
          }));
        }

        setCountdownLoanId(loanId);
        setCountdown(10);
        const intervalo = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(intervalo);
              setCountdown(null);
              setCountdownLoanId(null);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        if (action === 'accept') {
          Alert.alert('Sucesso', 'Empréstimo aceito!');
        } else {
          Alert.alert('Sucesso', 'Empréstimo rejeitado!');
        }
      }

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar a resposta');
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
      <Pressable onPress={() => router.back()}>
        <View style={styles.headerContainer}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
          <Text style={styles.header}>Conversando com {chatPartner}</Text>
        </View>
      </Pressable>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((msg) => {
          let messageStyle = styles.otherMessage;
          if (msg.isMe) {
            messageStyle = styles.myMessage;
          }

          let textColor = "#333";
          if (msg.isMe) {
            textColor = "white";
          }

          let respondedText = "";
          let containerRespondedStyle = styles.respondedContainer;
          let textRespondedStyle = styles.respondedText;

          if (msg.loanId && !msg.isMe && respondedLoans.has(msg.loanId)) {
            if (loanResponses.get(msg.loanId) === 'accept') {
              respondedText = "✓ Solicitação aceita";
            } else {
              respondedText = "✗ Solicitação rejeitada";
              containerRespondedStyle = [styles.respondedContainer, styles.rejectedContainer];
              textRespondedStyle = [styles.respondedText, styles.rejectedText];
            }
          }

          return (
            <View key={msg.id} style={[styles.messageContainer, messageStyle]}>
              <Text style={styles.senderName}>{msg.sender}</Text>
              <Text style={[styles.messageText, { color: textColor }]}>{msg.text}</Text>

              {msg.text.includes('EMPRÉSTIMO ACEITO') && countdown && (
                <Text style={styles.countdownText}>
                  ⏱️ {countdown} segundos restantes
                </Text>
              )}

              {msg.text.includes('EMPRÉSTIMO ACEITO') && !countdown && (
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={handleFinalizePeriod}
                >
                  <Text style={styles.confirmButtonText}>
                    ✅ Finalizar Período
                  </Text>
                </TouchableOpacity>
              )}

              {msg.loanId && msg.isMe && (
                <View style={styles.waitingContainer}>
                  {respondedLoans.has(msg.loanId) ? (
                    loanResponses.get(msg.loanId) === 'reject' ? (
                      <View style={styles.waitingBubble}>
                        <Text style={styles.waitingText}>Solicitação rejeitada</Text>
                      </View>
                    ) : null
                  ) : (
                    <View style={styles.waitingBubble}>
                      <Text style={styles.waitingText}>Aguardando resposta...</Text>
                    </View>
                  )}
                </View>
              )}

              {msg.loanId && !msg.isMe && !respondedLoans.has(msg.loanId) && (
                <View style={styles.loanButtons}>
                  <TouchableOpacity 
                    style={styles.acceptButton}
                    onPress={() => handleLoanResponse(msg.loanId, 'accept')}
                  >
                    <Text style={styles.buttonText}>✓ Aceitar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.rejectButton}
                    onPress={() => handleLoanResponse(msg.loanId, 'reject')}
                  >
                    <Text style={styles.buttonText}>✗ Rejeitar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {msg.loanId && !msg.isMe && respondedLoans.has(msg.loanId) && (
                <View style={containerRespondedStyle}>
                  <Text style={textRespondedStyle}>
                    {respondedText}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.loanButton}
          onPress={() => {
            try {
              router.push({
                pathname: '/pages/emprestimo/criar',
                params: { chatPartner: chatPartner }
              });
            } catch (error) {
              console.error('Erro na navegação:', error);
            }
          }}
        >
          <Text style={styles.loanButtonText}>📚 Solicitar Livro</Text>
        </TouchableOpacity>
        
        <View style={styles.messageInputRow}>
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
              {(() => {
                if (isConnected) {
                  return "Enviar";
                } else {
                  return "Conectando...";
                }
              })()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#335c67',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
    textAlign: 'center'
  },
  messagesContainer: { flex: 1, padding: 10 },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#335c67' },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: '#e0e0e0' },
  senderName: { fontSize: 12, fontWeight: 'bold', marginBottom: 2, color: '#666' },
  messageText: { fontSize: 16 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  inputContainer: { padding: 10, backgroundColor: 'white' },
  loanButton: {
    backgroundColor: '#E09F3E',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10,
    alignSelf: 'center',
  },
  loanButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  messageInputRow: { flexDirection: 'row', alignItems: 'flex-end' },
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
  sendButtonDisabled: { backgroundColor: '#ccc' },
  sendButtonText: { color: 'white', fontWeight: 'bold' },
  loanButtons: { flexDirection: 'row', marginTop: 8, gap: 8 },
  acceptButton: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  rejectButton: { backgroundColor: '#f44336', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  buttonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  respondedContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e8f5e8',
    borderRadius: 15,
    alignItems: 'center',
  },
  respondedText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
  rejectedContainer: { backgroundColor: '#ffeaea' },
  rejectedText: { color: '#f44336' },
  countdownText: { color: '#FF6B35', fontSize: 12, fontWeight: 'bold', marginTop: 4, textAlign: 'center' },
  confirmButton: { backgroundColor: '#4CAF50', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginBottom: 5 },
  confirmButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  waitingContainer: { marginTop: 8, alignItems: 'center' },
  waitingBubble: { backgroundColor: '#666', borderRadius: 15, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 8 },
  waitingText: { fontSize: 12, color: 'white', fontStyle: 'italic' },
});



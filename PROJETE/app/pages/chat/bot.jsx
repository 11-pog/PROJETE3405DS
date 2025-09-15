import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { id: "1", text: "Oi! Sou o Bot da Troca de Livros 📚", sender: "bot" },
  ]);
  const [inputText, setInputText] = useState("");

  const respostasBot = [
    "Que legal! Tem algum livro para troca?",
    "Eu adoro romances 😍",
    "Interessante! Pode me contar mais?",
    "Olha, esse livro é muito bom!",
    "Você já leu O Pequeno Príncipe?",
    "Vamos marcar uma troca então!",
    "Andery é o melhor professor!!!"
  ];

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const minhaMsg = { id: Date.now().toString(), text: inputText, sender: "me" };
    setMessages((prev) => [...prev, minhaMsg]);
    setInputText("");

    setTimeout(() => {
      const resposta = respostasBot[Math.floor(Math.random() * respostasBot.length)];
      const msgBot = { id: (Date.now() + 1).toString(), text: resposta, sender: "bot" };//+1 é para diferenciar do usuário
      setMessages((prev) => [...prev, msgBot]);
    }, 1000);// setTimeout 1000 é o que faz o tempo de resposta do bot
  };

//chatizinho vai ter que mexplicar o flatlist de getNavOptions, não entendi :(
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Bot da Troca</Text>
      </View>

<TouchableOpacity
          style={styles.backButton}
          onPress={() => console.log('Voltar clicado')}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === "me" ? styles.myMessage : styles.botMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { backgroundColor: "#335C67", padding: 15, alignItems: "center" },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  message: { maxWidth: "70%", padding: 10, borderRadius: 15, margin: 5 },
  myMessage: { backgroundColor: "#335C67", alignSelf: "flex-end" },
  botMessage: { backgroundColor: "#E09F3E", alignSelf: "flex-start" },
  messageText: { color: "#fff" },
  inputContainer: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderColor: "#ddd" },
  input: { flex: 1, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 15 },
  sendButton: { backgroundColor: "#335C67", borderRadius: 20, padding: 10, marginLeft: 5, justifyContent: "center", alignItems: "center" },
  backButton: {position: 'absolute',
    left: 15,
    top:25,
    transform: [{ translateY: -11 }],} 

});

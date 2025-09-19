import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function WebSocketChat() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const socketRef = useRef(null); // <-- guarda o socket
  const socketUrl = "ws://localhost:8000/ws/publications/";

  useEffect(() => {
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      console.log("✅ WebSocket conectado");
    };

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      let newMessage = {};
      if (data.type === "new_publication") {
        newMessage = {
          id: Date.now().toString(),
          text: `📗 Nova Publicação: ${JSON.stringify(data.publication)}`,
          sender: "server",
          special: true,
        };
      } else {
        newMessage = {
          id: Date.now().toString(),
          text: `Mensagem: ${data.message}`,
          sender: "server",
        };
      }

      setMessages((prev) => [...prev, newMessage]);
    };

    socketRef.current.onerror = (error) => {
      console.error("❌ WebSocket erro:", error);
    };

    socketRef.current.onclose = () => {
      console.log("🔌 WebSocket desconectado");
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const minhaMsg = { id: Date.now().toString(), text: inputText, sender: "me" };
    setMessages((prev) => [...prev, minhaMsg]);

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: inputText }));
    } else {
      console.warn("⚠️ WebSocket ainda não está pronto");
    }

    setInputText("");
  };

  const simulatePublication = async () => {
    const publicationData = {
      title: "Novo Livro",
      author: "Autor Teste",
      user: "Usuario A",
    };

    try {
      await fetch("http://localhost:8000/test/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publicationData),
      });
      console.log("📢 Simulação enviada");
    } catch (error) {
      console.error("Erro ao simular publicação:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Publicações em tempo real</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender === "me" ? styles.myMessage : styles.serverMessage,
              item.special && styles.specialMessage,
            ]}
          >
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

      <TouchableOpacity onPress={simulatePublication} style={styles.simulateButton}>
        <Text style={styles.simulateText}>Simular Publicação</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { backgroundColor: "#335C67", padding: 15, alignItems: "center" },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  message: { maxWidth: "70%", padding: 10, borderRadius: 15, margin: 5 },
  myMessage: { backgroundColor: "#335C67", alignSelf: "flex-end" },
  serverMessage: { backgroundColor: "#E09F3E", alignSelf: "flex-start" },
  specialMessage: { backgroundColor: "green" },
  messageText: { color: "#fff" },
  inputContainer: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderColor: "#ddd" },
  input: { flex: 1, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 15 },
  sendButton: {
    backgroundColor: "#335C67",
    borderRadius: 20,
    padding: 10,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  simulateButton: {
    backgroundColor: "#E09F3E",
    padding: 12,
    margin: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  simulateText: { color: "#fff", fontWeight: "bold" },
});

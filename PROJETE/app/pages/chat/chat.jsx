import React, { useEffect, useState, useRef } from "react";
import { useUser } from "../../hooks/useUser";
import api from '../../functions/api';

export default function WebSocketTest() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [chatPartner, setChatPartner] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const socketRef = useRef(null);
  const { user, loading } = useUser();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get('usuarios/');

        setAvailableUsers(response.data);
        if (response.data.length > 0 && !chatPartner) {
          setChatPartner(response.data[0].username);
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    }
    
    if (user) {
      fetchUsers();
    }
  }, [user]);
  
  

  useEffect(() => {
    if (!user?.username || !chatPartner) {
      return;
    }
    const wsUrl = `ws://127.0.0.1:8001/ws/private/${user.username}/${chatPartner}/`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "private_message") {
        setMessages((prev) => [
          ...prev,
          { text: `${data.sender}: ${data.message}`, type: data.sender === user.username ? "me" : "other" },
        ]);
      }
    };

    socketRef.current.onopen = () => console.log(`✅ Chat conectado: ${user.username} ↔ ${chatPartner}`);
    socketRef.current.onclose = () => console.log("🔌 Chat desconectado");
    socketRef.current.onerror = (err) => console.error("❌ Erro no chat:", err);

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [user?.username, chatPartner]);

  const sendMessage = () => {
    if (!inputValue.trim() || !user?.username) return;
    
    socketRef.current.send(JSON.stringify({ 
      message: inputValue,
      sender: user.username 
    }));
    
    setInputValue("");
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Carregando...</div>;
  }
  
  if (!user) {
    return <div style={{ padding: 20 }}>Erro ao carregar usuário</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat com {chatPartner}</h2>
      
      <div style={{ marginBottom: 15 }}>
        <label>Conversar com: </label>
        <select value={chatPartner} onChange={(e) => setChatPartner(e.target.value)}>
          {availableUsers.length === 0 ? (
            <option value="">Nenhum usuário disponível</option>
          ) : (
            availableUsers.map(u => (
              <option key={u.id} value={u.username}>{u.username}</option>
            ))
          )}
        </select>
        <small style={{ display: 'block', color: '#999', marginTop: 5 }}>
          {availableUsers.length} usuário(s) disponível(is)
        </small>
        <small style={{ marginLeft: 10, color: "#666" }}>Você: {user?.username}</small>
      </div>

      <div
        id="messages"
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: 200,
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{ color: msg.type === "new" ? "green" : msg.type === "me" ? "blue" : "black" }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        id="messageInput"
        placeholder="Digite uma mensagem"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <button onClick={sendMessage}>Enviar</button>
    </div>
  );
}

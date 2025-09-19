import React, { useEffect, useState, useRef } from "react";
import { useUser } from "../../hooks/useUser";

export default function WebSocketTest() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [chatPartner, setChatPartner] = useState("maria");
  const socketRef = useRef(null);
  const { user, loading } = useUser();
  
  
  const currentUser = user?.username || "";

  useEffect(() => {
     if (!currentUser) return; 
     
    // Conecta no WebSocket do chat privado
    const wsUrl = `ws://192.168.0.200:8000/ws/private/${currentUser}/${chatPartner}/`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "private_message") {
        setMessages((prev) => [
          ...prev,
          { text: `${data.sender}: ${data.message}`, type: data.sender === currentUser ? "me" : "other" },
        ]);
      }
    };

    socketRef.current.onopen = () => console.log(`✅ Chat conectado: ${currentUser} ↔ ${chatPartner}`);
    socketRef.current.onclose = () => console.log("🔌 Chat desconectado");
    socketRef.current.onerror = (err) => console.error("❌ Erro no chat:", err);

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [user?.username, chatPartner]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    
    socketRef.current.send(JSON.stringify({ 
      message: inputValue,
      sender: user.username 
    }));
    
    setInputValue("");
  };



  return (
    <div style={{ padding: 20 }}>
      <h2>Chat com {chatPartner}</h2>
      
      <div style={{ marginBottom: 15 }}>
        <label>Conversar com: </label>
        <select value={chatPartner} onChange={(e) => setChatPartner(e.target.value)}>
          <option value="maria">Maria</option>
          <option value="ana">Ana</option>
          <option value="pedro">Pedro</option>
        </select>
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

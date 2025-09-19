import React, { useEffect, useState, useRef } from "react";

export default function WebSocketTest() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    // conecta no WebSocket
    socketRef.current = new WebSocket("ws://192.168.18.39:8000/ws/publications/");

    socketRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "new_publication") {
        setMessages((prev) => [
          ...prev,
          { text: `Nova Publicação: ${JSON.stringify(data.publication)}`, type: "new" },
        ]);
      } else {
        setMessages((prev) => [...prev, { text: `Mensagem: ${data.message}`, type: "msg" }]);
      }
    };

    socketRef.current.onopen = () => console.log("✅ WebSocket conectado");
    socketRef.current.onclose = () => console.log("🔌 WebSocket desconectado");
    socketRef.current.onerror = (err) => console.error("❌ Erro WebSocket:", err);

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    socketRef.current.send(JSON.stringify({ message: inputValue }));
    setMessages((prev) => [...prev, { text: `Você: ${inputValue}`, type: "me" }]);
    setInputValue("");
  };

  const simulatePublication = async () => {
    const publicationData = {
      title: "Novo Livro",
      author: "Autor Teste",
      user: "Usuario A",
    };

    try {
      await fetch("/test/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(publicationData),
      });
      console.log("📢 Publicação simulada");
    } catch (error) {
      console.error("Erro ao simular publicação:", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Teste WebSocket</h2>

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
      <button onClick={simulatePublication} style={{ marginLeft: 10 }}>
        Simular Publicação
      </button>
    </div>
  );
}

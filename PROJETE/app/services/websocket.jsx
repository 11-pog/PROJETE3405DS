// services/websocket.js
class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = [];
  }

  connect() {
    // Substitua pelo IP do seu servidor
    this.ws = new WebSocket('ws://127.0.0.1:8000/ws/publications/');

    this.ws.onopen = () => console.log('WebSocket conectado!');
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Chama todos os listeners registrados
      this.listeners.forEach((callback) => callback(data));
    };

    this.ws.onclose = () => console.log('WebSocket desconectado.');
    this.ws.onerror = (error) => console.log('Erro WebSocket:', error);
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  disconnect() {
    if (this.ws) this.ws.close();
  }

  sendMessage(message) {
    if (this.ws) {
      this.ws.send(JSON.stringify({ message }));
    }
  }
}

export default new WebSocketService();

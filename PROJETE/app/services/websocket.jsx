// services/websocket.js
class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = [];
  }

  connect() {
    try {
      // Substitua pelo IP do seu servidor
      this.ws = new WebSocket('ws://localhost:8001/ws/publications/');

      this.ws.onopen = () => console.log('WebSocket conectado!');
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Chama todos os listeners registrados
        this.listeners.forEach((callback) => callback(data));
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado.');
        // Tenta reconectar após 3 segundos
        setTimeout(() => this.connect(), 3000);
      };
      
      this.ws.onerror = (error) => {
        console.log('Erro WebSocket:', error);
        // Se der erro, não tenta conectar novamente
      };
    } catch (error) {
      console.log('Erro ao conectar WebSocket:', error);
    }
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

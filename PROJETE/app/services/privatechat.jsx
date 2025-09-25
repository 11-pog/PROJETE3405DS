// services/privatechat.js
class PrivateChatService {
  constructor() {
    this.ws = null;
    this.listeners = [];
    this.currentUser = null;
    this.chatPartner = null;
  }

  connect(currentUser, chatPartner) {
    this.currentUser = currentUser;
    this.chatPartner = chatPartner;
    
    // Conecta no WebSocket do chat privado
    const wsUrl = `ws://localhost:8000/ws/private/${currentUser}/${chatPartner}/`;
    console.log('URL tentada:', wsUrl);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => console.log(`💬 Chat conectado: ${currentUser} ↔ ${chatPartner}`);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Chama todos os listeners registrados
      this.listeners.forEach((callback) => callback(data));
    };

    this.ws.onclose = () => {
      console.log('💬 Chat desconectado');
      console.log('Estado do WebSocket:', this.ws.readyState);
    };
    
    this.ws.onerror = (error) => {
      console.log('❌ Erro no chat:', error);
      console.log('URL tentada:', wsUrl);
      console.log('Estado do WebSocket:', this.ws.readyState);
    };
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  sendMessage(message, sender) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        message: message,
        sender: sender
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners = [];
  }
}

export default new PrivateChatService();
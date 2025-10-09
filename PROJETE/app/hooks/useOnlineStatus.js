import { useEffect, useRef } from 'react';
import { useUser } from './useUser';
import { AppState } from 'react-native';

export function useOnlineStatus() {
  const { user } = useUser();
  const wsRef = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!user?.username) return;

    // Conectar WebSocket global para status online
    const connectWebSocket = () => {
      const wsUrl = `ws://10.48.202.176:8000/ws/online/${user.username}/`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[ONLINE STATUS] Conectado');
      };

      wsRef.current.onerror = () => {
        console.log('[ONLINE STATUS] Erro, reconectando...');
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current.onclose = () => {
        console.log('[ONLINE STATUS] Desconectado');
      };
    };

    connectWebSocket();

    // Monitorar estado do app
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App voltou ao foreground
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          connectWebSocket();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user?.username]);
}

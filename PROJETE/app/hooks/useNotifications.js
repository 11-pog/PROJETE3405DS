import { useState, useEffect } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    console.log('📡 Sistema de notificações carregado (modo simulado)');
  }, []); // Só executa uma vez
  
  return { notifications };
}
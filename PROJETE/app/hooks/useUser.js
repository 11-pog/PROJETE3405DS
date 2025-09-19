import { useState, useEffect } from 'react';
import api from '../functions/api';

export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await api.get('usuario/');
        if (res.status === 200) {
          setUser(res.data);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  return { user, loading };
}
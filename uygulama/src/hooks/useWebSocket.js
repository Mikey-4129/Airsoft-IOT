import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

export function useWebSocket() {
  const { dispatch } = useGame();
  const wsRef = useRef(null);

  useEffect(() => {
    // Donanım hazır olduğunda gerçek WebSocket bağlantısı buraya gelecek:
    // wsRef.current = new WebSocket('ws://192.168.4.1:81');
    // wsRef.current.onmessage = (e) => { ... dispatch(action) ... };

    // Şimdilik simülasyon modu aktif — hiçbir şey yapma
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const mesajGonder = (veri) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(veri));
    }
  };

  return { mesajGonder };
}

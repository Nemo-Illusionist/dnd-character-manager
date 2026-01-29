// useGameItems Hook - Real-time subscription to game items
import { useEffect, useState } from 'react';
import { subscribeToGameItems } from '../services/gameItems.service';
import type { GameItem } from 'shared';

export function useGameItems(gameId: string | null) {
  const [items, setItems] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToGameItems(gameId, (updatedItems) => {
      setItems(updatedItems);
      setLoading(false);
    });

    return unsubscribe;
  }, [gameId]);

  return { items, loading, error };
}

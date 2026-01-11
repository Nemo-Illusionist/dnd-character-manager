// useGames Hook - Real-time subscription to user's games
import { useEffect, useState } from 'react';
import { subscribeToUserGames } from '../services/games.service';
import { useAuth } from './useAuth';
import type { Game } from 'shared';

export function useGames() {
  const { firebaseUser } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setGames([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserGames(firebaseUser.uid, (updatedGames) => {
      setGames(updatedGames);
      setLoading(false);
    });

    return unsubscribe;
  }, [firebaseUser]);

  return { games, loading, error };
}

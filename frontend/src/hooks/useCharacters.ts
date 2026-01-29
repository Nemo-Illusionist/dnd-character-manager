// useCharacters Hook - Real-time subscription to game characters
import { useEffect, useState } from 'react';
import {
  subscribeToPublicCharacters,
  subscribeToGameCharacters,
} from '../services/characters.service';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import type { Character, PublicCharacter } from 'shared';

/**
 * Hook for subscribing to public characters list
 * Used for displaying character cards visible to all game participants
 * Automatically filters out hidden characters for non-GM players
 */
export function usePublicCharacters() {
  const [characters, setCharacters] = useState<PublicCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { currentGame } = useGame();

  const isGM = currentGame && user ? currentGame.gmId === user.uid : false;

  useEffect(() => {
    if (!currentGame || !user) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToPublicCharacters(
      currentGame.id,
      (updatedCharacters) => {
        // Filter hidden characters for non-GM players
        const visibleCharacters = isGM
          ? updatedCharacters
          : updatedCharacters.filter(c => !c.isHidden || c.ownerId === user.uid);

        setCharacters(visibleCharacters);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentGame, user, isGM]);

  return { characters, loading, error, isGM };
}

/**
 * Hook for subscribing to full character data (public + private)
 * For GM: all characters with full data
 * For players: only their own characters with full data
 */
export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { currentGame } = useGame();

  useEffect(() => {
    if (!currentGame || !user) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const isGM = currentGame.gmId === user.uid;

    const unsubscribe = subscribeToGameCharacters(
      currentGame.id,
      user.uid,
      isGM,
      (updatedCharacters) => {
        setCharacters(updatedCharacters);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentGame, user]);

  return { characters, loading, error };
}

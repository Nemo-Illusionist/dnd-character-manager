// useCharacterMutation Hook - Character update operations
import { useState, useCallback } from 'react';
import { updateCharacter } from '../services/characters.service';
import type { Character } from 'shared';

interface MutationState {
  isLoading: boolean;
  error: string | null;
}

interface UseCharacterMutationResult extends MutationState {
  update: (updates: Partial<Character>) => Promise<void>;
  updateHP: (current: number, temp?: number) => Promise<void>;
  updateDeathSaves: (successes: number, failures: number) => Promise<void>;
  heal: (amount: number, maxHP: number) => Promise<void>;
  damage: (amount: number, currentHP: number, tempHP: number) => Promise<void>;
}

export function useCharacterMutation(
  gameId: string,
  character: Character
): UseCharacterMutationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (updates: Partial<Character>) => {
      setIsLoading(true);
      setError(null);
      try {
        await updateCharacter(gameId, character.id, updates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [gameId, character.id]
  );

  const updateHP = useCallback(
    async (current: number, temp?: number) => {
      const hpUpdate: Character['hp'] = { ...character.hp, current };
      if (temp !== undefined) {
        hpUpdate.temp = temp;
      }
      await update({ hp: hpUpdate });
    },
    [update, character.hp]
  );

  const updateDeathSaves = useCallback(
    async (successes: number, failures: number) => {
      await update({ deathSaves: { successes, failures } });
    },
    [update]
  );

  const heal = useCallback(
    async (amount: number, maxHP: number) => {
      if (amount <= 0) return;
      const newCurrent = Math.min(maxHP, character.hp.current + amount);
      await update({
        hp: { ...character.hp, current: newCurrent },
        deathSaves: { successes: 0, failures: 0 },
      });
    },
    [update, character.hp]
  );

  const damage = useCallback(
    async (amount: number, currentHP: number, tempHP: number) => {
      if (amount <= 0) return;

      let remaining = amount;
      let newTemp = tempHP;
      let newCurrent = currentHP;

      // Damage temp HP first
      if (newTemp > 0) {
        if (newTemp >= remaining) {
          newTemp -= remaining;
          remaining = 0;
        } else {
          remaining -= newTemp;
          newTemp = 0;
        }
      }

      // Then damage current HP
      if (remaining > 0) {
        newCurrent = Math.max(0, newCurrent - remaining);
      }

      await update({
        hp: { ...character.hp, current: newCurrent, temp: newTemp },
      });
    },
    [update, character.hp]
  );

  return {
    isLoading,
    error,
    update,
    updateHP,
    updateDeathSaves,
    heal,
    damage,
  };
}

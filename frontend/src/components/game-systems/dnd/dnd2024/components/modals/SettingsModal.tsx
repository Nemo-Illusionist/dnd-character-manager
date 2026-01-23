// D&D 2024 - Settings Modal Component

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../../hooks';
import { useGame } from '../../../../../../context/GameContext';
import { isGameMaster } from '../../../../../../services/games.service';
import { updateCharacter } from '../../../../../../services/characters.service';
import { getUsers } from '../../../../../../services/users.service';
import type { Character, User } from 'shared';
import './Modals.scss';

interface SettingsModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function SettingsModal({ character, gameId, onClose }: SettingsModalProps) {
  const { firebaseUser } = useAuth();
  const { currentGame } = useGame();
  const [players, setPlayers] = useState<User[]>([]);

  const isGM = currentGame && firebaseUser ? isGameMaster(currentGame, firebaseUser.uid) : false;

  // Load players for GM
  useEffect(() => {
    if (!isGM || !currentGame) return;

    const allPlayerIds = [currentGame.gmId, ...currentGame.playerIds.filter(id => id !== currentGame.gmId)];
    getUsers(allPlayerIds).then(setPlayers);
  }, [isGM, currentGame]);

  const update = (changes: Partial<Character>) => {
    updateCharacter(gameId, character.id, changes);
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>Character Settings</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {isGM && players.length > 0 ? (
            <div className="cs-form-group">
              <label>Owner</label>
              <select
                value={character.ownerId}
                onChange={(e) => update({ ownerId: e.target.value })}
              >
                {players.map((player) => (
                  <option key={player.uid} value={player.uid}>
                    {player.displayName || player.email}
                    {currentGame && player.uid === currentGame.gmId ? ' (GM)' : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No settings available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Transfer GM Section Component - Danger Zone
import { useState, useEffect } from 'react';
import { Button, ConfirmDialog } from '../shared';
import { getUsers } from '../../services/users.service';
import { transferGMRole } from '../../services/games.service';
import type { Game, User } from 'shared';

interface TransferGMSectionProps {
  game: Game;
  currentUserId: string;
}

export function TransferGMSection({ game, currentUserId }: TransferGMSectionProps) {
  const [players, setPlayers] = useState<User[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlayers();
  }, [game.playerIds]);

  const loadPlayers = async () => {
    setLoading(true);
    const loadedPlayers = await getUsers(game.playerIds);
    // Filter out current GM
    const otherPlayers = loadedPlayers.filter(p => p.uid !== game.gmId);
    setPlayers(otherPlayers);
    setLoading(false);
  };

  const handleTransfer = async () => {
    if (!selectedPlayerId) return;

    setTransferring(true);
    setError('');

    try {
      await transferGMRole(game.id, currentUserId, selectedPlayerId);
      setShowConfirm(false);
      setSelectedPlayerId('');
    } catch (err) {
      setError((err as Error).message || 'Failed to transfer GM role');
    } finally {
      setTransferring(false);
    }
  };

  const selectedPlayer = players.find(p => p.uid === selectedPlayerId);

  return (
    <section className="manage-section manage-section--danger">
      <h3 className="manage-section-title">
        <span className="manage-section-icon">⚠️</span>
        Danger Zone
      </h3>
      <p className="manage-section-description">
        Transfer your Game Master privileges to another player.
        This action is <strong>irreversible</strong> — you will lose all GM abilities and cannot undo this yourself.
      </p>

      {error && (
        <div className="manage-alert manage-alert--error">
          {error}
        </div>
      )}

      {loading ? (
        <p className="players-empty">Loading players...</p>
      ) : players.length === 0 ? (
        <p className="players-empty">
          No other players in the game. Invite players first before transferring GM role.
        </p>
      ) : (
        <div className="manage-form">
          <div className="input-wrapper">
            <label className="input-label">Select New Game Master</label>
            <select
              className="transfer-select"
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              disabled={transferring}
            >
              <option value="">Choose a player...</option>
              {players.map((player) => (
                <option key={player.uid} value={player.uid}>
                  {player.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="manage-form-actions">
            <Button
              variant="danger"
              onClick={() => setShowConfirm(true)}
              disabled={!selectedPlayerId || transferring}
            >
              Transfer GM Role
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleTransfer}
        title="Transfer GM Role"
        message={`Are you sure you want to transfer GM role to ${selectedPlayer?.displayName}? You will lose all GM privileges and cannot undo this action yourself.`}
        confirmLabel="Yes, Transfer"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={transferring}
      />
    </section>
  );
}

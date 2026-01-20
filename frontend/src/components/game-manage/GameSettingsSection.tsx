// Game Settings Section Component
import { FormEvent, useState, useEffect } from 'react';
import { Input, Button } from '../shared';
import { updateGame } from '../../services/games.service';
import type { Game } from 'shared';

interface GameSettingsSectionProps {
  game: Game;
}

export function GameSettingsSection({ game }: GameSettingsSectionProps) {
  const [name, setName] = useState(game.name);
  const [description, setDescription] = useState(game.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(game.name);
    setDescription(game.description || '');
  }, [game]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      setError('Game name must be at least 3 characters');
      return;
    }

    const hasChanges = trimmedName !== game.name || description.trim() !== (game.description || '');
    if (!hasChanges) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateGame(game.id, {
        name: trimmedName,
        description: description.trim(),
      });
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to update game');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = name.trim() !== game.name || description.trim() !== (game.description || '');

  return (
    <section className="manage-section">
      <h3 className="manage-section-title">
        <span className="manage-section-icon">⚙️</span>
        Game Settings
      </h3>

      <form onSubmit={handleSubmit} className="manage-form">
        {error && (
          <div className="manage-alert manage-alert--error">
            {error}
          </div>
        )}
        {success && (
          <div className="manage-alert manage-alert--success">
            {success}
          </div>
        )}

        <Input
          type="text"
          label="Game Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter game name"
          disabled={loading}
        />

        <div className="input-wrapper">
          <label className="input-label">Description</label>
          <textarea
            className="manage-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your game, campaign setting, or any important notes for players..."
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="manage-form-actions">
          <Button type="submit" disabled={loading || !hasChanges}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </section>
  );
}

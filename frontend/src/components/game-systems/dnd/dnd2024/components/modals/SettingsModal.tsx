// D&D 2024 - Settings Modal Component

import { useState } from 'react';
import { Button, NumberInput } from '../../../../../shared';
import { updateCharacter } from '../../../../../../services/characters.service';
import type { Character } from 'shared';
import './Modals.css';

interface SettingsModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function SettingsModal({ character, gameId, onClose }: SettingsModalProps) {
  const [formData, setFormData] = useState({
    name: character.name,
    race: character.race,
    class: character.class,
    subclass: character.subclass || '',
    ac: character.ac,
    speed: character.speed,
    hideSpellsTab: character.hideSpellsTab || false,
  });

  const handleSave = async () => {
    await updateCharacter(gameId, character.id, {
      name: formData.name,
      race: formData.race,
      class: formData.class,
      subclass: formData.subclass,
      ac: formData.ac,
      speed: formData.speed,
      hideSpellsTab: formData.hideSpellsTab,
    });
    onClose();
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
          <div className="cs-form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Background</label>
            <input
              type="text"
              value={formData.race}
              onChange={(e) => setFormData({ ...formData, race: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Class</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Subclass</label>
            <input
              type="text"
              value={formData.subclass}
              onChange={(e) => setFormData({ ...formData, subclass: e.target.value })}
            />
          </div>

          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Armor Class</label>
              <NumberInput
                value={formData.ac}
                onChange={(value) => setFormData({ ...formData, ac: value })}
                min={0}
                defaultValue={10}
              />
            </div>

            <div className="cs-form-group">
              <label>Speed</label>
              <NumberInput
                value={formData.speed}
                onChange={(value) => setFormData({ ...formData, speed: value })}
                min={0}
                defaultValue={30}
              />
            </div>
          </div>

          <div className="cs-form-group cs-checkbox-group">
            <label className="cs-checkbox-label">
              <input
                type="checkbox"
                checked={formData.hideSpellsTab}
                onChange={(e) => setFormData({ ...formData, hideSpellsTab: e.target.checked })}
              />
              <span>Hide Spells Tab</span>
            </label>
          </div>
        </div>

        <div className="cs-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}

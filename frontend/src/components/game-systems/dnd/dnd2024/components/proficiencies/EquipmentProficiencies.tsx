// D&D 2024 - Equipment Training & Proficiencies Component

import type { Character } from 'shared';
import './Proficiencies.css';

interface EquipmentProficienciesProps {
  character: Character;
  onArmorTrainingToggle: (type: 'light' | 'medium' | 'heavy' | 'shields') => void;
  onWeaponProficienciesChange: (value: string) => void;
  onToolProficienciesChange: (value: string) => void;
}

export function EquipmentProficiencies({
  character,
  onArmorTrainingToggle,
  onWeaponProficienciesChange,
  onToolProficienciesChange,
}: EquipmentProficienciesProps) {
  const armorTraining = character.armorTraining || {
    light: false,
    medium: false,
    heavy: false,
    shields: false,
  };

  return (
    <div className="cs-equipment-proficiencies">
      <h3 className="cs-equipment-header">PROFICIENCIES & TRAINING</h3>

      {/* Armor Training - 2x2 grid */}
      <div className="cs-equipment-section no-border">
        <div className="cs-armor-grid">
          <span className="cs-armor-label">Armor</span>
          <label className="cs-armor-checkbox">
            <input
              type="checkbox"
              checked={armorTraining.light}
              onChange={() => onArmorTrainingToggle('light')}
            />
            <span>Light</span>
          </label>
          <label className="cs-armor-checkbox">
            <input
              type="checkbox"
              checked={armorTraining.heavy}
              onChange={() => onArmorTrainingToggle('heavy')}
            />
            <span>Heavy</span>
          </label>

          <span className="cs-armor-label">Training</span>
          <label className="cs-armor-checkbox">
            <input
              type="checkbox"
              checked={armorTraining.medium}
              onChange={() => onArmorTrainingToggle('medium')}
            />
            <span>Medium</span>
          </label>
          <label className="cs-armor-checkbox">
            <input
              type="checkbox"
              checked={armorTraining.shields}
              onChange={() => onArmorTrainingToggle('shields')}
            />
            <span>Shields</span>
          </label>
        </div>
      </div>

      {/* Weapons */}
      <div className="cs-equipment-section">
        <label className="cs-equipment-label">Weapons</label>
        <textarea
          className="cs-equipment-textarea"
          value={character.weaponProficiencies || ''}
          onChange={(e) => onWeaponProficienciesChange(e.target.value)}
          placeholder="Simple, Martial, etc."
          rows={2}
        />
      </div>

      {/* Tools */}
      <div className="cs-equipment-section no-border">
        <label className="cs-equipment-label">Tools</label>
        <textarea
          className="cs-equipment-textarea"
          value={character.toolProficiencies || ''}
          onChange={(e) => onToolProficienciesChange(e.target.value)}
          placeholder="Thieves' Tools, etc."
          rows={2}
        />
      </div>
    </div>
  );
}

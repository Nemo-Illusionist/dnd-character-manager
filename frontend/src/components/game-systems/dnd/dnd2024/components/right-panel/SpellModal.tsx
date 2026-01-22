// D&D 2024 - Spell Modal Component

import { useState, useEffect } from 'react';
import type { CharacterSpellEntry, MagicSchool } from 'shared';
import '../modals/Modals.scss';

interface SpellModalProps {
  spell: CharacterSpellEntry;
  onUpdate: (updates: Partial<CharacterSpellEntry>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const SPELL_LEVELS = [
  { value: 0, label: 'Cantrip' },
  { value: 1, label: '1st Level' },
  { value: 2, label: '2nd Level' },
  { value: 3, label: '3rd Level' },
  { value: 4, label: '4th Level' },
  { value: 5, label: '5th Level' },
  { value: 6, label: '6th Level' },
  { value: 7, label: '7th Level' },
  { value: 8, label: '8th Level' },
  { value: 9, label: '9th Level' },
];

const MAGIC_SCHOOLS: { value: MagicSchool; label: string }[] = [
  { value: 'Abjuration', label: 'Abjuration' },
  { value: 'Conjuration', label: 'Conjuration' },
  { value: 'Divination', label: 'Divination' },
  { value: 'Enchantment', label: 'Enchantment' },
  { value: 'Evocation', label: 'Evocation' },
  { value: 'Illusion', label: 'Illusion' },
  { value: 'Necromancy', label: 'Necromancy' },
  { value: 'Transmutation', label: 'Transmutation' },
];

const CASTING_TIMES = [
  '1 action',
  '1 bonus action',
  '1 reaction',
  '1 minute',
  '10 minutes',
  '1 hour',
  '8 hours',
  '12 hours',
  '24 hours',
];

export function SpellModal({ spell, onUpdate, onDelete, onClose }: SpellModalProps) {
  // Local state for responsive editing
  const [localSpell, setLocalSpell] = useState<CharacterSpellEntry>(spell);

  // Sync local state when spell changes from outside
  useEffect(() => {
    setLocalSpell(spell);
  }, [spell.id]);

  // Save changes and close
  const handleClose = () => {
    // Only update if there are changes
    const changes: Partial<CharacterSpellEntry> = {};
    if (localSpell.name !== spell.name) changes.name = localSpell.name;
    if (localSpell.level !== spell.level) changes.level = localSpell.level;
    if (localSpell.school !== spell.school) changes.school = localSpell.school;
    if (localSpell.castingTime !== spell.castingTime) changes.castingTime = localSpell.castingTime;
    if (localSpell.range !== spell.range) changes.range = localSpell.range;
    if (localSpell.components !== spell.components) changes.components = localSpell.components;
    if (localSpell.duration !== spell.duration) changes.duration = localSpell.duration;
    if (localSpell.concentration !== spell.concentration) changes.concentration = localSpell.concentration;
    if (localSpell.ritual !== spell.ritual) changes.ritual = localSpell.ritual;
    if (localSpell.prepared !== spell.prepared) changes.prepared = localSpell.prepared;
    if (localSpell.description !== spell.description) changes.description = localSpell.description;
    if (localSpell.source !== spell.source) changes.source = localSpell.source;

    if (Object.keys(changes).length > 0) {
      onUpdate(changes);
    }
    onClose();
  };

  // Update local state
  const updateLocal = (updates: Partial<CharacterSpellEntry>) => {
    setLocalSpell((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="cs-modal-overlay" onClick={handleClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>{localSpell.name || 'New Spell'}</h2>
          <button className="cs-modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {/* Name */}
          <div className="cs-form-group">
            <label>Name</label>
            <input
              type="text"
              value={localSpell.name}
              onChange={(e) => updateLocal({ name: e.target.value })}
              placeholder="Spell name"
            />
          </div>

          {/* Level and School */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Level</label>
              <select
                value={localSpell.level}
                onChange={(e) => updateLocal({ level: parseInt(e.target.value) })}
              >
                {SPELL_LEVELS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="cs-form-group">
              <label>School</label>
              <select
                value={localSpell.school || ''}
                onChange={(e) => updateLocal({ school: (e.target.value as MagicSchool) || undefined })}
              >
                <option value="">—</option>
                {MAGIC_SCHOOLS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Casting Time and Range */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Casting Time</label>
              <select
                value={localSpell.castingTime || ''}
                onChange={(e) => updateLocal({ castingTime: e.target.value || undefined })}
              >
                <option value="">—</option>
                {CASTING_TIMES.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div className="cs-form-group">
              <label>Range</label>
              <input
                type="text"
                value={localSpell.range ?? ''}
                onChange={(e) => updateLocal({ range: e.target.value })}
                placeholder="Self, Touch, 30 feet..."
              />
            </div>
          </div>

          {/* Components and Duration */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Components</label>
              <input
                type="text"
                value={localSpell.components ?? ''}
                onChange={(e) => updateLocal({ components: e.target.value })}
                placeholder="V, S, M (a feather)"
              />
            </div>
            <div className="cs-form-group">
              <label>Duration</label>
              <input
                type="text"
                value={localSpell.duration ?? ''}
                onChange={(e) => updateLocal({ duration: e.target.value })}
                placeholder="Instantaneous, 1 minute..."
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="cs-form-row">
            <div className="cs-form-group cs-checkbox-group">
              <label className="cs-checkbox-label">
                <input
                  type="checkbox"
                  checked={localSpell.concentration || false}
                  onChange={(e) => updateLocal({ concentration: e.target.checked })}
                />
                <span>Concentration</span>
              </label>
            </div>
            <div className="cs-form-group cs-checkbox-group">
              <label className="cs-checkbox-label">
                <input
                  type="checkbox"
                  checked={localSpell.ritual || false}
                  onChange={(e) => updateLocal({ ritual: e.target.checked })}
                />
                <span>Ritual</span>
              </label>
            </div>
            {localSpell.level > 0 && (
              <div className="cs-form-group cs-checkbox-group">
                <label className="cs-checkbox-label">
                  <input
                    type="checkbox"
                    checked={localSpell.prepared || false}
                    onChange={(e) => updateLocal({ prepared: e.target.checked })}
                  />
                  <span>Prepared</span>
                </label>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="cs-form-group">
            <label>Description</label>
            <textarea
              value={localSpell.description ?? ''}
              onChange={(e) => updateLocal({ description: e.target.value })}
              placeholder="Spell description..."
              rows={4}
            />
          </div>

          {/* Source */}
          <div className="cs-form-group">
            <label>Source</label>
            <input
              type="text"
              value={localSpell.source ?? ''}
              onChange={(e) => updateLocal({ source: e.target.value })}
              placeholder="PHB 279, XGE 152..."
            />
          </div>

          {/* Delete button */}
          <button className="cs-btn cs-btn-danger cs-btn-full" onClick={onDelete}>
            Delete Spell
          </button>
        </div>
      </div>
    </div>
  );
}

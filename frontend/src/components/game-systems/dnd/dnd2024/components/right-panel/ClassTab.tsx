// D&D 2024 - Class Tab Component
// Designed for future multiclassing support

import { useEffect, useRef } from 'react';
import { NumberInput } from '../../../../../shared';
import { updateCharacter } from '../../../../../../services/characters.service';
import { ABILITY_ORDER, ABILITY_NAMES, getSpellSlotsForLevel, CASTER_TYPE_NAMES } from '../../constants';
import type { SpellcasterType } from '../../constants';
import type { Character, AbilityName } from 'shared';

interface ClassTabProps {
  character: Character;
  gameId: string;
}

export function ClassTab({ character, gameId }: ClassTabProps) {
  const prevLevelRef = useRef(character.level);
  const prevCasterTypeRef = useRef(character.spellcasterType);

  const spellcasterType = (character.spellcasterType || 'none') as SpellcasterType;
  const spellcastingAbility = character.spellcastingAbility || 'int';
  const isSpellcaster = spellcasterType !== 'none';

  const update = (changes: Partial<Character>) => {
    updateCharacter(gameId, character.id, changes);
  };

  // Auto-update spell slots when level or caster type changes (only for auto types)
  useEffect(() => {
    const levelChanged = prevLevelRef.current !== character.level;
    const casterTypeChanged = prevCasterTypeRef.current !== character.spellcasterType;
    const isAutoType = spellcasterType === 'full' || spellcasterType === 'half' || spellcasterType === 'warlock';

    if ((levelChanged || casterTypeChanged) && isAutoType) {
      const newSlots = getSpellSlotsForLevel(spellcasterType, character.level);
      updateCharacter(gameId, character.id, { spellSlots: newSlots });
    }

    prevLevelRef.current = character.level;
    prevCasterTypeRef.current = character.spellcasterType;
  }, [character.level, character.spellcasterType, spellcasterType, gameId, character.id]);

  const handleCasterTypeChange = async (type: SpellcasterType) => {
    if (type === 'none') {
      // Clear all slots and hide spells tab
      await updateCharacter(gameId, character.id, {
        spellcasterType: type,
        spellSlots: {},
        hideSpellsTab: true,
      });
    } else if (type === 'manual') {
      // Keep current slots, just change type, show spells tab
      await updateCharacter(gameId, character.id, {
        spellcasterType: type,
        hideSpellsTab: false,
      });
    } else {
      // Auto types - set slots based on level, show spells tab
      const newSlots = getSpellSlotsForLevel(type, character.level);
      await updateCharacter(gameId, character.id, {
        spellcasterType: type,
        spellSlots: newSlots,
        hideSpellsTab: false,
      });
    }
  };

  const handleSpellcastingAbilityChange = async (ability: AbilityName) => {
    await updateCharacter(gameId, character.id, {
      spellcastingAbility: ability,
    });
  };

  const handleSlotMaxChange = async (level: number, max: number) => {
    const spellSlots = character.spellSlots || {};
    const slot = spellSlots[level] || { current: 0, max: 0 };
    await updateCharacter(gameId, character.id, {
      spellSlots: {
        ...spellSlots,
        [level]: { current: Math.min(slot.current, max), max },
      },
    });
  };

  const isManual = spellcasterType === 'manual';

  // For now, single class - future: array of classes
  const hasClass = character.class && character.class.trim() !== '';

  return (
    <div className="cs-class-tab">
      {/* Total Level Display */}
      <div className="cs-class-total-level">
        <span className="cs-class-total-label">Total Level</span>
        <span className="cs-class-total-value">{character.level}</span>
      </div>

      {/* Class Cards */}
      <div className="cs-class-list">
        {/* Primary Class Card */}
        <div className="cs-class-card">
          <div className="cs-class-card-header">
            <div className="cs-class-card-title">
              {hasClass ? character.class : 'No Class'}
            </div>
            <div className="cs-class-card-level">
              <span className="cs-class-level-label">Lvl</span>
              <span className="cs-class-level-value">{character.level}</span>
            </div>
          </div>

          <div className="cs-class-card-body">
            {/* Class Name */}
            <div className="cs-class-field">
              <label>Class</label>
              <input
                type="text"
                value={character.class}
                onChange={(e) => update({ class: e.target.value })}
                placeholder="Fighter, Wizard, Rogue..."
              />
            </div>

            {/* Subclass */}
            <div className="cs-class-field">
              <label>Subclass</label>
              <input
                type="text"
                value={character.subclass || ''}
                onChange={(e) => update({ subclass: e.target.value })}
                placeholder="Champion, Evocation..."
              />
            </div>

            {/* Caster Type */}
            <div className="cs-class-field">
              <label>Caster Type</label>
              <select
                value={spellcasterType}
                onChange={(e) => handleCasterTypeChange(e.target.value as SpellcasterType)}
              >
                {(Object.keys(CASTER_TYPE_NAMES) as SpellcasterType[]).map((type) => (
                  <option key={type} value={type}>{CASTER_TYPE_NAMES[type]}</option>
                ))}
              </select>
            </div>

            {/* Spellcasting Ability - only for spellcasters */}
            {isSpellcaster && (
              <div className="cs-class-field">
                <label>Spellcasting Ability</label>
                <select
                  value={spellcastingAbility}
                  onChange={(e) => handleSpellcastingAbilityChange(e.target.value as AbilityName)}
                >
                  {ABILITY_ORDER.map((ab) => (
                    <option key={ab} value={ab}>{ABILITY_NAMES[ab]}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Manual Spell Slots - only for Manual type */}
            {isManual && (
              <div className="cs-class-field">
                <label>Spell Slots (Max)</label>
                <div className="cs-manual-slots-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                    const spellSlots = character.spellSlots || {};
                    const slot = spellSlots[level] || { current: 0, max: 0 };
                    return (
                      <div key={level} className="cs-manual-slot">
                        <span className="cs-manual-slot-level">{level}</span>
                        <NumberInput
                          className="cs-manual-slot-input"
                          value={slot.max}
                          onChange={(val) => handleSlotMaxChange(level, val)}
                          min={0}
                          max={9}
                          defaultValue={0}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Class Button - placeholder for future multiclassing */}
        <button className="cs-class-add-btn" disabled title="Multiclassing coming soon">
          + Add Class
        </button>
      </div>

      {/* Info about multiclassing */}
      <p className="cs-class-info">
        Multiclassing support coming soon. You'll be able to add multiple classes and track levels separately.
      </p>
    </div>
  );
}

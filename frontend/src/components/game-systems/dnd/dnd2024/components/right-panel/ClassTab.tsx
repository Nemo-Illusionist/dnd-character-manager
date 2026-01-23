// D&D 2024 - Class Tab Component
// Designed for future multiclassing support

import { useEffect, useRef } from 'react';
import { NumberInput } from '../../../../../shared';
import { updateCharacter } from '../../../../../../services/characters.service';
import { ABILITY_ORDER, ABILITY_NAMES, getSpellSlotsForLevel, CASTER_TYPE_NAMES } from '../../constants';
import { getPrimaryClass } from '../../utils';
import type { SpellcasterType } from '../../constants';
import type { Character, CharacterClass, AbilityName } from 'shared';

interface ClassTabProps {
  character: Character;
  gameId: string;
}

export function ClassTab({ character, gameId }: ClassTabProps) {
  const primaryClass = getPrimaryClass(character);
  const prevLevelRef = useRef(character.level);
  const prevCasterTypeRef = useRef(primaryClass.spellcasterType);

  const spellcasterType = (primaryClass.spellcasterType || 'none') as SpellcasterType;
  const spellcastingAbility = primaryClass.spellcastingAbility || 'int';
  const isSpellcaster = spellcasterType !== 'none';

  // Update primary class (updates both classes array and legacy fields)
  const updatePrimaryClass = (classChanges: Partial<CharacterClass>) => {
    const updatedClass = { ...primaryClass, ...classChanges };
    const classes = character.classes ? [...character.classes] : [];
    classes[0] = updatedClass;

    // Build legacy field updates for backward compatibility
    const legacyUpdates: Partial<Character> = {};
    if ('name' in classChanges) legacyUpdates.class = classChanges.name;
    if ('subclass' in classChanges) legacyUpdates.subclass = classChanges.subclass;
    if ('level' in classChanges) legacyUpdates.level = classChanges.level;
    if ('hitDice' in classChanges) legacyUpdates.hitDice = classChanges.hitDice;
    if ('hitDiceUsed' in classChanges) legacyUpdates.hitDiceUsed = classChanges.hitDiceUsed;
    if ('spellcasterType' in classChanges) legacyUpdates.spellcasterType = classChanges.spellcasterType;
    if ('spellcastingAbility' in classChanges) legacyUpdates.spellcastingAbility = classChanges.spellcastingAbility;

    updateCharacter(gameId, character.id, {
      classes,
      ...legacyUpdates,
    });
  };

  // Auto-update spell slots when level or caster type changes (only for auto types)
  useEffect(() => {
    const levelChanged = prevLevelRef.current !== character.level;
    const casterTypeChanged = prevCasterTypeRef.current !== primaryClass.spellcasterType;
    const isAutoType = spellcasterType === 'full' || spellcasterType === 'half' || spellcasterType === 'warlock';

    if ((levelChanged || casterTypeChanged) && isAutoType) {
      const newSlots = getSpellSlotsForLevel(spellcasterType, character.level);
      updateCharacter(gameId, character.id, { spellSlots: newSlots });
    }

    prevLevelRef.current = character.level;
    prevCasterTypeRef.current = primaryClass.spellcasterType;
  }, [character.level, primaryClass.spellcasterType, spellcasterType, gameId, character.id]);

  const handleCasterTypeChange = async (type: SpellcasterType) => {
    // Update primary class
    const updatedClass = { ...primaryClass, spellcasterType: type };
    const classes = character.classes ? [...character.classes] : [];
    classes[0] = updatedClass;

    if (type === 'none') {
      // Clear all slots and hide spells tab
      await updateCharacter(gameId, character.id, {
        classes,
        spellcasterType: type,
        spellSlots: {},
        hideSpellsTab: true,
      });
    } else if (type === 'manual') {
      // Keep current slots, just change type, show spells tab
      await updateCharacter(gameId, character.id, {
        classes,
        spellcasterType: type,
        hideSpellsTab: false,
      });
    } else {
      // Auto types - set slots based on level, show spells tab
      const newSlots = getSpellSlotsForLevel(type, character.level);
      await updateCharacter(gameId, character.id, {
        classes,
        spellcasterType: type,
        spellSlots: newSlots,
        hideSpellsTab: false,
      });
    }
  };

  const handleSpellcastingAbilityChange = async (ability: AbilityName) => {
    updatePrimaryClass({ spellcastingAbility: ability });
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
  const hasClass = primaryClass.name && primaryClass.name.trim() !== '';

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
              {hasClass ? primaryClass.name : 'No Class'}
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
                value={primaryClass.name}
                onChange={(e) => updatePrimaryClass({ name: e.target.value })}
                placeholder="Fighter, Wizard, Rogue..."
              />
            </div>

            {/* Subclass */}
            <div className="cs-class-field">
              <label>Subclass</label>
              <input
                type="text"
                value={primaryClass.subclass || ''}
                onChange={(e) => updatePrimaryClass({ subclass: e.target.value })}
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

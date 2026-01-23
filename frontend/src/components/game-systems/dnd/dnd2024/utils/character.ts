// D&D 2024 - Character Utility Functions

import type { Character, CharacterClass } from 'shared';

/**
 * Get primary class from character (supports both old and new structure)
 *
 * For multiclassing support, character data can be stored in two ways:
 * - New: `classes` array with CharacterClass objects
 * - Legacy: flat fields (class, subclass, level, hitDice, etc.)
 *
 * This helper provides backward compatibility by checking for the new
 * structure first, then falling back to legacy fields.
 */
export function getPrimaryClass(character: Character): CharacterClass {
  // Prefer new classes array
  if (character.classes && character.classes.length > 0) {
    return character.classes[0];
  }
  // Fall back to legacy fields
  return {
    name: character.class || '',
    subclass: character.subclass,
    level: character.level,
    hitDice: character.hitDice,
    hitDiceUsed: character.hitDiceUsed,
    spellcasterType: character.spellcasterType,
    spellcastingAbility: character.spellcastingAbility,
  };
}

/**
 * Get total level from all classes
 */
export function getTotalLevel(character: Character): number {
  if (character.classes && character.classes.length > 0) {
    return character.classes.reduce((sum, c) => sum + c.level, 0);
  }
  return character.level;
}

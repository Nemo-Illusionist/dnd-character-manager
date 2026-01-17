// D&D Core - Calculation Utilities
// Shared between D&D 2014 and D&D 2024

import type { Character, AbilityName, SkillName } from 'shared';
import { SKILL_ABILITIES } from '../constants/skills';

/**
 * Calculate ability modifier from ability score
 * Formula: floor((score - 10) / 2)
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate skill modifier
 * @param character - The character
 * @param skill - The skill name
 * @param proficiencyBonus - The character's proficiency bonus
 */
export function getSkillModifier(
  character: Character,
  skill: SkillName,
  proficiencyBonus: number
): number {
  const ability = SKILL_ABILITIES[skill];
  const abilityMod = getAbilityModifier(character.abilities[ability]);
  const proficiency = character.skills[skill].proficiency;

  return abilityMod + (proficiency * proficiencyBonus);
}

/**
 * Calculate saving throw modifier
 * @param character - The character
 * @param ability - The ability name
 * @param proficiencyBonus - The character's proficiency bonus
 */
export function getSavingThrowModifier(
  character: Character,
  ability: AbilityName,
  proficiencyBonus: number
): number {
  const abilityMod = getAbilityModifier(character.abilities[ability]);
  const isProficient = character.savingThrows[ability].proficiency;

  return abilityMod + (isProficient ? proficiencyBonus : 0);
}

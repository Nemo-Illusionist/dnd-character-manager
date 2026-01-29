import type { AbilityName, SkillName } from './enums';

// ==================== HELPER FUNCTIONS ====================

// Ability score modifier calculation helper
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Skill ability mapping (D&D 2024 SRD 5.2)
export const SKILL_ABILITIES: Record<SkillName, AbilityName> = {
  'Acrobatics': 'dex',
  'Animal Handling': 'wis',
  'Arcana': 'int',
  'Athletics': 'str',
  'Deception': 'cha',
  'History': 'int',
  'Insight': 'wis',
  'Intimidation': 'cha',
  'Investigation': 'int',
  'Medicine': 'wis',
  'Nature': 'int',
  'Perception': 'wis',
  'Performance': 'cha',
  'Persuasion': 'cha',
  'Religion': 'int',
  'Sleight of Hand': 'dex',
  'Stealth': 'dex',
  'Survival': 'wis',
};

// Default proficiency bonus by level (D&D 2024 SRD 5.2)
export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

// D&D Core - Skill Constants
// Shared between D&D 2014 and D&D 2024

import type { AbilityName, SkillName } from 'shared';

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

// Group skills by ability
export function getSkillsByAbility(): Record<AbilityName, SkillName[]> {
  const grouped: Record<AbilityName, SkillName[]> = {
    str: [],
    dex: [],
    con: [],
    int: [],
    wis: [],
    cha: [],
  };

  (Object.keys(SKILL_ABILITIES) as SkillName[]).forEach((skill) => {
    grouped[SKILL_ABILITIES[skill]].push(skill);
  });

  // Sort each group alphabetically
  Object.keys(grouped).forEach((ability) => {
    grouped[ability as AbilityName].sort((a, b) => a.localeCompare(b));
  });

  return grouped;
}

export const SKILLS_BY_ABILITY = getSkillsByAbility();

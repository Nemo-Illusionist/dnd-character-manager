// D&D Core - Ability Constants
// Shared between D&D 2014 and D&D 2024

import type { AbilityName } from 'shared';

export const ABILITY_NAMES: Record<AbilityName, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export const ABILITY_ORDER: AbilityName[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

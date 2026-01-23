// D&D 2024 Spell Slots by Caster Type and Level

// Re-export SpellcasterType from shared for convenience
import type { SpellcasterType } from 'shared';
export type { SpellcasterType } from 'shared';

export interface SpellSlotConfig {
  [level: number]: { max: number }; // level 1-9
}

// Full Caster (Wizard, Cleric, Druid, Sorcerer, Bard)
export const FULL_CASTER_SLOTS: Record<number, SpellSlotConfig> = {
  1:  { 1: { max: 2 } },
  2:  { 1: { max: 3 } },
  3:  { 1: { max: 4 }, 2: { max: 2 } },
  4:  { 1: { max: 4 }, 2: { max: 3 } },
  5:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 2 } },
  6:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 } },
  7:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 1 } },
  8:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 2 } },
  9:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 1 } },
  10: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 } },
  11: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 } },
  12: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 } },
  13: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 }, 7: { max: 1 } },
  14: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 }, 7: { max: 1 } },
  15: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 }, 7: { max: 1 }, 8: { max: 1 } },
  16: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 }, 7: { max: 1 }, 8: { max: 1 } },
  17: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 }, 7: { max: 1 }, 8: { max: 1 }, 9: { max: 1 } },
  18: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 3 }, 6: { max: 1 }, 7: { max: 1 }, 8: { max: 1 }, 9: { max: 1 } },
  19: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 3 }, 6: { max: 2 }, 7: { max: 1 }, 8: { max: 1 }, 9: { max: 1 } },
  20: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 3 }, 6: { max: 2 }, 7: { max: 2 }, 8: { max: 1 }, 9: { max: 1 } },
};

// Half Caster (Paladin, Ranger, Artificer)
export const HALF_CASTER_SLOTS: Record<number, SpellSlotConfig> = {
  1:  {},
  2:  { 1: { max: 2 } },
  3:  { 1: { max: 3 } },
  4:  { 1: { max: 3 } },
  5:  { 1: { max: 4 }, 2: { max: 2 } },
  6:  { 1: { max: 4 }, 2: { max: 2 } },
  7:  { 1: { max: 4 }, 2: { max: 3 } },
  8:  { 1: { max: 4 }, 2: { max: 3 } },
  9:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 2 } },
  10: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 2 } },
  11: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 } },
  12: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 } },
  13: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 1 } },
  14: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 1 } },
  15: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 2 } },
  16: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 2 } },
  17: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 1 } },
  18: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 1 } },
  19: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 } },
  20: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 } },
};

// Warlock (Pact Magic - all slots same level, short rest recovery)
export const WARLOCK_SLOTS: Record<number, SpellSlotConfig> = {
  1:  { 1: { max: 1 } },
  2:  { 1: { max: 2 } },
  3:  { 2: { max: 2 } },
  4:  { 2: { max: 2 } },
  5:  { 3: { max: 2 } },
  6:  { 3: { max: 2 } },
  7:  { 4: { max: 2 } },
  8:  { 4: { max: 2 } },
  9:  { 5: { max: 2 } },
  10: { 5: { max: 2 } },
  11: { 5: { max: 3 } },
  12: { 5: { max: 3 } },
  13: { 5: { max: 3 } },
  14: { 5: { max: 3 } },
  15: { 5: { max: 3 } },
  16: { 5: { max: 3 } },
  17: { 5: { max: 4 } },
  18: { 5: { max: 4 } },
  19: { 5: { max: 4 } },
  20: { 5: { max: 4 } },
};

// Get spell slots for a given caster type and level
export function getSpellSlotsForLevel(
  casterType: SpellcasterType,
  level: number
): Record<number, { current: number; max: number }> {
  let config: SpellSlotConfig = {};

  switch (casterType) {
    case 'full':
      config = FULL_CASTER_SLOTS[level] || {};
      break;
    case 'half':
      config = HALF_CASTER_SLOTS[level] || {};
      break;
    case 'warlock':
      config = WARLOCK_SLOTS[level] || {};
      break;
    case 'none':
    default:
      config = {};
  }

  // Convert to full slot format with current = max (full slots)
  const result: Record<number, { current: number; max: number }> = {};
  for (let i = 1; i <= 9; i++) {
    const slotConfig = config[i];
    result[i] = { current: slotConfig?.max || 0, max: slotConfig?.max || 0 };
  }
  return result;
}

export const CASTER_TYPE_NAMES: Record<SpellcasterType, string> = {
  none: 'None',
  full: 'Full Caster',
  half: 'Half Caster',
  warlock: 'Warlock',
  manual: 'Manual',
};

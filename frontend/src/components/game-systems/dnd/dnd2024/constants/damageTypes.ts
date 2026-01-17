// D&D 2024 - Damage Types

export const DAMAGE_TYPES = [
  'Bludgeoning',
  'Piercing',
  'Slashing',
  'Acid',
  'Cold',
  'Fire',
  'Force',
  'Lightning',
  'Necrotic',
  'Poison',
  'Psychic',
  'Radiant',
  'Thunder',
] as const;

export type DamageType = typeof DAMAGE_TYPES[number];

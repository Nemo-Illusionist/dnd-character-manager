// Game System Types
// Defines interfaces for supporting multiple game systems (D&D 2024, D&D 2014, etc.)

import type { Character, AbilityName, SkillName } from 'shared';

export interface GameSystemConfig {
  id: string;                    // 'dnd-2024', 'dnd-2014', 'pathfinder-2e'
  name: string;                  // 'D&D 2024', 'D&D 2014', 'Pathfinder 2e'
  version: string;               // '5.2.1' for SRD version
}

export interface CharacterSheetProps {
  character: Character;
  gameId: string;
  onBack?: () => void;
}

export interface GameSystem {
  config: GameSystemConfig;

  // The main character sheet component for this system
  CharacterSheet: React.ComponentType<CharacterSheetProps>;

  // Calculation functions
  getAbilityModifier: (score: number) => number;
  getProficiencyBonus: (level: number) => number;
  getSkillModifier: (character: Character, skill: SkillName) => number;
  getSavingThrowModifier: (character: Character, ability: AbilityName) => number;

  // Constants
  constants: {
    abilityNames: Record<AbilityName, string>;
    abilityOrder: AbilityName[];
    skillAbilities: Record<SkillName, AbilityName>;
    xpThresholds?: number[];
  };
}

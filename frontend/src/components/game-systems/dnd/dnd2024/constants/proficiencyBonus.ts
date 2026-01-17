// D&D 2024 - Proficiency Bonus Calculation

// Calculate proficiency bonus based on level (D&D 2024)
export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

// D&D Core - Skill Row Component
// Reusable skill display row for all D&D versions

import type { SkillName } from 'shared';

interface SkillRowProps {
  skill: SkillName;
  modifier: number;
  proficiency: 0 | 1 | 2;
  onClick?: () => void;
  compact?: boolean;
}

export function SkillRow({ skill, modifier, proficiency, onClick, compact = false }: SkillRowProps) {
  const classPrefix = compact ? 'cs-compact-skill' : 'cs-skill';

  return (
    <div
      className={`${classPrefix}-row proficiency-${proficiency}`}
      onClick={onClick}
    >
      <div className={`${classPrefix}-indicator`}>
        {proficiency === 2 ? '◉' : proficiency === 1 ? '●' : '○'}
      </div>
      <span className={`${classPrefix}-name`}>{skill}</span>
      <span className={`${classPrefix}-modifier`}>
        {modifier >= 0 ? '+' : ''}{modifier}
      </span>
    </div>
  );
}

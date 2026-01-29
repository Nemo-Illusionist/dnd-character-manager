// CombatStatsRow - Shared combat stats display (Inspiration, Initiative, Exhaustion, Conditions)

import { useCharacterStats } from '../../hooks';
import type { Character } from 'shared';

interface CombatStatsRowProps {
  character: Character;
  gameId: string;
  onConditionsClick: () => void;
  onInitiativeClick?: () => void;
  variant?: 'compact' | 'expanded';
}

export function CombatStatsRow({
  character,
  gameId,
  onConditionsClick,
  onInitiativeClick,
  variant = 'compact',
}: CombatStatsRowProps) {
  const {
    displayedInitiative,
    activeConditions,
    conditionsCount,
    handleInspirationToggle,
    handleExhaustionChange,
  } = useCharacterStats(character, gameId);

  return (
    <>
      <div
        className="cs-mini-stat"
        style={{ cursor: 'pointer' }}
        onClick={handleInspirationToggle}
      >
        <div className="cs-mini-label">Inspiration</div>
        <div className="cs-mini-value">{character.inspiration ? '✓' : '—'}</div>
      </div>

      <div
        className="cs-mini-stat"
        style={onInitiativeClick ? { cursor: 'pointer' } : undefined}
        onClick={onInitiativeClick}
      >
        <div className="cs-mini-label">Initiative</div>
        <div className="cs-mini-value">
          {displayedInitiative >= 0 ? '+' : ''}{displayedInitiative}
        </div>
      </div>

      <div className="cs-mini-stat">
        <div className="cs-mini-label">Exhaustion</div>
        <select
          className="cs-mini-value cs-exhaustion-select"
          value={character.exhaustion || 0}
          onChange={(e) => handleExhaustionChange(Number(e.target.value))}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div
        className={`cs-mini-stat${variant === 'expanded' ? ' cs-conditions-stat' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={onConditionsClick}
      >
        <div className="cs-mini-label">Conditions</div>
        {variant === 'expanded' ? (
          <>
            <div className="cs-mini-value cs-conditions-compact">
              {conditionsCount > 0 ? conditionsCount : '—'}
            </div>
            <div className="cs-conditions-expanded">
              {conditionsCount === 0
                ? '—'
                : conditionsCount <= 2
                  ? activeConditions.join(', ')
                  : `${activeConditions.slice(0, 2).join(', ')}...`}
            </div>
          </>
        ) : (
          <div className="cs-mini-value">
            {conditionsCount > 0 ? conditionsCount : '—'}
          </div>
        )}
      </div>
    </>
  );
}

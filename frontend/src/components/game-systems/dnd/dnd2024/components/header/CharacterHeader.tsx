// D&D 2024 - Character Header Component (Refactored)

import { useModalState } from '../../../../../../hooks';
import { getProficiencyBonus } from '../../constants';
import { useCharacterStats } from '../../hooks';
import { CombatStatsRow } from '../shared';
import { HPBoxDesktop, HPBoxMobile, HPModal } from '../hp';
import { LevelXPModal, ConditionsModal, CombatStatsModal } from '../modals';
import type { Character } from 'shared';
import './CharacterHeader.scss';

interface CharacterHeaderProps {
  character: Character;
  gameId: string;
  expanded: boolean;
  onToggleExpand: () => void;
}

export function CharacterHeader({ character, gameId, expanded, onToggleExpand }: CharacterHeaderProps) {
  // Modal states using the new hook
  const levelModal = useModalState();
  const hpModal = useModalState();
  const conditionsModal = useModalState();
  const combatStatsModal = useModalState();

  // Character stats hook
  const { totalAC } = useCharacterStats(character, gameId);

  return (
    <>
      <div className="cs-header">
        {/* Desktop Layout */}
        <div className="cs-header-desktop">
          <div className="cs-header-left">
            <div className="cs-name-block">
              <h1 className="cs-name">{character.name}</h1>
            </div>
            <p className="cs-subtitle">{character.race}</p>
            <p className="cs-subtitle">{character.class} {character.subclass && `(${character.subclass})`}</p>
            <button className="cs-level-btn" onClick={levelModal.open}>
              Level {character.level}
            </button>
          </div>

          <div className="cs-header-right">
            <div className="cs-combat-stats-desktop">
              <div className="cs-stat-item cs-clickable" onClick={combatStatsModal.open}>
                <div className="cs-stat-value cs-bordered">{totalAC}</div>
                <div className="cs-stat-label">Armor</div>
              </div>
              <div className="cs-stat-item cs-clickable" onClick={combatStatsModal.open}>
                <div className="cs-stat-value">{character.speed}</div>
                <div className="cs-stat-label">Speed</div>
              </div>
              <div className="cs-stat-item cs-stat-proficiency">
                <div className="cs-stat-value">+{getProficiencyBonus(character.level)}</div>
                <div className="cs-stat-label">Proficiency</div>
              </div>
            </div>
            <HPBoxDesktop character={character} gameId={gameId} onOpenModal={hpModal.open} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="cs-header-mobile">
          {/* Expandable content - always rendered, visibility controlled by CSS */}
          <div className={`cs-mobile-expanded ${expanded ? 'expanded' : 'collapsed'}`}>
            <div className="cs-mobile-expanded-inner">
              <div className="cs-name-block">
                <h1 className="cs-name">{character.name}</h1>
              </div>
              <p className="cs-subtitle">
                {character.race} — {character.class} {character.subclass && `(${character.subclass})`}
              </p>

              <button className="cs-level-btn-mobile" onClick={levelModal.open}>
                Level {character.level}
              </button>

              {/* 4 stat blocks */}
              <div className="cs-expanded-stats">
                <CombatStatsRow
                  character={character}
                  gameId={gameId}
                  onConditionsClick={conditionsModal.open}
                  onInitiativeClick={combatStatsModal.open}
                />
              </div>
            </div>
          </div>

          {/* Always visible stats */}
          <div className="cs-quick-stats-mobile">
            <div className="cs-combat-stats-mobile">
              <div className="cs-stat-item cs-clickable" onClick={combatStatsModal.open}>
                <div className="cs-stat-value cs-bordered">{totalAC}</div>
                <div className="cs-stat-label">Armor</div>
              </div>
              <div className="cs-stat-item cs-clickable" onClick={combatStatsModal.open}>
                <div className="cs-stat-value">{character.speed}</div>
                <div className="cs-stat-label">Speed</div>
              </div>
            </div>

            <HPBoxMobile character={character} onClick={hpModal.open} />
          </div>

          {/* Collapse toggle - mobile only */}
          <button className="cs-collapse-btn" onClick={onToggleExpand}>
            {expanded ? 'Collapse ▲' : 'Expand ▼'}
          </button>
        </div>
      </div>

      {/* Modals */}
      {levelModal.isOpen && (
        <LevelXPModal
          character={character}
          gameId={gameId}
          onClose={levelModal.close}
        />
      )}

      {hpModal.isOpen && (
        <HPModal
          character={character}
          gameId={gameId}
          onClose={hpModal.close}
        />
      )}

      {conditionsModal.isOpen && (
        <ConditionsModal
          character={character}
          gameId={gameId}
          onClose={conditionsModal.close}
        />
      )}

      {combatStatsModal.isOpen && (
        <CombatStatsModal
          character={character}
          gameId={gameId}
          onClose={combatStatsModal.close}
        />
      )}
    </>
  );
}


// Character Sheet Page - Full D&D 2024 character sheet
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCharacter } from '../hooks/useCharacter';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import {
  getAbilityModifier,
  getSavingThrowModifier,
  getSkillModifier,
  updateCharacter,
} from '../services/characters.service';
import type { Character, AbilityName, SkillName } from 'shared';
import './CharacterSheetPage.css';

// Skill ability mapping (D&D 2024 SRD 5.2)
const SKILL_ABILITIES: Record<SkillName, AbilityName> = {
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

const ABILITY_NAMES: Record<AbilityName, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

const ABILITY_ORDER: AbilityName[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

// Group skills by ability
function getSkillsByAbility(): Record<AbilityName, SkillName[]> {
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

const SKILLS_BY_ABILITY = getSkillsByAbility();

export default function CharacterSheetPage() {
  const navigate = useNavigate();
  const { gameId, characterId } = useParams<{ gameId: string; characterId: string }>();
  const { character, loading } = useCharacter(gameId || null, characterId || null);
  const [headerExpanded, setHeaderExpanded] = useState(true);

  const handleBack = () => {
    navigate(`/games/${gameId}`);
  };

  if (loading) {
    return (
        <div className="character-sheet-page">
          <div className="character-sheet-loading">
            <LoadingSpinner size="large" />
            <p>Loading character...</p>
          </div>
        </div>
    );
  }

  if (!character) {
    return (
        <div className="character-sheet-page">
          <div className="character-sheet-error">
            <h2>Character Not Found</h2>
            <Button onClick={handleBack}>Back to Characters</Button>
          </div>
        </div>
    );
  }

  return (
      <div className="character-sheet-page">
        <CharacterHeader
            character={character}
            gameId={gameId!}
            expanded={headerExpanded}
            onToggleExpand={() => setHeaderExpanded(!headerExpanded)}
        />

        <div className="character-sheet-content">
          <AbilitiesAndSkillsSection character={character} gameId={gameId!} />
        </div>
      </div>
  );
}

// ==================== SETTINGS MODAL ====================

interface SettingsModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

function SettingsModal({ character, gameId, onClose }: SettingsModalProps) {
  const [formData, setFormData] = useState({
    name: character.name,
    race: character.race,
    class: character.class,
    subclass: character.subclass || '',
    ac: character.ac,
    speed: character.speed,
  });

  const handleSave = async () => {
    await updateCharacter(gameId, character.id, {
      name: formData.name,
      race: formData.race,
      class: formData.class,
      subclass: formData.subclass,
      ac: formData.ac,
      speed: formData.speed,
    });
    onClose();
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-header">
          <h2>Character Settings</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          <div className="cs-form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Background</label>
            <input
              type="text"
              value={formData.race}
              onChange={(e) => setFormData({ ...formData, race: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Class</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Subclass</label>
            <input
              type="text"
              value={formData.subclass}
              onChange={(e) => setFormData({ ...formData, subclass: e.target.value })}
            />
          </div>

          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Armor Class</label>
              <input
                type="number"
                value={formData.ac}
                onChange={(e) => setFormData({ ...formData, ac: parseInt(e.target.value) || 10 })}
              />
            </div>

            <div className="cs-form-group">
              <label>Speed</label>
              <input
                type="number"
                value={formData.speed}
                onChange={(e) => setFormData({ ...formData, speed: parseInt(e.target.value) || 30 })}
              />
            </div>
          </div>
        </div>

        <div className="cs-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}

// ==================== LEVEL/XP MODAL ====================

interface LevelXPModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

// XP thresholds for each level (D&D 2024 SRD)
const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

function LevelXPModal({ character, gameId, onClose }: LevelXPModalProps) {
  const [currentXP, setCurrentXP] = useState(character.experience || 0);
  const [gainXPInput, setGainXPInput] = useState('');
  const [message, setMessage] = useState('');

  // Sync currentXP with character.experience when it changes
  useEffect(() => {
    setCurrentXP(character.experience || 0);
  }, [character.experience]);

  const calculateLevel = (xp: number): number => {
    for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= XP_THRESHOLDS[i]) {
        return Math.min(i + 1, 20);
      }
    }
    return 1;
  };

  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = currentLevel < 20 ? XP_THRESHOLDS[currentLevel] : null;

  const handleLevelUp = async () => {
    if (character.level >= 20) {
      setMessage('Maximum level reached!');
      return;
    }

    const newLevel = character.level + 1;
    const newXP = XP_THRESHOLDS[newLevel - 1] || 0;

    await updateCharacter(gameId, character.id, {
      level: newLevel,
      experience: newXP,
    });

    setCurrentXP(newXP);
    setMessage(`Level increased to ${newLevel}!`);
  };

  const handleXPChange = async () => {
    await updateCharacter(gameId, character.id, {
      experience: currentXP,
      level: currentLevel,
    });
    setMessage('Experience updated!');
  };

  const handleGainXP = async () => {
    const gainedXP = parseInt(gainXPInput) || 0;
    if (gainedXP <= 0) return;

    const newXP = currentXP + gainedXP;
    const oldLevel = currentLevel;
    const newLevel = calculateLevel(newXP);

    setCurrentXP(newXP);
    setGainXPInput('');

    await updateCharacter(gameId, character.id, {
      experience: newXP,
      level: newLevel,
    });

    if (newLevel > oldLevel) {
      setMessage(`Gained ${gainedXP} XP! Level increased to ${newLevel}!`);
    } else {
      setMessage(`Gained ${gainedXP} XP!`);
    }
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-header">
          <h2>Level & Experience</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {/* Current Level */}
          <div className="cs-level-section">
            <div className="cs-level-display">
              <span className="cs-level-current">Level {character.level}</span>
              {character.level < 20 && (
                <button className="cs-level-up-btn" onClick={handleLevelUp}>Level Up</button>
              )}
            </div>
          </div>

          {/* Current XP */}
          <div className="cs-form-group">
            <label>Current Experience</label>
            <div className="cs-xp-input-row">
              <input
                type="number"
                value={currentXP}
                onChange={(e) => setCurrentXP(parseInt(e.target.value) || 0)}
              />
              <Button variant="secondary" onClick={handleXPChange}>Update</Button>
            </div>
            {nextLevelXP && (
              <small className="cs-xp-info">
                {nextLevelXP - currentXP} XP until level {currentLevel + 1}
              </small>
            )}
          </div>

          {/* Gain XP */}
          <div className="cs-form-group">
            <label>Gain Experience</label>
            <div className="cs-xp-input-row">
              <input
                type="number"
                placeholder="Enter XP gained"
                value={gainXPInput}
                onChange={(e) => setGainXPInput(e.target.value)}
              />
              <Button onClick={handleGainXP}>Add</Button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="cs-message">{message}</div>
          )}
        </div>

        <div className="cs-modal-footer">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

// ==================== HEADER ====================

interface CharacterHeaderProps {
  character: Character;
  gameId: string;
  expanded: boolean;
  onToggleExpand: () => void;
}

function CharacterHeader({ character, gameId, expanded, onToggleExpand }: CharacterHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);

  const handleHpChange = async (field: 'current' | 'max' | 'temp', delta: number) => {
    const newValue = Math.max(0, character.hp[field] + delta);
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, [field]: newValue },
    });
  };

  const initiativeModifier = getAbilityModifier(character.abilities.dex);

  return (
      <>
        <div className="cs-header">
          {/* Desktop Layout */}
          <div className="cs-header-desktop">
            <div className="cs-header-left">
              <div className="cs-name-block">
                <h1 className="cs-name">{character.name}</h1>
                <button className="cs-settings-btn" onClick={() => setSettingsOpen(true)}>
                  ⚙️
                </button>
              </div>
              <p className="cs-subtitle">{character.race}</p>
              <p className="cs-subtitle">{character.class} {character.subclass && `(${character.subclass})`}</p>
              <button
                className="cs-level-btn"
                onClick={() => setLevelModalOpen(true)}
              >
                Level {character.level}
              </button>
            </div>

            <div className="cs-header-right">
              <div className="cs-stats-grid">
                <div className="cs-stat-values">
                  <div className="cs-stat-value cs-bordered">{character.ac}</div>
                  <div className="cs-stat-value">{character.speed}</div>
                  <div className="cs-stat-value">{character.proficiencyBonus}</div>
                </div>
                <div className="cs-stat-labels">
                  <div className="cs-stat-label">Armor</div>
                  <div className="cs-stat-label">Speed</div>
                  <div className="cs-stat-label">Proficiency</div>
                </div>
              </div>
              <div className="cs-hp-box">
                <button className="cs-hp-btn minus" onClick={() => handleHpChange('current', -1)}>−</button>
                <div className="cs-hp-display">
                  <span className="cs-hp-current">{character.hp.current}</span>
                  <span className="cs-hp-separator">/</span>
                  <span className="cs-hp-max">{character.hp.max}</span>
                </div>
                <button className="cs-hp-btn plus" onClick={() => handleHpChange('current', 1)}>+</button>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="cs-header-mobile">
            {/* Expandable content */}
            {expanded && (
              <div className="cs-mobile-expanded">
                <div className="cs-name-block">
                  <h1 className="cs-name">{character.name}</h1>
                  <button className="cs-settings-btn" onClick={() => setSettingsOpen(true)}>
                    ⚙️
                  </button>
                </div>
                <p className="cs-subtitle">
                  {character.race} — {character.class} {character.subclass && `(${character.subclass})`}
                </p>

                <button
                  className="cs-level-btn-mobile"
                  onClick={() => setLevelModalOpen(true)}
                >
                  Level {character.level}
                </button>

                {/* 4 stat blocks */}
                <div className="cs-expanded-stats">
                  <div
                    className="cs-mini-stat"
                    style={{ cursor: 'pointer' }}
                    onClick={async () => {
                      await updateCharacter(gameId, character.id, {
                        inspiration: !character.inspiration,
                      });
                    }}
                  >
                    <div className="cs-mini-label">Inspiration</div>
                    <div className="cs-mini-value">{character.inspiration ? '✓' : '—'}</div>
                  </div>
                  <div className="cs-mini-stat">
                    <div className="cs-mini-label">Initiative</div>
                    <div className="cs-mini-value">
                      {initiativeModifier >= 0 ? '+' : ''}{initiativeModifier}
                    </div>
                  </div>
                  <div className="cs-mini-stat">
                    <div className="cs-mini-label">Conditions</div>
                    <div className="cs-mini-value">0</div>
                  </div>
                  <div className="cs-mini-stat">
                    <div className="cs-mini-label">Exhaustion</div>
                    <select
                      className="cs-mini-value cs-exhaustion-select"
                      value={character.exhaustion || 0}
                      onChange={async (e) => {
                        await updateCharacter(gameId, character.id, {
                          exhaustion: Number(e.target.value),
                        });
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Always visible stats */}
            <div className="cs-quick-stats-mobile">
              <div className="cs-stats-left">
                <div className="cs-stat-item">
                  <div className="cs-stat-value cs-bordered">{character.ac}</div>
                  <div className="cs-stat-label">Armor</div>
                </div>
                <div className="cs-stat-item">
                  <div className="cs-stat-value">{character.speed}</div>
                  <div className="cs-stat-label">Speed</div>
                </div>
              </div>

              <div className="cs-hp-box">
                <button className="cs-hp-btn minus" onClick={() => handleHpChange('current', -1)}>−</button>
                <div className="cs-hp-display">
                  <span className="cs-hp-current">{character.hp.current}</span>
                  <span className="cs-hp-separator">/</span>
                  <span className="cs-hp-max">{character.hp.max}</span>
                </div>
                <button className="cs-hp-btn plus" onClick={() => handleHpChange('current', 1)}>+</button>
              </div>
            </div>

            {/* Collapse toggle - mobile only */}
            <button className="cs-collapse-btn" onClick={onToggleExpand}>
              {expanded ? 'Collapse ▲' : 'Expand ▼'}
            </button>
          </div>
        </div>

        {/* Settings Modal */}
        {settingsOpen && (
          <SettingsModal
            character={character}
            gameId={gameId}
            onClose={() => setSettingsOpen(false)}
          />
        )}

        {/* Level/XP Modal */}
        {levelModalOpen && (
          <LevelXPModal
            character={character}
            gameId={gameId}
            onClose={() => setLevelModalOpen(false)}
          />
        )}
      </>
  );
}

// ==================== ABILITIES & SKILLS SECTION ====================

interface AbilitiesSkillsProps {
  character: Character;
  gameId: string;
}

function AbilitiesAndSkillsSection({ character, gameId }: AbilitiesSkillsProps) {
  const handleAbilityChange = async (ability: AbilityName, value: number) => {
    await updateCharacter(gameId, character.id, {
      abilities: {
        ...character.abilities,
        [ability]: Math.max(1, Math.min(30, value)),
      },
    });
  };

  const handleSkillProficiencyToggle = async (skill: SkillName) => {
    const current = character.skills[skill].proficiency;
    const next = current === 2 ? 0 : current + 1;

    await updateCharacter(gameId, character.id, {
      skills: {
        ...character.skills,
        [skill]: { proficiency: next as 0 | 1 | 2 },
      },
    });
  };

  const handleSavingThrowToggle = async (ability: AbilityName) => {
    await updateCharacter(gameId, character.id, {
      savingThrows: {
        ...character.savingThrows,
        [ability]: { proficiency: !character.savingThrows[ability].proficiency },
      },
    });
  };

  return (
      <div className="cs-abilities-skills">
        <div className="cs-section-header">
          <h2>Abilities & Skills</h2>
          <button className="cs-section-menu">≡</button>
        </div>

        {ABILITY_ORDER.map((ability) => (
            <AbilityBlock
                key={ability}
                ability={ability}
                character={character}
                onAbilityChange={handleAbilityChange}
                onSavingThrowToggle={handleSavingThrowToggle}
                onSkillProficiencyToggle={handleSkillProficiencyToggle}
            />
        ))}
      </div>
  );
}

// ==================== ABILITY BLOCK ====================

interface AbilityBlockProps {
  ability: AbilityName;
  character: Character;
  onAbilityChange: (ability: AbilityName, value: number) => void;
  onSavingThrowToggle: (ability: AbilityName) => void;
  onSkillProficiencyToggle: (skill: SkillName) => void;
}

function AbilityBlock({
                        ability,
                        character,
                        onAbilityChange,
                        onSavingThrowToggle,
                        onSkillProficiencyToggle,
                      }: AbilityBlockProps) {
  const score = character.abilities[ability];
  const modifier = getAbilityModifier(score);
  const saveModifier = getSavingThrowModifier(character, ability);
  const saveProficient = character.savingThrows[ability].proficiency;
  const skills = SKILLS_BY_ABILITY[ability];

  return (
      <div className="cs-ability-block">
        {/* Ability Header */}
        <div className="cs-ability-header">
          <h3 className="cs-ability-name">{ABILITY_NAMES[ability].toUpperCase()}</h3>
          <input
              type="number"
              className="cs-ability-score"
              value={score}
              onChange={(e) => onAbilityChange(ability, parseInt(e.target.value) || 10)}
              min="1"
              max="30"
          />
        </div>

        {/* Check & Saving Throw row */}
        <div className="cs-ability-modifiers">
          <div className="cs-modifier-box">
            <span className="cs-modifier-label">Check</span>
            <span className="cs-modifier-value">
            {modifier >= 0 ? '+' : ''}{modifier}
          </span>
          </div>
          <div
              className={`cs-modifier-box cs-save ${saveProficient ? 'proficient' : ''}`}
              onClick={() => onSavingThrowToggle(ability)}
          >
            <span className="cs-modifier-label">Saving Throw</span>
            <span className="cs-modifier-value">
            {saveModifier >= 0 ? '+' : ''}{saveModifier}
          </span>
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
            <div className="cs-skills-list">
              {skills.map((skill) => {
                const skillMod = getSkillModifier(character, skill);
                const proficiency = character.skills[skill].proficiency;

                return (
                    <div
                        key={skill}
                        className={`cs-skill-row proficiency-${proficiency}`}
                        onClick={() => onSkillProficiencyToggle(skill)}
                    >
                      <div className="cs-skill-indicator">
                        {proficiency === 2 ? '◉' : proficiency === 1 ? '●' : '○'}
                      </div>
                      <span className="cs-skill-name">{skill}</span>
                      <span className="cs-skill-modifier">
                  {skillMod >= 0 ? '+' : ''}{skillMod}
                </span>
                    </div>
                );
              })}
            </div>
        )}
      </div>
  );
}
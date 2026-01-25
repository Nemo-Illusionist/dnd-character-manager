// D&D 2024 - HP Modal Component (Refactored)
// Supports multiclass hit dice

import { useState } from 'react';
import { useCharacterMutation } from '../../../../../../hooks';
import {
  getClasses,
  getHitDiceByType,
  updateHitDiceUsed,
  applyLongRestHitDiceRecovery,
  isMulticlass,
  getWarlockClass,
} from '../../utils';
import { HPDisplay } from './HPDisplay';
import { HealDamageActions } from './HealDamageActions';
import { DeathSavesSection } from './DeathSavesSection';
import { HPSettingsSection } from './HPSettingsSection';
import { HitDiceSection } from './HitDiceSection';
import type { Character } from 'shared';
import './HP.scss';

interface HPModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function HPModal({ character, gameId, onClose }: HPModalProps) {
  const [currentHP, setCurrentHP] = useState(character.hp.current);
  const [tempHP, setTempHP] = useState(character.hp.temp);
  const [maxHP, setMaxHP] = useState(character.hp.max);
  const [hpBonus, setHpBonus] = useState(character.hpBonus || 0);
  const [amount, setAmount] = useState(0);
  const [showShortRestDialog, setShowShortRestDialog] = useState(false);
  const [shortRestDiceType, setShortRestDiceType] = useState<string>('');
  const [shortRestDiceCount, setShortRestDiceCount] = useState(0);

  const classes = getClasses(character);
  const hitDiceGroups = getHitDiceByType(character);
  const hasMultipleClasses = isMulticlass(character);

  const { update, heal, damage } = useCharacterMutation(gameId, character);

  const effectiveMaxHP = maxHP + hpBonus;

  const handleCurrentHPChange = async (newHP: number) => {
    const clampedHP = Math.max(0, Math.min(effectiveMaxHP, newHP));
    setCurrentHP(clampedHP);
    await update({ hp: { ...character.hp, current: clampedHP } });
  };

  const handleTempHPChange = async (newTemp: number) => {
    const clampedTemp = Math.max(0, newTemp);
    setTempHP(clampedTemp);
    await update({ hp: { ...character.hp, temp: clampedTemp } });
  };

  const handleHeal = async () => {
    if (amount <= 0) return;

    const newCurrent = Math.min(effectiveMaxHP, currentHP + amount);
    setCurrentHP(newCurrent);
    await heal(amount, effectiveMaxHP);
    setAmount(0);
  };

  const handleDamage = async () => {
    if (amount <= 0) return;
    const dmg = amount;

    let remaining = dmg;
    let newTemp = tempHP;
    let newCurrent = currentHP;

    if (newTemp > 0) {
      if (newTemp >= remaining) {
        newTemp -= remaining;
        remaining = 0;
      } else {
        remaining -= newTemp;
        newTemp = 0;
      }
    }

    if (remaining > 0) {
      newCurrent = Math.max(0, newCurrent - remaining);
    }

    setCurrentHP(newCurrent);
    setTempHP(newTemp);
    await damage(dmg, currentHP, tempHP);
    setAmount(0);
  };

  const handleMaxHPChange = async (newMax: number) => {
    setMaxHP(newMax);
    await update({ hp: { ...character.hp, max: newMax } });
  };

  const handleHPBonusChange = async (newBonus: number) => {
    setHpBonus(newBonus);
    await update({ hpBonus: newBonus });
  };

  const handleDeathSaveSuccessChange = async (count: number) => {
    await update({
      deathSaves: { ...(character.deathSaves || { successes: 0, failures: 0 }), successes: count },
    });
  };

  const handleDeathSaveFailureChange = async (count: number) => {
    await update({
      deathSaves: { ...(character.deathSaves || { successes: 0, failures: 0 }), failures: count },
    });
  };

  const handleHitDiceUsedChange = async (diceType: string, newUsed: number) => {
    // Find all classes with this dice type and update their hitDiceUsed
    const updatedClasses = [...classes];
    let remainingUsed = newUsed;

    for (let i = 0; i < updatedClasses.length; i++) {
      const cls = updatedClasses[i];
      if ((cls.hitDice || 'd8') === diceType) {
        // Distribute the used dice across classes of this type
        const toUse = Math.min(cls.level, remainingUsed);
        updatedClasses[i] = { ...cls, hitDiceUsed: toUse };
        remainingUsed -= toUse;
      }
    }

    await update({
      classes: updatedClasses,
      hitDiceUsed: updatedClasses[0]?.hitDiceUsed || 0,
    });
  };

  const toggleShortRestDialog = () => {
    if (showShortRestDialog) {
      setShowShortRestDialog(false);
    } else {
      // For multiclass, default to first available dice type
      if (hasMultipleClasses) {
        const firstAvailable = hitDiceGroups.find(g => g.total - g.used > 0);
        setShortRestDiceType(firstAvailable?.type || hitDiceGroups[0]?.type || 'd8');
      } else {
        setShortRestDiceType(hitDiceGroups[0]?.type || 'd8');
      }
      setShortRestDiceCount(0); // Start at 0 to allow rest without spending dice
      setShowShortRestDialog(true);
    }
  };

  const handleShortRest = async () => {
    let updatedClasses = [...classes];

    // Spend hit dice if any selected
    if (shortRestDiceCount > 0) {
      updatedClasses = updateHitDiceUsed(character, shortRestDiceType, shortRestDiceCount);
    }

    // Warlock: restore all pact magic slots on short rest
    const warlockClass = getWarlockClass(character);
    let pactMagicUpdate: Partial<Character> = {};
    if (warlockClass && character.pactMagicSlots) {
      pactMagicUpdate = {
        pactMagicSlots: {
          ...character.pactMagicSlots,
          current: character.pactMagicSlots.max,
        },
      };
    }

    // Legacy: restore warlock slots on short rest (for backward compatibility)
    let spellSlotsUpdate: Record<string, { current: number; max: number }> | undefined;
    if (warlockClass && !hasMultipleClasses) {
      spellSlotsUpdate = {};
      for (const [level, slot] of Object.entries(character.spellSlots || {})) {
        spellSlotsUpdate[level] = { current: slot.max, max: slot.max };
      }
    }

    setShowShortRestDialog(false);
    await update({
      classes: updatedClasses,
      hitDiceUsed: updatedClasses[0]?.hitDiceUsed || 0,
      ...pactMagicUpdate,
      ...(spellSlotsUpdate && { spellSlots: spellSlotsUpdate }),
    });
  };

  // Get remaining dice for selected type
  const getSelectedTypeRemaining = () => {
    const group = hitDiceGroups.find(g => g.type === shortRestDiceType);
    return group ? group.total - group.used : 0;
  };

  const selectedTypeRemaining = getSelectedTypeRemaining();

  const handleLongRest = async () => {
    // 1. Restore HP to max
    setCurrentHP(effectiveMaxHP);
    setTempHP(0);

    // 2. Recover half of hit dice of EACH type (minimum 1)
    const recoveredClasses = applyLongRestHitDiceRecovery(character);

    // 3. Restore all spell slots to max
    const restoredSpellSlots: Record<string, { current: number; max: number }> = {};
    for (const [level, slot] of Object.entries(character.spellSlots || {})) {
      restoredSpellSlots[level] = { current: slot.max, max: slot.max };
    }

    // 4. Restore pact magic slots
    let pactMagicUpdate: Partial<Character> = {};
    if (character.pactMagicSlots) {
      pactMagicUpdate = {
        pactMagicSlots: {
          ...character.pactMagicSlots,
          current: character.pactMagicSlots.max,
        },
      };
    }

    // 5. Reduce exhaustion by 1 (minimum 0)
    const currentExhaustion = character.exhaustion || 0;
    const newExhaustion = Math.max(0, currentExhaustion - 1);

    // 6. Reset death saves
    await update({
      hp: { current: effectiveMaxHP, max: maxHP, temp: 0 },
      classes: recoveredClasses,
      hitDiceUsed: recoveredClasses[0]?.hitDiceUsed || 0,
      spellSlots: restoredSpellSlots,
      exhaustion: newExhaustion,
      deathSaves: { successes: 0, failures: 0 },
      ...pactMagicUpdate,
    });
  };


  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>Hit Points</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          <div className="cs-hp-modal-main">
            <HPDisplay
              currentHP={currentHP}
              tempHP={tempHP}
              effectiveMaxHP={effectiveMaxHP}
              onCurrentHPChange={handleCurrentHPChange}
              onTempHPChange={handleTempHPChange}
            />

            {currentHP === 0 && (
              <DeathSavesSection
                successes={character.deathSaves?.successes || 0}
                failures={character.deathSaves?.failures || 0}
                onSuccessChange={handleDeathSaveSuccessChange}
                onFailureChange={handleDeathSaveFailureChange}
              />
            )}

            <HealDamageActions
              amount={amount}
              onAmountChange={setAmount}
              onHeal={handleHeal}
              onDamage={handleDamage}
            />

            {/* Hit Dice - always use groups (works for both single and multiclass) */}
            <HitDiceSection groups={hitDiceGroups} />

            <div className="cs-rest-buttons">
              <button
                className="cs-short-rest-btn"
                onClick={toggleShortRestDialog}
              >
                ☀️ Short Rest
              </button>
              <button className="cs-long-rest-btn" onClick={handleLongRest}>
                🌙 Long Rest
              </button>
            </div>

            {showShortRestDialog && (
              <div className="cs-short-rest-dialog">
                <div className="cs-short-rest-header">
                  <span>Short Rest</span>
                  <button
                    className="cs-short-rest-close"
                    onClick={() => setShowShortRestDialog(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="cs-short-rest-content">
                  {/* Dice type selector for multiclass */}
                  {hasMultipleClasses && hitDiceGroups.length > 1 && (
                    <div className="cs-short-rest-type-selector">
                      <label>Hit Dice Type:</label>
                      <div className="cs-dice-type-buttons">
                        {hitDiceGroups.map((group) => {
                          const remaining = group.total - group.used;
                          return (
                            <button
                              key={group.type}
                              className={`cs-dice-type-btn ${shortRestDiceType === group.type ? 'active' : ''}`}
                              onClick={() => {
                                setShortRestDiceType(group.type);
                                setShortRestDiceCount(Math.min(shortRestDiceCount, remaining));
                              }}
                              disabled={remaining <= 0}
                            >
                              {group.type} ({remaining})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <label>Hit Dice to spend:</label>
                  <div className="cs-short-rest-dice-selector">
                    <button
                      className="cs-dice-btn"
                      onClick={() => setShortRestDiceCount(Math.max(0, shortRestDiceCount - 1))}
                      disabled={shortRestDiceCount <= 0}
                    >
                      −
                    </button>
                    <span className="cs-dice-count">{shortRestDiceCount}</span>
                    <button
                      className="cs-dice-btn"
                      onClick={() => setShortRestDiceCount(Math.min(selectedTypeRemaining, shortRestDiceCount + 1))}
                      disabled={shortRestDiceCount >= selectedTypeRemaining}
                    >
                      +
                    </button>
                  </div>
                  <small className="cs-short-rest-info">
                    {shortRestDiceCount > 0
                      ? `Roll ${shortRestDiceCount}${shortRestDiceType} + CON mod to heal`
                      : 'Rest without spending dice (restores features only)'}
                  </small>
                </div>
                <button className="cs-short-rest-confirm" onClick={handleShortRest}>
                  {shortRestDiceCount > 0
                    ? `Use ${shortRestDiceCount} Hit ${shortRestDiceCount === 1 ? 'Die' : 'Dice'}`
                    : 'Take Short Rest'}
                </button>
              </div>
            )}
          </div>

          <HPSettingsSection
            maxHP={maxHP}
            hpBonus={hpBonus}
            onMaxHPChange={handleMaxHPChange}
            onHPBonusChange={handleHPBonusChange}
            hitDiceGroups={hitDiceGroups}
            onHitDiceUsedChange={handleHitDiceUsedChange}
          />
        </div>
      </div>
    </div>
  );
}

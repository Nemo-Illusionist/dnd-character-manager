// D&D 2024 - HP Modal Component (Refactored)

import { useState } from 'react';
import { useCharacterMutation } from '../../../../../../hooks/useCharacterMutation';
import { HPDisplay } from './HPDisplay';
import { HealDamageActions } from './HealDamageActions';
import { DeathSavesSection } from './DeathSavesSection';
import { HPSettingsSection } from './HPSettingsSection';
import type { Character } from 'shared';
import './HP.css';

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
  const [hitDice, setHitDice] = useState(character.hitDice || 'd8');
  const [amount, setAmount] = useState(0);

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

  const handleHitDiceChange = async (newHitDice: string) => {
    setHitDice(newHitDice);
    await update({ hitDice: newHitDice });
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
          </div>

          <HPSettingsSection
            maxHP={maxHP}
            hpBonus={hpBonus}
            hitDice={hitDice}
            onMaxHPChange={handleMaxHPChange}
            onHPBonusChange={handleHPBonusChange}
            onHitDiceChange={handleHitDiceChange}
          />
        </div>
      </div>
    </div>
  );
}

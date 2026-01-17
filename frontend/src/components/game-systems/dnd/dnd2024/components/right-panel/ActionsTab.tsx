// D&D 2024 - Actions Tab Component

import { useState } from 'react';
import { updateCharacter } from '../../../../../../services/characters.service';
import { getAbilityModifier } from '../../../core';
import { ActionModal } from './ActionModal';
import type { Character, CharacterAction } from 'shared';

interface ActionsTabProps {
  character: Character;
  gameId: string;
}

export function ActionsTab({ character, gameId }: ActionsTabProps) {
  const [editingAction, setEditingAction] = useState<CharacterAction | null>(null);

  const actions = character.actions || [];

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addAction = async () => {
    const newAction: CharacterAction = {
      id: generateId(),
      name: 'New Action',
    };
    await updateCharacter(gameId, character.id, {
      actions: [...actions, newAction],
    });
    setEditingAction(newAction);
  };

  const updateAction = async (id: string, updates: Partial<CharacterAction>) => {
    const updatedActions = actions.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    await updateCharacter(gameId, character.id, {
      actions: updatedActions,
    });
    // Update local editing state too
    if (editingAction?.id === id) {
      setEditingAction({ ...editingAction, ...updates });
    }
  };

  const deleteAction = async (id: string) => {
    await updateCharacter(gameId, character.id, {
      actions: actions.filter((a) => a.id !== id),
    });
    setEditingAction(null);
  };

  // Calculate attack bonus for display
  const getAttackBonus = (action: CharacterAction): string => {
    if (!action.ability) return '—';

    const abilityMod = getAbilityModifier(character.abilities[action.ability]);
    const profBonus = action.proficient ? character.proficiencyBonus : 0;
    const extra = action.extraBonus || 0;
    const total = abilityMod + profBonus + extra;

    return total >= 0 ? `+${total}` : `${total}`;
  };

  // Format damage for display
  const getDamageDisplay = (action: CharacterAction): string => {
    if (!action.damage) return '—';

    const bonus = action.damageBonus || 0;
    if (bonus === 0) return action.damage;
    return bonus > 0 ? `${action.damage}+${bonus}` : `${action.damage}${bonus}`;
  };

  return (
    <div className="cs-actions-tab">
      <table className="cs-actions-table">
        <thead>
          <tr>
            <th className="cs-col-name">Name</th>
            <th className="cs-col-atk">Atk</th>
            <th className="cs-col-damage">Damage</th>
            <th className="cs-col-type">Type</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action) => (
            <tr
              key={action.id}
              className="cs-action-row"
              onClick={() => setEditingAction(action)}
            >
              <td className="cs-action-name">{action.name || '—'}</td>
              <td>{getAttackBonus(action)}</td>
              <td>{getDamageDisplay(action)}</td>
              <td>{action.damageType || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="cs-action-add" onClick={addAction}>
        + Add Action
      </button>

      {editingAction && (
        <ActionModal
          action={editingAction}
          onUpdate={(updates) => updateAction(editingAction.id, updates)}
          onDelete={() => deleteAction(editingAction.id)}
          onClose={() => setEditingAction(null)}
        />
      )}
    </div>
  );
}

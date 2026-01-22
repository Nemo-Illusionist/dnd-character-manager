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

const ACTION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'action', label: 'Action' },
  { id: 'bonus', label: 'Bonus' },
  { id: 'reaction', label: 'Reaction' },
  { id: 'free', label: 'Free' },
  { id: 'other', label: 'Other' },
] as const;

type FilterType = typeof ACTION_FILTERS[number]['id'];

export function ActionsTab({ character, gameId }: ActionsTabProps) {
  const [editingAction, setEditingAction] = useState<CharacterAction | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const actions = character.actions || [];

  const filteredActions = filter === 'all'
    ? actions
    : actions.filter((action) => action.actionType === filter);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addAction = async () => {
    const newAction: CharacterAction = {
      id: generateId(),
      name: 'New Action',
      actionType: 'action',
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
  };

  const deleteAction = async (id: string) => {
    // Close modal immediately for responsive UI
    setEditingAction(null);
    // Delete in background
    await updateCharacter(gameId, character.id, {
      actions: actions.filter((a) => a.id !== id),
    });
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
      {/* Filter tabs */}
      <div className="cs-tab-filters">
        {ACTION_FILTERS.map((type) => (
          <button
            key={type.id}
            className={`cs-filter-btn ${filter === type.id ? 'active' : ''}`}
            onClick={() => setFilter(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Actions table */}
      <table className="cs-data-table">
        <thead>
          <tr>
            <th className="cs-col-name">Name</th>
            <th className="cs-col-atk">Atk</th>
            <th className="cs-col-damage">Damage</th>
            <th className="cs-col-type">Type</th>
          </tr>
        </thead>
        <tbody>
          {filteredActions.length === 0 ? (
            <tr className="cs-table-empty-row">
              <td colSpan={4}>No actions</td>
            </tr>
          ) : (
            filteredActions.map((action) => (
              <tr
                key={action.id}
                className="cs-table-row"
                onClick={() => setEditingAction(action)}
              >
                <td className="cs-cell-name">{action.name || '—'}</td>
                <td>{getAttackBonus(action)}</td>
                <td>{getDamageDisplay(action)}</td>
                <td>{action.damageType || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Add button - full width */}
      <button className="cs-table-add-btn" onClick={addAction}>
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

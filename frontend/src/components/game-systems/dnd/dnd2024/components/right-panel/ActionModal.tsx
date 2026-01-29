// D&D 2024 - Action Modal Component

import { useState, useEffect } from 'react';
import { NumberInput } from '../../../../../shared';
import { ABILITY_NAMES, ABILITY_ORDER, DAMAGE_TYPES } from '../../constants';
import { getChanges } from '../../utils';
import type { CharacterAction, AbilityName, ActionType } from 'shared';
import { ACTION_TYPE_NAMES } from 'shared';
import '../modals/Modals.scss';

interface ActionModalProps {
  action: CharacterAction;
  onUpdate: (updates: Partial<CharacterAction>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const ACTION_TYPES: ActionType[] = ['action', 'bonus', 'reaction', 'free', 'other'];

export function ActionModal({ action, onUpdate, onDelete, onClose }: ActionModalProps) {
  // Local state for responsive editing
  const [localAction, setLocalAction] = useState<CharacterAction>(action);

  // Sync local state when action changes from outside
  useEffect(() => {
    setLocalAction(action);
  }, [action.id]);

  // Save changes and close
  const handleClose = () => {
    const changes = getChanges(action, localAction);
    if (Object.keys(changes).length > 0) {
      onUpdate(changes);
    }
    onClose();
  };

  // Update local state
  const updateLocal = (updates: Partial<CharacterAction>) => {
    setLocalAction((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="cs-modal-overlay" onClick={handleClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>{localAction.name || 'New Action'}</h2>
          <button className="cs-modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {/* Name */}
          <div className="cs-form-group">
            <label>Name</label>
            <input
              type="text"
              value={localAction.name}
              onChange={(e) => updateLocal({ name: e.target.value })}
              placeholder="Action name"
            />
          </div>

          {/* Action Type */}
          <div className="cs-form-group">
            <label>Action Type</label>
            <select
              value={localAction.actionType || 'action'}
              onChange={(e) => updateLocal({ actionType: e.target.value as ActionType })}
            >
              {ACTION_TYPES.map((type) => (
                <option key={type} value={type}>{ACTION_TYPE_NAMES[type]}</option>
              ))}
            </select>
          </div>

          {/* Attack settings */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Ability</label>
              <select
                value={localAction.ability || ''}
                onChange={(e) => updateLocal({ ability: (e.target.value as AbilityName) || undefined })}
              >
                <option value="">—</option>
                {ABILITY_ORDER.map((ab) => (
                  <option key={ab} value={ab}>{ABILITY_NAMES[ab]}</option>
                ))}
              </select>
            </div>
            <div className="cs-form-group">
              <label>Extra Bonus</label>
              <NumberInput
                value={localAction.extraBonus || 0}
                onChange={(value) => updateLocal({ extraBonus: value })}
                defaultValue={0}
              />
            </div>
          </div>

          {/* Proficiency checkbox */}
          <div className="cs-form-group cs-checkbox-group">
            <label className="cs-checkbox-label">
              <input
                type="checkbox"
                checked={localAction.proficient || false}
                onChange={(e) => updateLocal({ proficient: e.target.checked })}
              />
              <span>Proficient</span>
            </label>
          </div>

          {/* Damage settings */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Damage</label>
              <input
                type="text"
                value={localAction.damage ?? ''}
                onChange={(e) => updateLocal({ damage: e.target.value })}
                placeholder="1d8"
              />
            </div>
            <div className="cs-form-group">
              <label>Damage Bonus</label>
              <NumberInput
                value={localAction.damageBonus || 0}
                onChange={(value) => updateLocal({ damageBonus: value })}
                defaultValue={0}
              />
            </div>
          </div>

          <div className="cs-form-group">
            <label>Damage Type</label>
            <select
              value={localAction.damageType ?? ''}
              onChange={(e) => updateLocal({ damageType: e.target.value || undefined })}
            >
              <option value="">—</option>
              {DAMAGE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="cs-form-group">
            <label>Notes</label>
            <textarea
              value={localAction.notes ?? ''}
              onChange={(e) => updateLocal({ notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Delete button */}
          <button className="cs-btn cs-btn-danger cs-btn-full" onClick={onDelete}>
            Delete Action
          </button>
        </div>
      </div>
    </div>
  );
}

// D&D 2024 - Inventory Item Modal Component

import { useState, useEffect } from 'react';
import { NumberInput } from '../../../../../shared';
import type { InventoryItem } from 'shared';
import '../modals/Modals.scss';

interface InventoryItemModalProps {
  item: InventoryItem;
  onUpdate: (updates: Partial<InventoryItem>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const ITEM_TYPE_OPTIONS: { value: InventoryItem['type']; label: string }[] = [
  { value: 'weapon', label: 'Weapon' },
  { value: 'armor', label: 'Armor' },
  { value: 'gear', label: 'Gear' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'treasure', label: 'Treasure' },
  { value: 'other', label: 'Other' },
];

export function InventoryItemModal({ item, onUpdate, onDelete, onClose }: InventoryItemModalProps) {
  // Local state for responsive editing
  const [localItem, setLocalItem] = useState<InventoryItem>(item);

  // Sync local state when item changes from outside
  useEffect(() => {
    setLocalItem(item);
  }, [item.id]);

  // Save changes and close
  const handleClose = () => {
    // Only update if there are changes
    const changes: Partial<InventoryItem> = {};
    if (localItem.name !== item.name) changes.name = localItem.name;
    if (localItem.type !== item.type) changes.type = localItem.type;
    if (localItem.quantity !== item.quantity) changes.quantity = localItem.quantity;
    if (localItem.weight !== item.weight) changes.weight = localItem.weight;
    if (localItem.equipped !== item.equipped) changes.equipped = localItem.equipped;
    if (localItem.attuned !== item.attuned) changes.attuned = localItem.attuned;
    if (localItem.description !== item.description) changes.description = localItem.description;

    if (Object.keys(changes).length > 0) {
      onUpdate(changes);
    }
    onClose();
  };

  // Update local state
  const updateLocal = (updates: Partial<InventoryItem>) => {
    setLocalItem((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="cs-modal-overlay" onClick={handleClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>{localItem.name || 'New Item'}</h2>
          <button className="cs-modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {/* Name */}
          <div className="cs-form-group">
            <label>Name</label>
            <input
              type="text"
              value={localItem.name}
              onChange={(e) => updateLocal({ name: e.target.value })}
              placeholder="Item name"
            />
          </div>

          {/* Type and Quantity */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Type</label>
              <select
                value={localItem.type}
                onChange={(e) => updateLocal({ type: e.target.value as InventoryItem['type'] })}
              >
                {ITEM_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="cs-form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={localItem.quantity ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    // Use null instead of undefined - Firebase ignores undefined
                    updateLocal({ quantity: null as unknown as undefined });
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      updateLocal({ quantity: Math.max(0, num) });
                    }
                  }
                }}
                placeholder="—"
                min={0}
              />
            </div>
          </div>

          {/* Weight */}
          <div className="cs-form-group">
            <label>Weight (lb)</label>
            <NumberInput
              value={localItem.weight || 0}
              onChange={(value) => updateLocal({ weight: value || undefined })}
              min={0}
              defaultValue={0}
              placeholder="0"
            />
          </div>

          {/* Equipped & Attuned */}
          <div className="cs-form-row">
            <div className="cs-form-group cs-checkbox-group">
              <label className="cs-checkbox-label">
                <input
                  type="checkbox"
                  checked={localItem.equipped || false}
                  onChange={(e) => updateLocal({ equipped: e.target.checked })}
                />
                <span>Equipped</span>
              </label>
            </div>
            <div className="cs-form-group cs-checkbox-group">
              <label className="cs-checkbox-label">
                <input
                  type="checkbox"
                  checked={localItem.attuned || false}
                  onChange={(e) => updateLocal({ attuned: e.target.checked })}
                />
                <span>Attuned</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="cs-form-group">
            <label>Description</label>
            <textarea
              value={localItem.description ?? ''}
              onChange={(e) => updateLocal({ description: e.target.value })}
              placeholder="Item description..."
              rows={3}
            />
          </div>

          {/* Delete button */}
          <button className="cs-btn cs-btn-danger cs-btn-full" onClick={onDelete}>
            Delete Item
          </button>
        </div>
      </div>
    </div>
  );
}

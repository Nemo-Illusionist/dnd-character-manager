// D&D 2024 - Inventory Tab Component

import { useState } from 'react';
import { updateCharacter } from '../../../../../../services/characters.service';
import { InventoryItemModal } from './InventoryItemModal';
import type { Character, InventoryItem } from 'shared';

interface InventoryTabProps {
  character: Character;
  gameId: string;
}

const ITEM_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'weapon', label: 'Weapons' },
  { id: 'armor', label: 'Armor' },
  { id: 'gear', label: 'Gear' },
  { id: 'consumable', label: 'Consumable' },
  { id: 'treasure', label: 'Treasure' },
] as const;

type FilterType = typeof ITEM_TYPES[number]['id'];

export function InventoryTab({ character, gameId }: InventoryTabProps) {
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const items = character.inventoryItems || [];

  const filteredItems = filter === 'all'
    ? items
    : items.filter((item) => item.type === filter);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addItem = async () => {
    const newItem: InventoryItem = {
      id: generateId(),
      name: 'New Item',
      type: 'gear',
      quantity: 1,
    };
    await updateCharacter(gameId, character.id, {
      inventoryItems: [...items, newItem],
    });
    setEditingItem(newItem);
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    await updateCharacter(gameId, character.id, {
      inventoryItems: updatedItems,
    });
    if (editingItem?.id === id) {
      setEditingItem({ ...editingItem, ...updates });
    }
  };

  const deleteItem = async (id: string) => {
    await updateCharacter(gameId, character.id, {
      inventoryItems: items.filter((item) => item.id !== id),
    });
    setEditingItem(null);
  };

  const toggleEquipped = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = items.find((i) => i.id === id);
    if (item) {
      await updateItem(id, { equipped: !item.equipped });
    }
  };

  // Calculate total weight
  const totalWeight = items.reduce((sum, item) => {
    return sum + (item.weight || 0) * item.quantity;
  }, 0);

  return (
    <div className="cs-inventory-tab">
      {/* Filter tabs */}
      <div className="cs-inventory-filters">
        {ITEM_TYPES.map((type) => (
          <button
            key={type.id}
            className={`cs-filter-btn ${filter === type.id ? 'active' : ''}`}
            onClick={() => setFilter(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Items list */}
      <div className="cs-inventory-list">
        {filteredItems.length === 0 ? (
          <div className="cs-inventory-empty">No items</div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`cs-inventory-row ${item.equipped ? 'equipped' : ''}`}
              onClick={() => setEditingItem(item)}
            >
              <div
                className="cs-inventory-equipped"
                onClick={(e) => toggleEquipped(item.id, e)}
                title={item.equipped ? 'Unequip' : 'Equip'}
              >
                {item.equipped ? '●' : '○'}
              </div>
              <div className="cs-inventory-name">
                {item.name}
                {item.attuned && <span className="cs-attuned-badge">A</span>}
              </div>
              <div className="cs-inventory-qty">{item.quantity > 1 ? `×${item.quantity}` : ''}</div>
              <div className="cs-inventory-weight">{item.weight ? `${item.weight * item.quantity} lb` : ''}</div>
            </div>
          ))
        )}
      </div>

      {/* Footer with total weight and add button */}
      <div className="cs-inventory-footer">
        <div className="cs-inventory-total">
          Total: {totalWeight.toFixed(1)} lb
        </div>
        <button className="cs-action-add" onClick={addItem}>
          + Add Item
        </button>
      </div>

      {editingItem && (
        <InventoryItemModal
          item={editingItem}
          onUpdate={(updates) => updateItem(editingItem.id, updates)}
          onDelete={() => deleteItem(editingItem.id)}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}

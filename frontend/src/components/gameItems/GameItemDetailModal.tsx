// Game Item Detail Modal Component
import { useState } from 'react';
import { Modal, Button, ConfirmDialog } from '../shared';
import type { GameItem } from 'shared';
import './GameItemDetailModal.scss';

interface GameItemDetailModalProps {
  item: GameItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (itemId: string) => Promise<void>;
  isGM: boolean;
}

export function GameItemDetailModal({
  item,
  isOpen,
  onClose,
  onDelete,
  isGM,
}: GameItemDetailModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!item) return null;

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(item.id);
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Map':
        return '🗺️';
      case 'Note':
        return '📝';
      case 'Image':
        return '🖼️';
      default:
        return '📄';
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={item.name}>
        <div className="game-item-detail">
          <div className="game-item-detail-type">
            <span className="type-icon">{getTypeIcon(item.type)}</span>
            <span className="type-name">{item.type}</span>
            {item.visibleTo === 'gm' && isGM && (
              <span className="visibility-badge">GM Only</span>
            )}
          </div>

          {item.description && (
            <p className="game-item-detail-description">{item.description}</p>
          )}

          {item.imageUrl && (
            <div className="game-item-detail-image">
              <img src={item.imageUrl} alt={item.name} />
            </div>
          )}

          {isGM && onDelete && (
            <div className="game-item-detail-actions">
              <Button
                variant="danger"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Item
              </Button>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

import type { Timestamp } from './timestamp';
import type { GameItemType } from './enums';

// ==================== GAME ITEMS ====================

export interface GameItem {
  id: string;
  gameId: string;
  name: string;
  type: GameItemType;
  imageUrl?: string;
  description?: string;
  visibleTo: 'all' | 'gm';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

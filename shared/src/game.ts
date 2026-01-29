import type { Timestamp } from './timestamp';
import type { GameSystem } from './game-systems';

// ==================== GAME ====================

export interface Game {
  id: string;
  name: string;
  description?: string;
  gmId: string;                 // Owner/Game Master UID
  playerIds: string[];          // Список UIDs игроков
  system?: GameSystem;          // Game system (default: 'dnd' for backwards compatibility)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

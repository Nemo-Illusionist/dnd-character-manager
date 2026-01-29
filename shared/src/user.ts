import type { Timestamp } from './timestamp';

// ==================== USER ====================

export interface User {
  uid: string;                  // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
}

// Users Service - User management and lookups
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'shared';

/**
 * Get user by UID
 */
export async function getUser(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));

  if (!userDoc.exists()) return null;

  return userDoc.data() as User;
}

/**
 * Get users by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const searchEmail = email.trim().toLowerCase();

  // Try with query first
  try {
    const q = query(collection(db, 'users'), where('email', '==', searchEmail));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs[0].data() as User;
    }
  } catch (error) {
    console.error('[Users] Query failed:', error);
  }

  // Fallback: Get all users and filter client-side
  try {
    const allUsersSnapshot = await getDocs(collection(db, 'users'));

    for (const doc of allUsersSnapshot.docs) {
      const userData = doc.data() as User;
      if (userData.email.toLowerCase() === searchEmail) {
        return userData;
      }
    }
  } catch (error) {
    console.error('[Users] Fallback failed:', error);
  }

  return null;
}

/**
 * Get multiple users by UIDs
 */
export async function getUsers(userIds: string[]): Promise<User[]> {
  if (userIds.length === 0) return [];

  const users: User[] = [];

  // Firestore doesn't support 'in' queries with more than 10 items
  // So we need to batch the requests
  const batches = [];
  for (let i = 0; i < userIds.length; i += 10) {
    batches.push(userIds.slice(i, i + 10));
  }

  for (const batch of batches) {
    const promises = batch.map((userId) => getUser(userId));
    const batchUsers = await Promise.all(promises);
    users.push(...batchUsers.filter((u): u is User => u !== null));
  }

  return users;
}

// Authentication Service
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from 'shared';

/**
 * Register a new user
 */
export async function register(email: string, password: string, displayName: string): Promise<FirebaseUser> {
  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Update profile with display name
  await updateProfile(firebaseUser, { displayName });

  // Create personal game first (we'll get the ID)
  const personalGameId = await createPersonalGame(firebaseUser.uid, displayName);

  // Create user document in Firestore
  const userData: Omit<User, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName,
    photoURL: firebaseUser.photoURL || undefined,
    createdAt: serverTimestamp(),
    personalGameId,
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), userData);

  return firebaseUser;
}

/**
 * Create a personal game for a new user
 */
async function createPersonalGame(userId: string, displayName: string): Promise<string> {
  const gameId = `personal_${userId}`;

  const gameData = {
    id: gameId,
    name: `${displayName}'s Personal Game`,
    description: 'Your private game for personal characters',
    gmId: userId,
    playerIds: [userId],
    isPersonal: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'games', gameId), gameData);
  return gameId;
}

/**
 * Sign in existing user
 */
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Get current user's data from Firestore
 */
export async function getCurrentUserData(): Promise<User | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  if (!userDoc.exists()) return null;

  return userDoc.data() as User;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

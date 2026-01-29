// Authentication Service
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile,
} from 'firebase/auth';
import {doc, setDoc, getDoc, serverTimestamp} from 'firebase/firestore';
import {auth, db} from './firebase';
import type {User} from 'shared';

/**
 * Register a new user
 */
export async function register(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Update profile with display name
        await updateProfile(firebaseUser, {displayName});

        // Wait for auth token to propagate
        await firebaseUser.getIdToken(true);

        // Create user document in Firestore
        // Build userData without undefined values
        const userData: Record<string, any> = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!.toLowerCase(),
            displayName,
            createdAt: serverTimestamp(),
        };

        // Only add photoURL if it exists and is not null/undefined
        if (firebaseUser.photoURL != null) {
            userData.photoURL = firebaseUser.photoURL;
        }

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);

        return firebaseUser;
    } catch (error) {
        console.error('[Auth] Registration failed:', error);
        throw error;
    }
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

/**
 * Update user's display name
 */
export async function updateUserDisplayName(newDisplayName: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error('No authenticated user');
    }

    // Update Firebase Auth profile
    await updateProfile(currentUser, { displayName: newDisplayName });

    // Update Firestore user document
    await setDoc(
        doc(db, 'users', currentUser.uid),
        { displayName: newDisplayName },
        { merge: true }
    );
}

// Characters Service - CRUD operations for characters with split public/private data
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Character,
  PublicCharacter,
  PrivateCharacterSheet,
  SheetType,
} from 'shared';
import { PUBLIC_CHARACTER_FIELDS } from 'shared';
import { createDefaultCharacterData } from './characters-defaults';

// Re-export subscriptions for backwards compatibility
export {
  subscribeToPublicCharacters,
  subscribeToGameCharacters,
  subscribeToCharacter,
} from './characters-subscriptions.service';

/**
 * Check if a field is public
 */
function isPublicField(field: string): boolean {
  return (PUBLIC_CHARACTER_FIELDS as readonly string[]).includes(field);
}

/**
 * Split character data into public and private parts
 */
function splitCharacterData(
  data: Partial<Character>
): { publicData: Partial<PublicCharacter>; privateData: Partial<PrivateCharacterSheet> } {
  const publicData: Record<string, unknown> = {};
  const privateData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (isPublicField(key)) {
      publicData[key] = value;
    } else {
      privateData[key] = value;
    }
  }

  return {
    publicData: publicData as Partial<PublicCharacter>,
    privateData: privateData as Partial<PrivateCharacterSheet>,
  };
}

/**
 * Create a new character with split public/private data (atomic batch write)
 * Public data: /games/{gameId}/characters/{id}
 * Private data: /games/{gameId}/characters/{id}/private/sheet
 */
export async function createCharacter(
  gameId: string,
  ownerId: string,
  name: string,
  sheetType: SheetType = 'character-2024',
  isHidden: boolean = false
): Promise<string> {
  const { publicData, privateData } = createDefaultCharacterData(gameId, ownerId, name, sheetType, isHidden);

  // Generate a new document reference to get a unique ID
  const characterRef = doc(collection(db, 'games', gameId, 'characters'));
  const characterId = characterRef.id;

  // Private data reference (subcollection)
  const privateSheetRef = doc(db, 'games', gameId, 'characters', characterId, 'private', 'sheet');

  // Use batch to write both documents atomically
  const batch = writeBatch(db);

  // Public character document
  batch.set(characterRef, {
    ...publicData,
    id: characterId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Private character sheet document
  batch.set(privateSheetRef, privateData);

  await batch.commit();

  return characterId;
}

/**
 * Get a character by ID (merges public + private data)
 */
export async function getCharacter(
  gameId: string,
  characterId: string
): Promise<Character | null> {
  // Load both documents in parallel
  const [publicDoc, privateDoc] = await Promise.all([
    getDoc(doc(db, 'games', gameId, 'characters', characterId)),
    getDoc(doc(db, 'games', gameId, 'characters', characterId, 'private', 'sheet')),
  ]);

  if (!publicDoc.exists()) return null;

  const publicData = publicDoc.data() as PublicCharacter;
  const privateData = privateDoc.exists() ? (privateDoc.data() as PrivateCharacterSheet) : null;

  // Merge public and private data
  if (privateData) {
    return { ...publicData, ...privateData } as Character;
  }

  // Return only public data if private doesn't exist (shouldn't happen normally)
  return publicData as unknown as Character;
}

/**
 * Get all characters in a game (full data - for GM or owner)
 */
export async function getGameCharacters(gameId: string): Promise<Character[]> {
  const charactersSnapshot = await getDocs(
    collection(db, 'games', gameId, 'characters')
  );

  // Load all characters with their private data in parallel
  const characterPromises = charactersSnapshot.docs.map(async (charDoc) => {
    const publicData = charDoc.data() as PublicCharacter;
    const privateDoc = await getDoc(
      doc(db, 'games', gameId, 'characters', charDoc.id, 'private', 'sheet')
    );
    const privateData = privateDoc.exists() ? (privateDoc.data() as PrivateCharacterSheet) : null;

    if (privateData) {
      return { ...publicData, ...privateData } as Character;
    }
    return publicData as unknown as Character;
  });

  const characters = await Promise.all(characterPromises);

  // Sort by name
  characters.sort((a, b) => a.name.localeCompare(b.name));

  return characters;
}

/**
 * Get characters owned by a specific user in a game
 */
export async function getUserCharacters(
  gameId: string,
  userId: string
): Promise<Character[]> {
  const q = query(
    collection(db, 'games', gameId, 'characters'),
    where('ownerId', '==', userId)
  );

  const snapshot = await getDocs(q);

  // Load private data for each character
  const characterPromises = snapshot.docs.map(async (charDoc) => {
    const publicData = charDoc.data() as PublicCharacter;
    const privateDoc = await getDoc(
      doc(db, 'games', gameId, 'characters', charDoc.id, 'private', 'sheet')
    );
    const privateData = privateDoc.exists() ? (privateDoc.data() as PrivateCharacterSheet) : null;

    if (privateData) {
      return { ...publicData, ...privateData } as Character;
    }
    return publicData as unknown as Character;
  });

  const characters = await Promise.all(characterPromises);
  characters.sort((a, b) => a.name.localeCompare(b.name));

  return characters;
}

/**
 * Update character data
 * Automatically splits updates into public and private documents
 */
export async function updateCharacter(
  gameId: string,
  characterId: string,
  updates: Partial<Omit<Character, 'id' | 'gameId' | 'ownerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const { publicData, privateData } = splitCharacterData(updates);

  const hasPublicUpdates = Object.keys(publicData).length > 0;
  const hasPrivateUpdates = Object.keys(privateData).length > 0;

  const publicRef = doc(db, 'games', gameId, 'characters', characterId);
  const privateRef = doc(db, 'games', gameId, 'characters', characterId, 'private', 'sheet');

  if (hasPublicUpdates && hasPrivateUpdates) {
    // Use batch to update both documents atomically
    const batch = writeBatch(db);

    batch.update(publicRef, {
      ...publicData,
      updatedAt: serverTimestamp(),
    });

    batch.update(privateRef, privateData);

    await batch.commit();
  } else if (hasPublicUpdates) {
    await updateDoc(publicRef, {
      ...publicData,
      updatedAt: serverTimestamp(),
    });
  } else if (hasPrivateUpdates) {
    await updateDoc(privateRef, privateData);
    // Also update the updatedAt on the public document
    await updateDoc(publicRef, {
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Delete a character (both public and private data)
 */
export async function deleteCharacter(
  gameId: string,
  characterId: string
): Promise<void> {
  const batch = writeBatch(db);

  batch.delete(doc(db, 'games', gameId, 'characters', characterId));
  batch.delete(doc(db, 'games', gameId, 'characters', characterId, 'private', 'sheet'));

  await batch.commit();
}

// ==================== DEPRECATED FUNCTIONS ====================
// These functions are kept for backwards compatibility during migration
// They will be removed after migration is complete

/**
 * @deprecated Use subscribeToPublicCharacters instead
 * Get all public characters in a game
 */
export async function getPublicCharacters(gameId: string): Promise<PublicCharacter[]> {
  const snapshot = await getDocs(
    collection(db, 'games', gameId, 'characters')
  );

  const characters = snapshot.docs.map((doc) => doc.data() as PublicCharacter);
  characters.sort((a, b) => a.name.localeCompare(b.name));

  return characters;
}

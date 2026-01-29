// Characters Subscriptions Service - Real-time subscriptions to character data
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Character,
  PublicCharacter,
  PrivateCharacterSheet,
} from 'shared';

/**
 * Subscribe to all PUBLIC characters in a game
 * Accessible by all game participants - shows only public info
 */
export function subscribeToPublicCharacters(
  gameId: string,
  callback: (characters: PublicCharacter[]) => void
): Unsubscribe {
  const charactersRef = collection(db, 'games', gameId, 'characters');

  return onSnapshot(
    charactersRef,
    (snapshot) => {
      const characters = snapshot.docs.map((doc) => doc.data() as PublicCharacter);
      characters.sort((a, b) => a.name.localeCompare(b.name));
      callback(characters);
    },
    (error) => {
      console.error('[CharactersSubscriptions] Error subscribing to public characters:', error);
      callback([]);
    }
  );
}

/**
 * Subscribe to all characters in a game (FULL data)
 * For GM: subscribes to all characters with private data
 * For players: subscribes only to their own characters with private data
 */
export function subscribeToGameCharacters(
  gameId: string,
  currentUserId: string,
  isGM: boolean,
  callback: (characters: Character[]) => void
): Unsubscribe {
  // First, subscribe to public characters
  const charactersRef = isGM
    ? collection(db, 'games', gameId, 'characters')
    : query(
        collection(db, 'games', gameId, 'characters'),
        where('ownerId', '==', currentUserId)
      );

  // Map to store private data subscriptions
  const privateUnsubscribes = new Map<string, Unsubscribe>();
  const charactersData = new Map<string, { public: PublicCharacter; private?: PrivateCharacterSheet }>();

  const emitCharacters = () => {
    const characters: Character[] = [];
    for (const [, data] of charactersData) {
      if (data.private) {
        characters.push({ ...data.public, ...data.private } as Character);
      } else {
        // If no private data yet, still emit with public data
        characters.push(data.public as unknown as Character);
      }
    }
    characters.sort((a, b) => a.name.localeCompare(b.name));
    callback(characters);
  };

  const publicUnsubscribe = onSnapshot(
    charactersRef,
    (snapshot) => {
      // Track current character IDs
      const currentIds = new Set(snapshot.docs.map(d => d.id));

      // Remove subscriptions for deleted characters
      for (const [id, unsub] of privateUnsubscribes) {
        if (!currentIds.has(id)) {
          unsub();
          privateUnsubscribes.delete(id);
          charactersData.delete(id);
        }
      }

      // Update public data and subscribe to private data for new characters
      for (const charDoc of snapshot.docs) {
        const publicData = charDoc.data() as PublicCharacter;
        const charId = charDoc.id;

        // Update public data
        const existing = charactersData.get(charId);
        charactersData.set(charId, {
          public: publicData,
          private: existing?.private,
        });

        // Subscribe to private data if not already subscribed
        if (!privateUnsubscribes.has(charId)) {
          const privateRef = doc(db, 'games', gameId, 'characters', charId, 'private', 'sheet');
          const privateUnsub = onSnapshot(
            privateRef,
            (privateDoc) => {
              const currentData = charactersData.get(charId);
              if (currentData) {
                charactersData.set(charId, {
                  ...currentData,
                  private: privateDoc.exists() ? (privateDoc.data() as PrivateCharacterSheet) : undefined,
                });
                emitCharacters();
              }
            },
            (error) => {
              console.error('[CharactersSubscriptions] Error subscribing to private character data:', charId, error);
            }
          );
          privateUnsubscribes.set(charId, privateUnsub);
        }
      }

      // Emit with current data (private data will update via their own subscriptions)
      emitCharacters();
    },
    (error) => {
      console.error('[CharactersSubscriptions] Error subscribing to characters:', error);
      callback([]);
    }
  );

  // Return cleanup function
  return () => {
    publicUnsubscribe();
    for (const unsub of privateUnsubscribes.values()) {
      unsub();
    }
    privateUnsubscribes.clear();
  };
}

/**
 * Subscribe to a single character (merges public + private data)
 * Waits for both public and private data to load before emitting
 */
export function subscribeToCharacter(
  gameId: string,
  characterId: string,
  callback: (character: Character | null) => void
): Unsubscribe {
  const publicRef = doc(db, 'games', gameId, 'characters', characterId);
  const privateRef = doc(db, 'games', gameId, 'characters', characterId, 'private', 'sheet');

  let publicData: PublicCharacter | null = null;
  let privateData: PrivateCharacterSheet | null = null;
  let publicLoaded = false;
  let privateLoaded = false;

  const emitCharacter = () => {
    // Wait for both subscriptions to load at least once
    if (!publicLoaded || !privateLoaded) {
      return;
    }

    if (publicData && privateData) {
      callback({ ...publicData, ...privateData } as Character);
    } else if (publicData) {
      // Character exists but no private data (shouldn't happen normally)
      console.error('[CharactersSubscriptions] Character has no private data:', characterId);
      callback(null);
    } else {
      callback(null);
    }
  };

  const publicUnsub = onSnapshot(
    publicRef,
    (snapshot) => {
      publicLoaded = true;
      if (snapshot.exists()) {
        publicData = snapshot.data() as PublicCharacter;
      } else {
        publicData = null;
      }
      emitCharacter();
    },
    (error) => {
      console.error('[CharactersSubscriptions] Error subscribing to character:', error);
      publicLoaded = true;
      callback(null);
    }
  );

  const privateUnsub = onSnapshot(
    privateRef,
    (snapshot) => {
      privateLoaded = true;
      if (snapshot.exists()) {
        privateData = snapshot.data() as PrivateCharacterSheet;
      } else {
        privateData = null;
      }
      emitCharacter();
    },
    (error) => {
      console.error('[CharactersSubscriptions] Error subscribing to private character data:', error);
      privateLoaded = true;
      emitCharacter();
    }
  );

  return () => {
    publicUnsub();
    privateUnsub();
  };
}

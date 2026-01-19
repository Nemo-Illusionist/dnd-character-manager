// Characters Service - CRUD operations for characters
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Character, AbilityName, SkillName, PublicCharacter, SheetType } from 'shared';

/**
 * Skill ability mapping (D&D 2024 SRD 5.2)
 */
const SKILL_ABILITIES: Record<SkillName, AbilityName> = {
  'Acrobatics': 'dex',
  'Animal Handling': 'wis',
  'Arcana': 'int',
  'Athletics': 'str',
  'Deception': 'cha',
  'History': 'int',
  'Insight': 'wis',
  'Intimidation': 'cha',
  'Investigation': 'int',
  'Medicine': 'wis',
  'Nature': 'int',
  'Perception': 'wis',
  'Performance': 'cha',
  'Persuasion': 'cha',
  'Religion': 'int',
  'Sleight of Hand': 'dex',
  'Stealth': 'dex',
  'Survival': 'wis',
};

/**
 * Create default character data
 */
function createDefaultCharacter(
  gameId: string,
  ownerId: string,
  name: string,
  sheetType: SheetType = 'character-2024'
): Omit<Character, 'id' | 'createdAt' | 'updatedAt'> {
  const defaultAbilities = {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  };

  const defaultSkills: Character['skills'] = {
    'Acrobatics': { proficiency: 0 },
    'Animal Handling': { proficiency: 0 },
    'Arcana': { proficiency: 0 },
    'Athletics': { proficiency: 0 },
    'Deception': { proficiency: 0 },
    'History': { proficiency: 0 },
    'Insight': { proficiency: 0 },
    'Intimidation': { proficiency: 0 },
    'Investigation': { proficiency: 0 },
    'Medicine': { proficiency: 0 },
    'Nature': { proficiency: 0 },
    'Perception': { proficiency: 0 },
    'Performance': { proficiency: 0 },
    'Persuasion': { proficiency: 0 },
    'Religion': { proficiency: 0 },
    'Sleight of Hand': { proficiency: 0 },
    'Stealth': { proficiency: 0 },
    'Survival': { proficiency: 0 },
  };

  const defaultSavingThrows: Character['savingThrows'] = {
    str: { proficiency: false },
    dex: { proficiency: false },
    con: { proficiency: false },
    int: { proficiency: false },
    wis: { proficiency: false },
    cha: { proficiency: false },
  };

  const defaultCurrency: Character['currency'] = {
    cp: 0,
    sp: 0,
    ep: 0,
    gp: 0,
    pp: 0,
  };

  // Determine character type based on sheet type
  const isMob = sheetType.startsWith('mob-');
  const characterType = isMob ? 'Minion' : 'Player Character';

  return {
    gameId,
    ownerId,
    name,
    type: characterType,
    sheetType,
    level: 1,
    race: '',
    class: '',
    subclass: '',
    background: '',
    abilities: defaultAbilities,
    hp: { current: 10, max: 10, temp: 0 },
    ac: 10,
    speed: 30,
    initiative: 0,
    proficiencyBonus: 2,
    skills: defaultSkills,
    savingThrows: defaultSavingThrows,
    inventory: [],
    spells: [],
    spellSlots: {},
    currency: defaultCurrency,
    armorTraining: {
      light: false,
      medium: false,
      heavy: false,
      shields: false,
    },
    weaponProficiencies: '',
    toolProficiencies: '',
    notes: '',
  };
}

/**
 * Create a new character with public character data (atomic batch write)
 * Both documents are created with the same ID
 */
export async function createCharacter(
  gameId: string,
  ownerId: string,
  name: string,
  sheetType: SheetType = 'character-2024'
): Promise<string> {
  const characterData = createDefaultCharacter(gameId, ownerId, name, sheetType);

  // Generate a new document reference to get a unique ID
  const characterRef = doc(collection(db, 'games', gameId, 'characters'));
  const characterId = characterRef.id;

  // Create public character reference with the same ID
  const publicCharacterRef = doc(db, 'games', gameId, 'publicCharacters', characterId);

  // Use batch to write both documents atomically
  const batch = writeBatch(db);

  // Main character document
  batch.set(characterRef, {
    ...characterData,
    id: characterId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Public character document (minimal public data)
  const publicCharacterData: Omit<PublicCharacter, 'updatedAt'> = {
    id: characterId,
    gameId,
    ownerId,
    name,
  };

  batch.set(publicCharacterRef, {
    ...publicCharacterData,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return characterId;
}

/**
 * Get a character by ID
 */
export async function getCharacter(
  gameId: string,
  characterId: string
): Promise<Character | null> {
  const charDoc = await getDoc(
    doc(db, 'games', gameId, 'characters', characterId)
  );

  if (!charDoc.exists()) return null;

  return charDoc.data() as Character;
}

/**
 * Get all characters in a game
 */
export async function getGameCharacters(gameId: string): Promise<Character[]> {
  const charactersSnapshot = await getDocs(
    collection(db, 'games', gameId, 'characters')
  );

  const characters = charactersSnapshot.docs.map((doc) => doc.data() as Character);

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
  const characters = snapshot.docs.map((doc) => doc.data() as Character);

  characters.sort((a, b) => a.name.localeCompare(b.name));

  return characters;
}

/**
 * Subscribe to all characters in a game
 * If the user is not a GM, only characters they own will be returned
 */
export function subscribeToGameCharacters(
  gameId: string,
  currentUserId: string,
  isGM: boolean,
  callback: (characters: Character[]) => void
): Unsubscribe {
  // If user is GM, subscribe to all characters
  // If not GM, filter by ownerId to match Firestore rules
  const charactersRef = isGM
    ? collection(db, 'games', gameId, 'characters')
    : query(
        collection(db, 'games', gameId, 'characters'),
        where('ownerId', '==', currentUserId)
      );

  console.log('Setting up characters subscription for game:', gameId, 'isGM:', isGM);

  return onSnapshot(
    charactersRef,
    (snapshot) => {
      console.log('Characters snapshot received:', {
        gameId,
        isGM,
        size: snapshot.size,
        docs: snapshot.docs.map(d => ({ id: d.id, name: d.data().name }))
      });
      const characters = snapshot.docs.map((doc) => doc.data() as Character);
      characters.sort((a, b) => a.name.localeCompare(b.name));
      callback(characters);
    },
    (error) => {
      console.error('Error subscribing to characters:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      // Still call callback with empty array so UI doesn't hang
      callback([]);
    }
  );
}

/**
 * Subscribe to a single character
 */
export function subscribeToCharacter(
  gameId: string,
  characterId: string,
  callback: (character: Character | null) => void
): Unsubscribe {
  const charRef = doc(db, 'games', gameId, 'characters', characterId);

  return onSnapshot(
    charRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as Character);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to character:', error);
      callback(null);
    }
  );
}

/**
 * Update character data
 * If name is updated, also updates the public character document atomically
 */
export async function updateCharacter(
  gameId: string,
  characterId: string,
  updates: Partial<Omit<Character, 'id' | 'gameId' | 'ownerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const characterRef = doc(db, 'games', gameId, 'characters', characterId);
  const publicCharacterRef = doc(db, 'games', gameId, 'publicCharacters', characterId);

  // Check if we need to update public character data
  const hasPublicFields = 'name' in updates;

  if (hasPublicFields) {
    // Use batch to update both documents atomically
    const batch = writeBatch(db);

    batch.update(characterRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Build public character updates
    const publicUpdates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if ('name' in updates) {
      publicUpdates.name = updates.name;
    }

    batch.update(publicCharacterRef, publicUpdates);

    await batch.commit();
  } else {
    // No public fields to update, just update the main character
    await updateDoc(characterRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Delete a character and its public character data atomically
 */
export async function deleteCharacter(
  gameId: string,
  characterId: string
): Promise<void> {
  const batch = writeBatch(db);

  batch.delete(doc(db, 'games', gameId, 'characters', characterId));
  batch.delete(doc(db, 'games', gameId, 'publicCharacters', characterId));

  await batch.commit();
}

/**
 * Calculate ability modifier
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate proficiency bonus by level
 */
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/**
 * Calculate skill modifier
 */
export function getSkillModifier(
  character: Character,
  skill: SkillName
): number {
  const ability = SKILL_ABILITIES[skill];
  const abilityMod = getAbilityModifier(character.abilities[ability]);
  const proficiency = character.skills[skill].proficiency;
  const profBonus = character.proficiencyBonus;

  return abilityMod + (proficiency * profBonus);
}

/**
 * Calculate saving throw modifier
 */
export function getSavingThrowModifier(
  character: Character,
  ability: AbilityName
): number {
  const abilityMod = getAbilityModifier(character.abilities[ability]);
  const isProficient = character.savingThrows[ability].proficiency;

  return abilityMod + (isProficient ? character.proficiencyBonus : 0);
}

// ==================== PUBLIC CHARACTERS ====================

/**
 * Get all public characters in a game
 * Accessible by all game participants
 */
export async function getPublicCharacters(gameId: string): Promise<PublicCharacter[]> {
  const snapshot = await getDocs(
    collection(db, 'games', gameId, 'publicCharacters')
  );

  const characters = snapshot.docs.map((doc) => doc.data() as PublicCharacter);
  characters.sort((a, b) => a.name.localeCompare(b.name));

  return characters;
}

/**
 * Subscribe to all public characters in a game
 * Accessible by all game participants (GM and players)
 */
export function subscribeToPublicCharacters(
  gameId: string,
  callback: (characters: PublicCharacter[]) => void
): Unsubscribe {
  const publicCharactersRef = collection(db, 'games', gameId, 'publicCharacters');

  return onSnapshot(
    publicCharactersRef,
    (snapshot) => {
      const characters = snapshot.docs.map((doc) => doc.data() as PublicCharacter);
      characters.sort((a, b) => a.name.localeCompare(b.name));
      callback(characters);
    },
    (error) => {
      console.error('Error subscribing to public characters:', error);
      callback([]);
    }
  );
}

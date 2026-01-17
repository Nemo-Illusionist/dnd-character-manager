/**
 * Migration script: Create publicCharacters for all existing characters
 *
 * Usage (choose one):
 *
 *   Option A - Using gcloud (recommended):
 *     gcloud auth application-default login
 *     cd functions
 *     GCLOUD_PROJECT=dnd24-character-manager npm run migrate:public-characters
 *
 *   Option B - Using service account key:
 *     export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
 *     cd functions
 *     npm run migrate:public-characters
 */

import * as admin from 'firebase-admin';

// Get project ID from environment or use default
const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;

if (!projectId && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Error: No project specified!');
  console.error('Set GCLOUD_PROJECT or GOOGLE_APPLICATION_CREDENTIALS environment variable');
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  projectId,
  credential: admin.credential.applicationDefault(),
});

console.log(`Connected to project: ${projectId || '(from service account)'}\n`);

const db = admin.firestore();

interface CharacterData {
  id: string;
  gameId: string;
  ownerId: string;
  name: string;
}

async function migratePublicCharacters(): Promise<void> {
  console.log('Starting publicCharacters migration...\n');

  // Get all games
  const gamesSnapshot = await db.collection('games').get();
  console.log(`Found ${gamesSnapshot.size} games\n`);

  let totalCharacters = 0;
  let migratedCharacters = 0;
  let skippedCharacters = 0;
  let errors = 0;

  for (const gameDoc of gamesSnapshot.docs) {
    const gameId = gameDoc.id;
    const gameName = gameDoc.data().name || 'Unknown';

    console.log(`Processing game: ${gameName} (${gameId})`);

    // Get all characters in this game
    const charactersSnapshot = await db
      .collection('games')
      .doc(gameId)
      .collection('characters')
      .get();

    if (charactersSnapshot.empty) {
      console.log('  No characters found\n');
      continue;
    }

    console.log(`  Found ${charactersSnapshot.size} characters`);
    totalCharacters += charactersSnapshot.size;

    // Process characters in batches of 500 (Firestore limit)
    const batchSize = 500;
    let batch = db.batch();
    let batchCount = 0;

    for (const charDoc of charactersSnapshot.docs) {
      const charData = charDoc.data() as CharacterData;
      const characterId = charDoc.id;

      // Check if publicCharacter already exists
      const publicCharRef = db
        .collection('games')
        .doc(gameId)
        .collection('publicCharacters')
        .doc(characterId);

      const publicCharDoc = await publicCharRef.get();

      if (publicCharDoc.exists) {
        console.log(`    [SKIP] ${charData.name} - already migrated`);
        skippedCharacters++;
        continue;
      }

      // Create public character data
      const publicCharacterData = {
        id: characterId,
        gameId: gameId,
        ownerId: charData.ownerId,
        name: charData.name,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(publicCharRef, publicCharacterData);
      batchCount++;
      migratedCharacters++;

      console.log(`    [MIGRATE] ${charData.name}`);

      // Commit batch if it reaches the limit
      if (batchCount >= batchSize) {
        try {
          await batch.commit();
          console.log(`    Committed batch of ${batchCount} documents`);
        } catch (error) {
          console.error(`    Error committing batch:`, error);
          errors += batchCount;
        }
        batch = db.batch();
        batchCount = 0;
      }
    }

    // Commit remaining documents
    if (batchCount > 0) {
      try {
        await batch.commit();
        console.log(`    Committed final batch of ${batchCount} documents`);
      } catch (error) {
        console.error(`    Error committing final batch:`, error);
        errors += batchCount;
      }
    }

    console.log('');
  }

  console.log('Migration complete!');
  console.log('===================');
  console.log(`Total characters found: ${totalCharacters}`);
  console.log(`Migrated: ${migratedCharacters}`);
  console.log(`Skipped (already exists): ${skippedCharacters}`);
  console.log(`Errors: ${errors}`);
}

// Run migration
migratePublicCharacters()
  .then(() => {
    console.log('\nMigration finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  });

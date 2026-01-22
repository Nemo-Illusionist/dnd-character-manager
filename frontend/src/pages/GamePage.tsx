// Characters Page - List all characters in a game
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth, usePublicCharacters, useGameMenuItems, useModalState } from '../hooks';
import { useGame } from '../context/GameContext';
import { CharacterCard } from '../components/characters/CharacterCard';
import { CreateCharacterModal } from '../components/characters/CreateCharacterModal';
import { CharacterPublicInfoModal } from '../components/characters/CharacterPublicInfoModal';
import { getUsers } from '../services/users.service';
import {
  PageLayout,
  PageHeader,
  PageLoading,
  PageEmpty,
  PageSection,
  PageGrid,
  DropdownMenu,
} from '../components/shared';
import type { PublicCharacter } from 'shared';

export default function GamePage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { firebaseUser } = useAuth();
  const { currentGame } = useGame();
  const { characters, loading: charactersLoading, isGM } = usePublicCharacters();
  const createModal = useModalState();
  const publicInfoModal = useModalState();
  const [selectedCharacter, setSelectedCharacter] = useState<PublicCharacter | null>(null);
  const [ownerNames, setOwnerNames] = useState<Record<string, string>>({});

  const menuItems = useGameMenuItems({ isGM, onCreateCharacter: createModal.open });

  // Handle ?action=create URL param
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      createModal.open();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, createModal]);

  // Load owner names for other characters
  useEffect(() => {
    const loadOwnerNames = async () => {
      if (!firebaseUser || characters.length === 0) return;

      // Get unique owner IDs (excluding current user)
      const otherOwnerIds = [...new Set(
        characters
          .filter(c => c.ownerId !== firebaseUser.uid)
          .map(c => c.ownerId)
      )];

      if (otherOwnerIds.length === 0) return;

      const users = await getUsers(otherOwnerIds);
      const namesMap: Record<string, string> = {};
      users.forEach(user => {
        namesMap[user.uid] = user.displayName;
      });
      setOwnerNames(namesMap);
    };

    loadOwnerNames();
  }, [characters, firebaseUser]);

  const canAccessFullSheet = (character: PublicCharacter) => {
    if (!firebaseUser) return false;
    // Owner or GM can access full sheet
    return character.ownerId === firebaseUser.uid || isGM;
  };

  const handleCharacterClick = (character: PublicCharacter) => {
    if (canAccessFullSheet(character)) {
      // Navigate to full character sheet
      navigate(`/games/${gameId}/characters/${character.id}`);
    } else {
      // Show public info modal
      setSelectedCharacter(character);
      publicInfoModal.open();
    }
  };

  const handleCharacterCreated = (characterId: string) => {
    navigate(`/games/${gameId}/characters/${characterId}`);
  };

  const handlePublicInfoModalClose = () => {
    publicInfoModal.close();
    setSelectedCharacter(null);
  };

  const gmId = currentGame?.gmId;

  // GM's characters (only shown to players, not to GM)
  const gmCharacters = useMemo(() => {
    if (!firebaseUser || isGM || !gmId) return [];
    return characters
      .filter((c) => c.ownerId === gmId && c.ownerId !== firebaseUser.uid)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [characters, firebaseUser, gmId, isGM]);

  // Sort other characters by owner name, then by character name (excluding GM's characters for players)
  const otherCharacters = useMemo(() => {
    if (!firebaseUser) return [];
    return characters
      .filter((c) => {
        // Exclude my characters
        if (c.ownerId === firebaseUser.uid) return false;
        // For players: exclude GM's characters (they go to separate section)
        if (!isGM && gmId && c.ownerId === gmId) return false;
        return true;
      })
      .sort((a, b) => {
        const ownerA = ownerNames[a.ownerId] || '';
        const ownerB = ownerNames[b.ownerId] || '';
        // First sort by owner name
        const ownerCompare = ownerA.localeCompare(ownerB);
        if (ownerCompare !== 0) return ownerCompare;
        // Then by character name
        return a.name.localeCompare(b.name);
      });
  }, [characters, firebaseUser, ownerNames, isGM, gmId]);

  // My characters
  const myCharacters = useMemo(() => {
    if (!firebaseUser) return [];
    return characters.filter((c) => c.ownerId === firebaseUser.uid);
  }, [characters, firebaseUser]);

  if (charactersLoading || !firebaseUser) {
    return (
      <PageLayout>
        <PageLoading message="Loading characters..." />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Characters"
        actions={
          <div className="mobile-menu">
            <DropdownMenu items={menuItems} />
          </div>
        }
      />

      {characters.length === 0 ? (
        <PageEmpty
          icon="🎭"
          title="No Characters Yet"
          description="Create your first character to begin your adventure!"
          action={{
            label: '+ Create Your First Character',
            onClick: createModal.open,
          }}
        />
      ) : (
        <>
          {myCharacters.length > 0 && (
            <PageSection title="My Characters" count={myCharacters.length}>
              <PageGrid>
                {myCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => handleCharacterClick(character)}
                    showHiddenBadge={isGM}
                  />
                ))}
              </PageGrid>
            </PageSection>
          )}

          {gmCharacters.length > 0 && (
            <PageSection title="GM Characters" count={gmCharacters.length}>
              <PageGrid>
                {gmCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => handleCharacterClick(character)}
                  />
                ))}
              </PageGrid>
            </PageSection>
          )}

          {otherCharacters.length > 0 && (
            <PageSection title="Other Characters" count={otherCharacters.length}>
              <PageGrid>
                {otherCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => handleCharacterClick(character)}
                    showHiddenBadge={isGM}
                    ownerName={ownerNames[character.ownerId]}
                  />
                ))}
              </PageGrid>
            </PageSection>
          )}
        </>
      )}

      {firebaseUser && gameId && (
        <CreateCharacterModal
          isOpen={createModal.isOpen}
          onClose={createModal.close}
          onSuccess={handleCharacterCreated}
          gameId={gameId}
          userId={firebaseUser.uid}
          gameSystem={currentGame?.system}
          isGM={isGM}
        />
      )}

      <CharacterPublicInfoModal
        isOpen={publicInfoModal.isOpen}
        onClose={handlePublicInfoModalClose}
        character={selectedCharacter}
      />
    </PageLayout>
  );
}

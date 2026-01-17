// Character Sheet Page - Thin wrapper for game system components

import { useNavigate, useParams } from 'react-router-dom';
import { useCharacter } from '../hooks/useCharacter';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { DnD2024CharacterSheet } from '../components/game-systems';
import './CharacterSheetPage.css';

export default function CharacterSheetPage() {
  const navigate = useNavigate();
  const { gameId, characterId } = useParams<{ gameId: string; characterId: string }>();
  const { character, loading } = useCharacter(gameId || null, characterId || null);

  const handleBack = () => {
    navigate(`/games/${gameId}`);
  };

  if (loading) {
    return (
      <div className="character-sheet-page">
        <div className="character-sheet-loading">
          <LoadingSpinner size="large" />
          <p>Loading character...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="character-sheet-page">
        <div className="character-sheet-error">
          <h2>Character Not Found</h2>
          <Button onClick={handleBack}>Back to Characters</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="character-sheet-page">
      <DnD2024CharacterSheet character={character} gameId={gameId!} />
    </div>
  );
}

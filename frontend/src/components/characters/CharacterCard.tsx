// Character Card Component - Shows public character info
import { Card } from '../shared';
import { SHEET_TYPE_SHORT_NAMES, DEFAULT_SHEET_TYPE, type PublicCharacter } from 'shared';
import './CharacterCard.scss';

interface CharacterCardProps {
  character: PublicCharacter;
  onClick: () => void;
  showHiddenBadge?: boolean;
  ownerName?: string;
}

export function CharacterCard({
  character,
  onClick,
  showHiddenBadge,
  ownerName,
}: CharacterCardProps) {
  const sheetTypeName = SHEET_TYPE_SHORT_NAMES[character.sheetType || DEFAULT_SHEET_TYPE];

  return (
    <Card onClick={onClick} className="character-card">
      <div className="character-card-header">
        {character.avatar && (
          <div className="character-avatar">
            <img src={character.avatar} alt={character.name} />
          </div>
        )}
        <div className="character-info">
          <h3 className="character-name">{character.name}</h3>
          {ownerName && (
            <p className="character-owner">Player: {ownerName}</p>
          )}
          {character.publicDescription && (
            <p className="character-description">{character.publicDescription}</p>
          )}
        </div>
        <div className="character-card-badges">
          <span className="character-badge sheet-type">{sheetTypeName}</span>
          {showHiddenBadge && character.isHidden && (
            <span className="character-badge hidden-badge">Hidden</span>
          )}
        </div>
      </div>
    </Card>
  );
}

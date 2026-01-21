// Character Public Info Modal - Shows public info about a character
import { Modal } from '../shared';
import type { PublicCharacter } from 'shared';
import './CharacterPublicInfoModal.scss';

interface CharacterPublicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: PublicCharacter | null;
}

export function CharacterPublicInfoModal({
  isOpen,
  onClose,
  character,
}: CharacterPublicInfoModalProps) {
  if (!character) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={character.name}>
      <div className="character-public-info">
        {character.avatar && (
          <div className="character-public-avatar">
            <img src={character.avatar} alt={character.name} />
          </div>
        )}

        {character.publicDescription ? (
          <p className="character-public-description">{character.publicDescription}</p>
        ) : (
          <p className="no-description">No public description available.</p>
        )}
      </div>
    </Modal>
  );
}

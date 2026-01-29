// Avatar Picker - clickable avatar with dropdown for selecting portrait

import { useState } from 'react';
import { DropdownMenu } from '../../../../../shared/DropdownMenu';
import { updateCharacter } from '../../../../../../services/characters.service';
import { getAvatarUrl } from '../../utils/avatar';
import { DefaultAvatarModal } from '../modals/DefaultAvatarModal';
import { ExternalUrlAvatarModal } from '../modals/ExternalUrlAvatarModal';
import type { Character } from 'shared';
import './AvatarPicker.scss';

interface AvatarPickerProps {
  character: Character;
  gameId: string;
  size?: number;
}

export function AvatarPicker({ character, gameId, size = 64 }: AvatarPickerProps) {
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);

  const avatarUrl = getAvatarUrl(character.avatar, character.class);

  const handleAvatarSelect = (url: string) => {
    updateCharacter(gameId, character.id, { avatar: url });
  };

  const menuItems = [
    {
      label: 'Choose default portrait',
      icon: '🖼',
      onClick: () => setShowDefaultModal(true),
    },
    {
      label: 'Image URL',
      icon: '🔗',
      onClick: () => setShowUrlModal(true),
    },
  ];

  const trigger = (
    <div className="cs-avatar-picker-btn" style={{ width: size, height: size }}>
      <img src={avatarUrl} alt={character.name} />
      <div className="cs-avatar-picker-overlay" />
    </div>
  );

  return (
    <>
      <DropdownMenu
        items={menuItems}
        trigger={trigger}
        className="cs-avatar-picker"
      />

      {showDefaultModal && (
        <DefaultAvatarModal
          currentAvatar={character.avatar}
          onSelect={handleAvatarSelect}
          onClose={() => setShowDefaultModal(false)}
        />
      )}

      {showUrlModal && (
        <ExternalUrlAvatarModal
          currentAvatar={character.avatar}
          onSave={handleAvatarSelect}
          onClose={() => setShowUrlModal(false)}
        />
      )}
    </>
  );
}

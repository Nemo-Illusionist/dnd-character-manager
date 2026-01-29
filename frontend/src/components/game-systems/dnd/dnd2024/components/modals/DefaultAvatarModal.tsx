// Default Avatar Selection Modal

import { DEFAULT_AVATARS } from '../../utils/avatar';
import './AvatarModals.scss';
import './Modals.scss';

interface DefaultAvatarModalProps {
  currentAvatar?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function DefaultAvatarModal({ currentAvatar, onSelect, onClose }: DefaultAvatarModalProps) {
  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>Choose Portrait</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="cs-modal-body">
          <div className="cs-avatar-grid">
            {DEFAULT_AVATARS.map((avatar) => (
              <button
                key={avatar.name}
                className={`cs-avatar-grid-item ${currentAvatar === avatar.url ? 'selected' : ''}`}
                onClick={() => handleSelect(avatar.url)}
              >
                <img
                  className="cs-avatar-grid-image"
                  src={avatar.url}
                  alt={avatar.name}
                />
                <span className="cs-avatar-grid-label">{avatar.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

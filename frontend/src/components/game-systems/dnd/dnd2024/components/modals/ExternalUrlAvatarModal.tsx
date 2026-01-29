// External URL Avatar Modal

import { useState } from 'react';
import { normalizeImageUrl } from '../../utils/avatar';
import './AvatarModals.scss';
import './Modals.scss';

interface ExternalUrlAvatarModalProps {
  currentAvatar?: string;
  onSave: (url: string) => void;
  onClose: () => void;
}

export function ExternalUrlAvatarModal({ currentAvatar, onSave, onClose }: ExternalUrlAvatarModalProps) {
  const [url, setUrl] = useState(currentAvatar || '');
  const [previewError, setPreviewError] = useState(false);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setPreviewError(false);
  };

  const normalizedUrl = normalizeImageUrl(url.trim());

  const handleSave = () => {
    if (normalizedUrl) {
      onSave(normalizedUrl);
      onClose();
    }
  };

  const showPreview = normalizedUrl.length > 0;

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>Image URL</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="cs-modal-body">
          <div className="cs-form-group">
            <label>URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://i.imgur.com/example.png"
              autoFocus
            />
          </div>

          {showPreview && (
            <div className="cs-avatar-preview-section">
              <img
                className={`cs-avatar-preview ${previewError ? 'error' : ''}`}
                src={normalizedUrl}
                alt="Preview"
                onLoad={() => setPreviewError(false)}
                onError={() => setPreviewError(true)}
              />
              {previewError && (
                <p className="cs-avatar-preview-error">Image failed to load</p>
              )}
            </div>
          )}

          <div className="cs-avatar-warning">
            Images from external sources may not display due to CORS restrictions. We recommend using services like Imgur (i.imgur.com) which allow cross-domain access.
          </div>

          <div className="cs-modal-footer">
            <button className="cs-btn cs-btn-secondary" onClick={onClose}>Cancel</button>
            <button
              className="cs-btn cs-btn-primary"
              onClick={handleSave}
              disabled={!url.trim() || previewError}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

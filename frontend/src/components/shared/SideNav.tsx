// SideNav Component - Left navigation panel for tablets and desktops (>= 650px)
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { DropdownMenu } from './DropdownMenu';
import './SideNav.scss';

interface SideNavProps {
  variant: 'games' | 'game';
  onCreateGame?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  isGM?: boolean;
}

export function SideNav({ variant, onCreateGame, onOpenSettings, onLogout, isGM }: SideNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams<{ gameId: string }>();

  if (variant === 'games') {
    return (
      <nav className="side-nav">
        <div className="side-nav-top" />
        <div className="side-nav-bottom">
          <DropdownMenu
            className="side-nav-dropdown"
            trigger={<span className="side-nav-icon">⚙️</span>}
            items={[
              ...(onCreateGame ? [{ label: 'Create Game', icon: '➕', onClick: onCreateGame }] : []),
              ...(onOpenSettings ? [{ label: 'Profile', icon: '👤', onClick: onOpenSettings }] : []),
              ...(onLogout ? [{ label: 'Logout', icon: '🚪', onClick: onLogout }] : []),
            ]}
          />
        </div>
      </nav>
    );
  }

  // variant === 'game'
  const currentPath = location.pathname;
  const isCharactersActive = currentPath === `/games/${gameId}/characters`;
  const isItemsActive = currentPath === `/games/${gameId}/items`;

  const menuItems = [
    { label: 'Create Character', icon: '🎭', onClick: () => navigate(`/games/${gameId}/characters?action=create`) },
    { label: 'Add Item', icon: '📦', onClick: () => navigate(`/games/${gameId}/items?action=create`) },
    { label: 'Back to Games', icon: '⬅️', onClick: () => navigate('/games') },
    ...(isGM ? [{ label: 'Game Management', icon: '⚙️', onClick: () => navigate(`/games/${gameId}/manage`) }] : []),
  ];

  return (
    <nav className="side-nav">
      <div className="side-nav-top">
        <button
          className={`side-nav-btn ${isCharactersActive ? 'active' : ''}`}
          onClick={() => navigate(`/games/${gameId}/characters`)}
          title="Characters"
        >
          <span className="side-nav-icon">🎭</span>
        </button>
        <button
          className={`side-nav-btn ${isItemsActive ? 'active' : ''}`}
          onClick={() => navigate(`/games/${gameId}/items`)}
          title="Game Items"
        >
          <span className="side-nav-icon">📦</span>
        </button>
      </div>

      <div className="side-nav-bottom">
        <DropdownMenu
          className="side-nav-dropdown"
          trigger={<span className="side-nav-icon">⚙️</span>}
          items={menuItems}
        />
      </div>
    </nav>
  );
}

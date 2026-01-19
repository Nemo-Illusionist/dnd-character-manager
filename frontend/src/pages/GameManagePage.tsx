// Game Management Page - Manage players, settings
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, useModalState } from '../hooks';
import { useGame } from '../context/GameContext';
import { isGameMaster } from '../services/games.service';
import { PlayersList } from '../components/games/PlayersList';
import { InvitePlayerModal } from '../components/game-manage/InvitePlayerModal';
import { PageLayout, PageHeader } from '../components/shared';
import './GameManagePage.css';

export default function GameManagePage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { firebaseUser } = useAuth();
  const { currentGame: game } = useGame();
  const inviteModal = useModalState();

  if (!game || !firebaseUser) {
    return null; // GameLayout handles loading
  }

  const isGM = isGameMaster(game, firebaseUser.uid);
  const isPersonalGame = game.isPersonal;

  return (
    <PageLayout>
      <PageHeader
        title="Game Management"
        subtitle={
          <p>
            {game.name}
            {isPersonalGame && <span className="game-badge personal"> Personal</span>}
          </p>
        }
        backButton={{
          label: 'Back to Characters',
          onClick: () => navigate(`/games/${gameId}`),
        }}
      />

      {isPersonalGame ? (
        <div className="personal-game-info">
          <div className="info-icon">👤</div>
          <h2>Personal Game</h2>
          <p>
            This is your personal game. Player management is not available for personal games.
          </p>
          <p>
            You can create and manage characters directly from the characters page.
          </p>
        </div>
      ) : (
        <PlayersList
          playerIds={game.playerIds}
          gmId={game.gmId}
          gameId={game.id}
          currentUserId={firebaseUser.uid}
          isGM={isGM}
          onInviteClick={inviteModal.open}
        />
      )}

      {!isPersonalGame && (
        <InvitePlayerModal
          isOpen={inviteModal.isOpen}
          onClose={inviteModal.close}
          onSuccess={() => console.log('Player invited successfully')}
          gameId={game.id}
        />
      )}
    </PageLayout>
  );
}

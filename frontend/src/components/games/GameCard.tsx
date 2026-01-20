// Game Card Component
import { Card } from '../shared';
import { GAME_SYSTEM_NAMES, DEFAULT_GAME_SYSTEM, type Game } from 'shared';
import './GameCard.scss';

interface GameCardProps {
  game: Game;
  isGM: boolean;
  onClick: () => void;
}

export function GameCard({ game, isGM, onClick }: GameCardProps) {
  const systemName = GAME_SYSTEM_NAMES[game.system || DEFAULT_GAME_SYSTEM];

  return (
    <Card onClick={onClick} className="game-card">
      <div className="game-card-header">
        <h3 className="game-card-title">{game.name}</h3>
        <div className="game-card-badges">
          <span className="game-badge system">{systemName}</span>
          {isGM && <span className="game-badge gm">GM</span>}
        </div>
      </div>

      {game.description && (
        <p className="game-card-description">{game.description}</p>
      )}

      <div className="game-card-footer">
        <span className="game-card-players">
          👥 {game.playerIds.length} {game.playerIds.length === 1 ? 'Player' : 'Players'}
        </span>
      </div>
    </Card>
  );
}

// Players List Component (for future use in game details)
import './PlayersList.css';

interface Player {
  uid: string;
  displayName: string;
  photoURL?: string;
}

interface PlayersListProps {
  players: Player[];
  gmId: string;
}

export function PlayersList({ players, gmId }: PlayersListProps) {
  return (
    <div className="players-list">
      <h3 className="players-title">Players ({players.length})</h3>
      <div className="players-grid">
        {players.map((player) => (
          <div key={player.uid} className="player-item">
            <div className="player-avatar">
              {player.photoURL ? (
                <img src={player.photoURL} alt={player.displayName} />
              ) : (
                <span>{player.displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="player-info">
              <span className="player-name">{player.displayName}</span>
              {player.uid === gmId && <span className="player-role">GM</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

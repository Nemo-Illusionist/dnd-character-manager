// Game Context - Current game context
import { createContext, useContext, useState, ReactNode } from 'react';
import type { Game } from 'shared';

interface GameContextType {
  currentGame: Game | null;
  setCurrentGame: (game: Game | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  const value: GameContextType = {
    currentGame,
    setCurrentGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

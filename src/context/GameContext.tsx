"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';

// Define the type for the context value
type GameContextType = ReturnType<typeof useGameLogic>;

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Create a custom hook to use the game context
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Create the provider component
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const gameLogic = useGameLogic();

  return (
    <GameContext.Provider value={gameLogic}>
      {children}
    </GameContext.Provider>
  );
}

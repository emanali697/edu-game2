/**
 * ===== Game Context =====
 *
 * Provides game configuration (childName, subject, grade, etc.)
 * to all child components without prop drilling.
 */

import { createContext, useContext, useState, useCallback } from "react";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [gameConfig, setGameConfig] = useState({
    childName: "",
     childId: "",
    subject: "",
    grade: "",
    level: "standard",
    gameId: "",
  });

  const updateConfig = useCallback((updates) => {
    setGameConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setGameConfig({
      childName: "",
      childId: "",
      subject: "",
      grade: "",
      level: "standard",
      gameId: "",
    });
  }, []);

  return (
    <GameContext.Provider value={{ gameConfig, updateConfig, resetConfig }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameConfig() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameConfig must be used within GameProvider");
  }
  return context;
}

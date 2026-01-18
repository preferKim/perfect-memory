
import React, { createContext, useState, useContext, useEffect } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

// Function to generate LEVEL_THRESHOLDS based on the 2^N progression
const generateLevelThresholds = (maxLevels = 15) => {
  const thresholds = [];
  let cumulativeXp = 0;
  for (let level = 1; level <= maxLevels; level++) {
    const xpForThisLevel = Math.pow(2, level); // XP needed to complete this level (e.g., Level 1 needs 2^1=2 XP)
    cumulativeXp += xpForThisLevel;
    thresholds.push(cumulativeXp);
  }
  return [...thresholds, Infinity]; // Add Infinity for the max level
};

const LEVEL_THRESHOLDS = generateLevelThresholds();

export const PlayerProvider = ({ children }) => {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [justLeveledUp, setJustLeveledUp] = useState(false);

  useEffect(() => {
    const savedLevel = localStorage.getItem('playerLevel');
    const savedXp = localStorage.getItem('playerXp');
    if (savedLevel && savedXp) {
      setLevel(parseInt(savedLevel, 10));
      setXp(parseInt(savedXp, 10));
    }
  }, []);

  const addXp = (amount) => {
    setJustLeveledUp(false);
    let newXp = xp + amount;
    let newLevel = level;

    // Check for level up
    // LEVEL_THRESHOLDS[newLevel - 1] is the XP needed to complete the current newLevel
    while (newLevel <= LEVEL_THRESHOLDS.length && newXp >= LEVEL_THRESHOLDS[newLevel - 1]) {
        if (LEVEL_THRESHOLDS[newLevel - 1] === Infinity) { // Max level reached
            break;
        }
        newLevel++;
        setJustLeveledUp(true);
    }
    
    setXp(newXp);
    setLevel(newLevel);
    localStorage.setItem('playerXp', newXp.toString());
    localStorage.setItem('playerLevel', newLevel.toString());
  };
  
  const resetLevelUp = () => {
    setJustLeveledUp(false);
  }

  const value = {
    level,
    xp,
    xpToNextLevelCumulative: LEVEL_THRESHOLDS[level - 1] || Infinity, // Total XP required to reach the next level (e.g., Level 2 needs 2 XP total)
    xpAtCurrentLevelStart: (level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0) || 0, // Total XP accumulated at the start of the current level (e.g., Level 2 starts at 2 XP total)
    xpGainedInCurrentLevel: xp - ((level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0) || 0), // XP gained within the current level
    xpRequiredForCurrentLevel: (LEVEL_THRESHOLDS[level - 1] || Infinity) - ((level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0) || 0), // XP needed to complete the current level (e.g., for L1->L2, need 2 XP)
    addXp,
    justLeveledUp,
    resetLevelUp,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

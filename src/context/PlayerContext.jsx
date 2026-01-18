
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Import supabase

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

export const PlayerProvider = ({ children }) => { // Remove user prop
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // New state for internal user

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        setCurrentUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAndSetPlayerStats = async () => {
      if (!currentUser) { // Change to !currentUser
        // Clear local state if no user
        setXp(0);
        setLevel(1);
        return;
      }

      // First, try to fetch from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('user_id', currentUser.id) // Change to currentUser.id
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching player stats from Supabase:', error);
        // If Supabase fetch fails, reset to defaults
        setXp(0);
        setLevel(1);
        return;
      }

      if (data) {
        // If data from Supabase, use it
        setXp(data.xp);
        setLevel(data.level);
      } else {
        // If no data (new user), set initial values and save to Supabase
        const initialXp = 0;
        const initialLevel = 1;
        setXp(initialXp);
        setLevel(initialLevel);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .update({ xp: initialXp, level: initialLevel }) // Use update to insert if no profile exists
          .eq('user_id', currentUser.id) // Change to currentUser.id
          .single();

        if (insertError) {
          console.error('Error inserting initial player stats:', insertError);
        }
      }
    };

    fetchAndSetPlayerStats();
  }, [currentUser]); // Change dependency to currentUser

  const addXp = async (amount) => {
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

    if (currentUser) {
        const { error } = await supabase
            .from('profiles')
            .update({ xp: newXp, level: newLevel })
            .eq('user_id', currentUser.id);
        if (error) {
            console.error('Error updating player stats in Supabase:', error);
        }
    }
  };
  
  const resetLevelUp = () => {
    setJustLeveledUp(false);
  }

  const deductXp = async (amount) => {
    setXp(prevXp => {
      const newXp = Math.max(0, prevXp - amount);
      // No level-down logic for now
      return newXp;
    });

    if (currentUser) {
        const { error } = await supabase
            .from('profiles')
            .update({ xp: xp - amount }) // Use current `xp` for Supabase update, as `setXp` is async
            .eq('user_id', currentUser.id);
        if (error) {
            console.error('Error updating player XP in Supabase:', error);
        }
    }
  };

  const value = {
    level,
    xp,
    xpToNextLevelCumulative: LEVEL_THRESHOLDS[level - 1] || Infinity, // Total XP required to reach the next level (e.g., Level 2 needs 2 XP total)
    xpAtCurrentLevelStart: (level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0) || 0, // Total XP accumulated at the start of the current level (e.g., Level 2 starts at 2 XP total)
    xpGainedInCurrentLevel: xp - ((level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0) || 0), // XP gained within the current level
    xpRequiredForCurrentLevel: (LEVEL_THRESHOLDS[level - 1] || Infinity) - ((level > 1 ? LEVEL_THRESHOLDS[level - 2] : 0) || 0), // XP needed to complete the current level (e.g., for L1->L2, need 2 XP)
    addXp,
    deductXp,
    justLeveledUp,
    resetLevelUp,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

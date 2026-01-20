import React, { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Sparkles } from 'lucide-react';

const LevelUpNotification = () => {
  const { justLeveledUp, level, resetLevelUp } = usePlayer();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (justLeveledUp) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        resetLevelUp(); // Reset the flag in context after animation
      }, 1000); // Show for 1 second

      return () => clearTimeout(timer);
    }
  }, [justLeveledUp, level, resetLevelUp]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="glass-card p-4 rounded-xl text-center shadow-lg border border-primary-light animate-scale-in-out">
        <div className="flex items-center justify-center gap-2">
          <Sparkles size={24} className="text-primary-light animate-bounce-y" />
          <h2 className="text-lg font-bold text-white">LEVEL UP!</h2>
          <p className="text-base text-primary-light">레벨 {level} 달성!</p>
        </div>
      </div>
    </div>
  );
};

export default LevelUpNotification;
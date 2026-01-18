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
      }, 3000); // Show for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [justLeveledUp, level, resetLevelUp]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-card p-8 rounded-2xl text-center shadow-lg border border-primary-light animate-scale-in-out">
        <Sparkles size={64} className="text-primary-light mx-auto mb-4 animate-bounce-y" />
        <h2 className="text-5xl font-extrabold text-white mb-2 leading-tight">LEVEL UP!</h2>
        <p className="text-3xl font-bold text-primary-light">레벨 {level} 달성!</p>
        <p className="text-lg text-gray-300 mt-2">새로운 도전을 시작하세요!</p>
      </div>
    </div>
  );
};

export default LevelUpNotification;
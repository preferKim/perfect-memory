import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Gem, Star, Crown } from 'lucide-react'; // Import Lucide icons

const LEVEL_ICONS = {
    1: '🥚', // Egg
    2: '🐣', // Hatching Chick
    3: '🐤', // Baby Chick
    4: '🐥', // Front-Facing Baby Chick
    5: '🐦', // Bird
    6: '🕊️', // Dove
    7: '🦅', // Eagle
    8: '🦉', // Owl
    9: '🐉', // Dragon
    10: <Gem size={24} className="text-blue-400" />, // Gem
    11: <Star size={24} className="text-yellow-400" />, // Star
    12: <Star size={24} className="text-yellow-400" />,
    13: <Star size={24} className="text-yellow-400" />,
    14: <Star size={24} className="text-yellow-400" />,
    15: <Crown size={24} className="text-red-400" />, // Crown
    16: <Crown size={24} className="text-red-400" />,
    17: <Crown size={24} className="text-red-400" />,
    18: <Crown size={24} className="text-red-400" />,
    19: <Crown size={24} className="text-red-400" />,
    20: <span className="text-4xl">👑</span>, // King Crown Emoji
};

const PlayerStats = ({ className = '' }) => {
    const { level, xp, xpGainedInCurrentLevel, xpRequiredForCurrentLevel } = usePlayer();

    const progressPercentage = xpRequiredForCurrentLevel > 0 ? (xpGainedInCurrentLevel / xpRequiredForCurrentLevel) * 100 : 100;
    const levelIcon = LEVEL_ICONS[level] || '❓'; // Fallback icon

    return (
        <div className={`glass-card p-4 flex flex-col items-center justify-center gap-2 ${className}`}>
            <div className="flex items-center justify-center gap-2">
                {typeof levelIcon === 'string' ? (
                    <span className="text-3xl">{levelIcon}</span>
                ) : (
                    levelIcon
                )}
                <span className="font-bold text-4xl text-primary-light drop-shadow-lg">LV. {level}</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2 border-2 border-white/10 shadow-inner">
                <div
                    className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            <div className="text-xs text-gray-300">
                <span className="font-bold">{xpGainedInCurrentLevel.toLocaleString()}</span> / {xpRequiredForCurrentLevel.toLocaleString()} XP
            </div>
        </div>
    );
};

export default PlayerStats;

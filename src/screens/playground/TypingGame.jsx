import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const words = ["React", "JavaScript", "Tailwind", "Vite", "Supabase", "Component", "Props", "State", "Hook"];

const TypingGame = ({ onBack }) => {
    const [currentWord, setCurrentWord] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [score, setScore] = useState(0);

    const selectNewWord = () => {
        const randomIndex = Math.floor(Math.random() * words.length);
        setCurrentWord(words[randomIndex]);
    };

    useEffect(() => {
        selectNewWord();
    }, []);

    const handleChange = (e) => {
        setInputValue(e.target.value);
        if (e.target.value.toLowerCase() === currentWord.toLowerCase()) {
            setScore(score + 1);
            setInputValue('');
            selectNewWord();
        }
    };

    return (
        <div className="glass-card p-6 sm:p-12 text-center relative flex flex-col items-center">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 text-gray-200 hover:text-white transition p-2"
                title="Back"
                aria-label="Back"
            >
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-4xl font-bold text-white mb-4">타이핑 게임</h1>
            <p className="text-2xl text-gray-300 mb-8">점수: {score}</p>
            <p className="text-5xl font-bold text-primary-light mb-8 tracking-widest">{currentWord}</p>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                autoFocus
                className="w-full max-w-xs mx-auto px-4 py-3 text-center text-lg font-medium bg-white/5 border-2 border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
        </div>
    );
};

export default TypingGame;

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Keyboard } from 'lucide-react';

const words = ["React", "JavaScript", "Tailwind", "Vite", "Supabase", "Component", "Props", "State", "Hook"];

const TypingGame = ({ onBack }) => {
    const inputRef = useRef(null); // Ref for the input field

    const [difficulty, setDifficulty] = useState('easy');
    const [wordList, setWordList] = useState([]);
    const [currentWordObj, setCurrentWordObj] = useState({ english: '', korean: '' });
    const [inputValue, setInputValue] = useState('');
    const [score, setScore] = useState(0);
    const [hint, setHint] = useState('');
    const [isHintModeOn, setIsHintModeOn] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [gameState, setGameState] = useState('playing');

    const difficultyFiles = {
        easy: '/words/english_easy.json',
        medium: '/words/english_medium.json',
        hard: '/words/english_hard.json',
    };

    const selectNewWord = () => {
        if (wordList.length > 0) {
            const randomIndex = Math.floor(Math.random() * wordList.length);
            setCurrentWordObj(wordList[randomIndex]);
            setInputValue('');
            // Ensure input is focused when a new word appears
            inputRef.current?.focus();
        }
    };

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const response = await fetch(difficultyFiles[difficulty]);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setWordList(data);
            } catch (error) {
                console.error("Failed to fetch words:", error);
                setWordList([]); // Reset on error
            }
        };

        fetchWords();
    }, [difficulty]); // Refetch words whenever difficulty changes

    useEffect(() => {
        // Select a new word only when wordList is loaded or difficulty changes
        if (wordList.length > 0) {
            selectNewWord();
        }
    }, [wordList, difficulty]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        if (timeLeft <= 0) {
            setGameState('finished');
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, gameState]);

    const handlePass = () => {
        selectNewWord();
    };

    const toggleHintMode = () => {
        setIsHintModeOn(!isHintModeOn);
        // Re-focus the input to keep the keyboard open on mobile
        inputRef.current?.focus();
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
        if (e.target.value.toLowerCase() === currentWordObj.english.toLowerCase()) {
            setScore(score + 1);
            setInputValue('');
            selectNewWord();
        }
    };

    const handleShowHint = () => {
        if (currentWordObj.english) {
            const hintLength = Math.ceil(currentWordObj.english.length * 0.3);
            const revealedPart = currentWordObj.english.substring(0, hintLength);
            // The actual hint string with '_' is generated dynamically in JSX,
            // so here we just set showHint to true.
            setHint(revealedPart); // This hint state is not directly used for display, but can be for future use if needed.
            setIsHintModeOn(true);
        }
    };

    const handlePlayAgain = () => {
        setScore(0);
        setTimeLeft(60);
        setGameState('playing');
        selectNewWord();
    };

    if (gameState === 'finished') {
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
                <h1 className="text-4xl font-bold text-white mb-4">타임 오버!</h1>
                <p className="text-2xl text-gray-300 mb-8">최종 점수: <span className="text-primary-light font-bold">{score}</span></p>
                <button
                    onClick={handlePlayAgain}
                    className="px-6 py-3 rounded-lg font-bold transition bg-primary hover:bg-primary-dark text-white shadow-lg"
                >
                    다시하기
                </button>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 sm:p-12 text-center h-full flex flex-col justify-between">
            {/* Header Section */}
            <header className="relative w-full">
                <button
                    onClick={onBack}
                    className="absolute top-0 left-0 text-gray-200 hover:text-white transition p-2"
                    title="Back"
                    aria-label="Back"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="text-center w-full">
                    <Keyboard size={48} className="text-white inline-block" />
                </div>
            </header>

            {/* Main Content Section (takes up all available space) */}
            <main className="flex-grow flex flex-col justify-center items-center w-full">
                <div className="flex justify-center items-center w-full max-w-md mb-4 space-x-8">
                    <p className="text-xl text-gray-300">
                        점수: <span className="text-primary-light font-bold">{score}</span>
                    </p>
                    <p className="text-xl font-bold text-white bg-white/10 px-3 py-1 rounded-lg flex items-center">
                        <Clock size={20} className="inline-block mr-2" /> {timeLeft}
                    </p>
                </div>
                 <div className="flex space-x-2 mb-4">
                    {['easy', 'medium', 'hard'].map((level) => (
                        <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                                difficulty === level
                                    ? 'bg-primary-light text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>
                <p className="text-5xl font-bold text-primary-light mb-4 tracking-widest">{currentWordObj.korean}</p>
                <div className="flex justify-center items-center h-8">
                    {isHintModeOn && currentWordObj.english && (
                        <div className="flex space-x-1">
                            {currentWordObj.english.split('').map((char, index) => (
                                <span
                                    key={index}
                                    style={{
                                        display: 'inline-block',
                                        width: '1.2em',
                                        textAlign: 'center',
                                        borderBottom: '2px solid white',
                                        color: index < Math.ceil(currentWordObj.english.length * 0.3) ? 'white' : 'transparent',
                                        userSelect: 'none',
                                    }}
                                    className="text-xl font-mono"
                                >
                                    {index < Math.ceil(currentWordObj.english.length * 0.3) ? char : '_'}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Section (for actions and input) */}
            <footer className="w-full flex flex-col items-center">
                <div className="flex space-x-4 mb-4">
                    <button
                        onClick={toggleHintMode}
                        className={`px-6 py-2 rounded-lg font-bold transition w-32 ${
                            isHintModeOn 
                                ? 'bg-green-500 text-white hover:bg-green-600' 
                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                    >
                        {isHintModeOn ? '힌트 ON' : '힌트 OFF'}
                    </button>
                    <button
                        onClick={handlePass}
                        className="px-6 py-2 rounded-lg font-bold transition w-32 bg-gray-500 text-white hover:bg-gray-600"
                    >
                        통과
                    </button>
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    autoFocus
                    ref={inputRef} // Attach ref here
                    className="w-full max-w-xs mx-auto px-4 py-3 text-center text-lg font-medium bg-white/5 border-2 border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
            </footer>
        </div>
    );
};



export default TypingGame;

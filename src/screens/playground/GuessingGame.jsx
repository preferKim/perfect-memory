import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash } from 'lucide-react';
import Button from '../../components/Button';

const GUESS_LIMIT = 5;

const GuessingGame = () => {
    const navigate = useNavigate();
    const [targetNumber, setTargetNumber] = useState(0);
    const [guess, setGuess] = useState('');
    const [message, setMessage] = useState('1과 100 사이의 숫자를 맞춰보세요!');
    const [guesses, setGuesses] = useState(0);
    const [mode, setMode] = useState('normal'); // 'normal', 'easy', or 'hard'
    const [history, setHistory] = useState([]);
    const [gameOver, setGameOver] = useState(false);

    const startNewGame = () => {
        setTargetNumber(Math.floor(Math.random() * 100) + 1);
        setGuesses(0);
        setGuess('');
        setHistory([]);
        setGameOver(false);
        setMessage('1과 100 사이의 숫자를 맞춰보세요!');
    };

    useEffect(() => {
        startNewGame();
    }, []);

    const handleModeChange = (newMode) => {
        setMode(newMode);
        startNewGame();
    };

    const handleGuess = (e) => {
        e.preventDefault();
        const numGuess = parseInt(guess, 10);
        if (isNaN(numGuess)) {
            setMessage('숫자를 입력해주세요.');
            return;
        }

        const newGuesses = guesses + 1;
        setGuesses(newGuesses);
        let resultMessage = '';

        if (numGuess === targetNumber) {
            resultMessage = `정답입니다! ${newGuesses}번 만에 맞췄어요!`;
            setGameOver(true);
        } else {
            if (numGuess < targetNumber) {
                resultMessage = '더 큰 숫자입니다.';
            } else {
                resultMessage = '더 작은 숫자입니다.';
            }

            if (mode === 'hard' && newGuesses >= GUESS_LIMIT) {
                resultMessage = `게임 오버! 정답은 ${targetNumber} 였습니다.`;
                setGameOver(true);
            }
        }
        
        setMessage(resultMessage);

        if (mode === 'easy' && numGuess !== targetNumber && !gameOver) {
            setHistory(prevHistory => [...prevHistory, { guess: numGuess, result: resultMessage }]);
        }
        
        setGuess('');
    };

    return (
        <div className="glass-card p-6 sm:p-12 text-center relative flex flex-col items-center">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 text-gray-200 hover:text-white transition p-2"
                title="Back"
                aria-label="Back"
            >
                <ArrowLeft size={24} />
            </button>
            <Hash size={48} className="text-white mb-4" />

            <div className="flex gap-4 mb-6">
                <Button onClick={() => handleModeChange('easy')} variant="mode" mode="success" isActive={mode === 'easy'}>
                    Easy
                </Button>
                <Button onClick={() => handleModeChange('normal')} variant="mode" mode="normal" isActive={mode === 'normal'}>
                    Normal
                </Button>
                <Button onClick={() => handleModeChange('hard')} variant="mode" mode="danger" isActive={mode === 'hard'}>
                    Hard
                </Button>
            </div>

            <p className="text-xl text-gray-300 mb-8 h-8">{message}</p>
            
            {!gameOver ? (
                <form onSubmit={handleGuess} className="flex flex-col items-center gap-4 mb-8">
                    {mode === 'hard' && (
                        <p className="text-lg text-yellow-300">
                            남은 기회: {GUESS_LIMIT - guesses}
                        </p>
                    )}
                    <input
                        type="number"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        min="1"
                        max="100"
                        required
                        className="w-full max-w-xs mx-auto px-4 py-3 text-center text-lg font-medium bg-white/5 border-2 border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                    <Button type="submit" variant="threedee" color="primary">
                        추측!
                    </Button>
                </form>
            ) : (
                <div className="flex flex-col items-center gap-4 mb-8">
                    <Button onClick={startNewGame} variant="threedee" color="secondary">
                        재도전
                    </Button>
                </div>
            )}

            {mode === 'easy' && history.length > 0 && (
                <div className="w-full max-w-xs mt-4">
                    <h3 className="text-lg font-bold text-white mb-2">추측 기록:</h3>
                    <ul className="text-left bg-black/20 rounded-lg p-3 space-y-2">
                        {history.map((item, index) => (
                            <li key={index} className="text-gray-300">
                                <span className="font-semibold text-white">{item.guess}</span>: {item.result}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {!gameOver && (
              <Button onClick={startNewGame} variant="threedee" color="secondary" className="mt-auto">
                  새 게임
              </Button>
            )}
        </div>
    );
};

export default GuessingGame;

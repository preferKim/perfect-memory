import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';

const GuessingGame = ({ onBack }) => {
    const [targetNumber, setTargetNumber] = useState(0);
    const [guess, setGuess] = useState('');
    const [message, setMessage] = useState('1과 100 사이의 숫자를 맞춰보세요!');
    const [guesses, setGuesses] = useState(0);

    const startNewGame = () => {
        setTargetNumber(Math.floor(Math.random() * 100) + 1);
        setGuesses(0);
        setGuess('');
        setMessage('1과 100 사이의 숫자를 맞춰보세요!');
    };

    useEffect(() => {
        startNewGame();
    }, []);

    const handleGuess = (e) => {
        e.preventDefault();
        const numGuess = parseInt(guess, 10);
        if (isNaN(numGuess)) {
            setMessage('숫자를 입력해주세요.');
            return;
        }

        setGuesses(guesses + 1);

        if (numGuess === targetNumber) {
            setMessage(`정답입니다! ${guesses + 1}번 만에 맞췄어요!`);
        } else if (numGuess < targetNumber) {
            setMessage('더 큰 숫자입니다.');
        } else {
            setMessage('더 작은 숫자입니다.');
        }
        setGuess('');
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
            <h1 className="text-4xl font-bold text-white mb-4">숫자 맞추기 게임</h1>
            <p className="text-xl text-gray-300 mb-8">{message}</p>
            
            <form onSubmit={handleGuess} className="flex flex-col items-center gap-4 mb-8">
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

            <Button onClick={startNewGame} variant="threedee" color="secondary">
                새 게임
            </Button>
        </div>
    );
};

export default GuessingGame;

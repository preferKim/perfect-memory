import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Target } from 'lucide-react';
import Button from '../../components/Button';

const generateProblem = () => {
    const target = Math.floor(Math.random() * 40) + 20; // Target between 20 and 59

    let components = [];
    let currentSum = 0;

    // Create components that sum up to the target
    while (currentSum < target) {
        let diff = target - currentSum;
        let maxVal = Math.min(diff, 12); // Max value for a single button is 12
        let newVal = Math.floor(Math.random() * maxVal) + 1;
        components.push(newVal);
        currentSum += newVal;
    }

    // Add some dummy numbers
    const numDummies = Math.floor(Math.random() * 2) + 2; // 2-3 dummy numbers
    for (let i = 0; i < numDummies; i++) {
        components.push(Math.floor(Math.random() * 12) + 1);
    }
    
    // Shuffle the options
    return { target, options: components.sort(() => Math.random() - 0.5) };
};

const ClickerGame = () => {
    const navigate = useNavigate();
    const [targetNumber, setTargetNumber] = useState(0);
    const [currentSum, setCurrentSum] = useState(0);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [gameOver, setGameOver] = useState(false);

    const startNewRound = useCallback(() => {
        const problem = generateProblem();
        setTargetNumber(problem.target);
        setOptions(problem.options);
        setCurrentSum(0);
    }, []);

    const handleRestart = useCallback(() => {
        setScore(0);
        setTimeRemaining(60);
        setGameOver(false);
        startNewRound();
    }, [startNewRound]);

    useEffect(() => {
        handleRestart();
    }, [handleRestart]);

    // Game Logic Effect
    useEffect(() => {
        if (gameOver) return;

        if (currentSum === targetNumber) {
            setScore(prev => prev + 1);
            startNewRound();
        } else if (currentSum > targetNumber) {
            setGameOver(true);
        }
    }, [currentSum, targetNumber, gameOver, startNewRound]);

    // Timer Effect
    useEffect(() => {
        if (gameOver || timeRemaining <= 0) {
            if (timeRemaining <= 0) setGameOver(true);
            return;
        };

        const timer = setInterval(() => {
            setTimeRemaining(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameOver, timeRemaining]);


    const handleNumberClick = (num) => {
        if (gameOver) return;
        setCurrentSum(prev => prev + num);
    };
    
    // The handleRestart function is now defined above with useCallback

    return (
        <div className="glass-card p-6 sm:p-12 text-center relative flex flex-col items-center w-full max-w-2xl mx-auto">
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-gray-200 hover:text-white transition p-2">
                <ArrowLeft size={24} />
            </button>
            <Target size={48} className="text-white mb-4" />
            
            <div className="flex justify-between w-full max-w-sm text-white mb-6">
                <div className="text-lg">점수: <span className="font-bold">{score}</span></div>
                <div className="text-lg">남은 시간: <span className="font-bold">{timeRemaining}</span></div>
            </div>

            {!gameOver ? (
                <div className='w-full'>
                    <div className="bg-black/20 p-4 rounded-xl mb-6">
                        <p className="text-lg text-gray-300">목표</p>
                        <p className="text-5xl font-bold text-white">{targetNumber}</p>
                        <p className="text-lg text-gray-300 mt-2">현재 합계</p>
                        <p className="text-3xl font-bold text-yellow-300">{currentSum}</p>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {options.map((num, index) => (
                            <Button key={index} onClick={() => handleNumberClick(num)} variant="threedee" color="primary" className="h-20 text-2xl">
                                +{num}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                    <h2 className="text-4xl font-bold text-red-400 mb-2">게임 오버!</h2>
                    <p className="text-xl text-white mb-6">
                        {currentSum > targetNumber ? `목표(${targetNumber})를 초과했습니다!` : '시간 초과!'}
                    </p>
                    <p className="text-2xl text-white mb-8">최종 점수: {score}</p>
                    <Button onClick={handleRestart} variant="threedee" color="secondary" className="flex items-center gap-2">
                        <RefreshCw size={20} />
                        재시도
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ClickerGame;
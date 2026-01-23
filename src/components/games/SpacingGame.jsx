import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Button from '../Button';

const SpacingGame = ({ onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', or null
    const [gameOver, setGameOver] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        fetch('/words/korean_spacing_easy.json')
            .then(res => res.json())
            .then(data => setQuestions(data.sort(() => Math.random() - 0.5)))
            .catch(err => console.error("Failed to load spacing questions:", err));
    }, []);

    useEffect(() => {
        if (!gameOver && questions.length > 0) {
            inputRef.current?.focus();
        }
    }, [currentQuestionIndex, gameOver, questions]);

    const startNewGame = () => {
        setQuestions(questions.sort(() => Math.random() - 0.5));
        setCurrentQuestionIndex(0);
        setScore(0);
        setInputValue('');
        setFeedback(null);
        setGameOver(false);
    };

    const normalizeAnswer = (str) => {
        return str.trim().replace(/\s+/g, ' ');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (feedback) return;

        const userAnswer = normalizeAnswer(inputValue);
        const correctAnswer = normalizeAnswer(questions[currentQuestionIndex].answer);

        if (userAnswer === correctAnswer) {
            setScore(prev => prev + 1);
            setFeedback('correct');
        } else {
            setFeedback('wrong');
        }

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setInputValue('');
                setFeedback(null);
            } else {
                setGameOver(true);
            }
        }, 2000);
    };

    if (questions.length === 0) {
        return (
            <div className="glass-card p-6 sm:p-12 text-center">
                <p className="text-white text-xl">퀴즈를 불러오는 중입니다...</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    
    const renderFeedback = () => {
        if (!feedback) return null;
        
        let content;
        if (feedback === 'correct') {
            content = <CheckCircle size={80} className="text-white animate-pulse" />;
        } else {
            content = (
                <div className="text-center">
                    <XCircle size={80} className="text-white animate-pulse" />
                    <p className="text-white text-xl sm:text-2xl font-bold mt-4">정답:</p>
                    <p className="text-white text-lg sm:text-xl font-bold">{currentQuestion.answer}</p>
                </div>
            );
        }
        
        const bgColor = feedback === 'correct' ? 'bg-green-500/80' : 'bg-red-500/80';
        return <div className={`absolute inset-0 ${bgColor} flex items-center justify-center rounded-2xl`}>{content}</div>;
    }

    return (
        <div className="glass-card p-6 sm:p-12 text-center relative flex flex-col items-center max-w-2xl mx-auto">
            <div className="w-full flex justify-between items-center mb-6">
                <div className="w-1/4">
                    <button onClick={onBack} className="text-gray-200 hover:text-white transition p-2" title="뒤로가기">
                        <ArrowLeft size={24} />
                    </button>
                </div>
                <div className="w-1/2 text-center">
                    <h2 className="text-2xl font-bold text-white">띄어쓰기 퀴즈</h2>
                </div>
                <div className="w-1/4 text-right">
                    <p className="text-xl text-primary-light font-semibold">점수: {score}</p>
                </div>
            </div>
            
            <div className="w-full">
                {!gameOver ? (
                    <div className="w-full">
                        <div className="bg-black/20 p-8 rounded-2xl mb-8 min-h-[120px] flex items-center justify-center relative border-2 border-white/10">
                            <p className="text-2xl sm:text-3xl text-white font-medium leading-relaxed" style={{ wordBreak: 'keep-all' }}>{currentQuestion.question}</p>
                            {renderFeedback()}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="정답을 입력하세요"
                                className="w-full max-w-lg mx-auto px-4 py-3 text-center text-lg font-medium bg-white/5 border-2 border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary focus:border-primary transition"
                                disabled={!!feedback}
                            />
                            <Button type="submit" variant="threedee" color="primary" disabled={!!feedback}>
                                확인
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        <h3 className="text-4xl font-bold text-white">게임 종료!</h3>
                        <p className="text-2xl text-primary-light">총 {questions.length} 문제 중 <span className="font-bold text-white">{score}</span>개를 맞췄습니다.</p>
                        <Button onClick={startNewGame} variant="threedee" color="secondary" className="mt-4">
                            다시하기
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpacingGame;

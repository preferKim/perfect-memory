import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, Star, BookOpen, Lightbulb } from 'lucide-react';
import Button from '../Button';

const SpellingGame = ({ onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', or null
    const [gameOver, setGameOver] = useState(false);
    const explanationRef = useRef(null);

    useEffect(() => {
        fetch('/words/korean_spelling_easy.json')
            .then(res => res.json())
            .then(data => {
                setQuestions(data.filter(q => q.question)); // 데이터 유효성 검사
            })
            .catch(err => console.error("Failed to load spelling questions:", err));
    }, []);

    useEffect(() => {
        if (feedback && explanationRef.current) {
            explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [feedback]);

    const startNewGame = () => {
        setQuestions(questions.sort(() => Math.random() - 0.5));
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setFeedback(null);
        setGameOver(false);
    };

    const handleAnswerSelect = (option) => {
        if (selectedAnswer) return; // Prevent multiple selections

        setSelectedAnswer(option);
        const currentQuestion = questions[currentQuestionIndex];
        if (option === currentQuestion.answer) {
            setScore(prev => prev + 1);
            setFeedback('correct');
        } else {
            setFeedback('wrong');
        }
    };
    
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setFeedback(null);
        } else {
            setGameOver(true);
        }
    };
    
    if (questions.length === 0) {
        return (
            <div className="glass-card p-6 sm:p-12 text-center">
                <p className="text-white text-xl">퀴즈를 불러오는 중입니다...</p>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];

    const renderDifficulty = (level) => {
        const totalStars = 5;
        let filledStars = 0;
        if (typeof level === 'number') {
            filledStars = level;
        } else if (typeof level === 'string') {
            if (level === '하') filledStars = 1;
            else if (level === '중') filledStars = 3;
            else if (level === '상') filledStars = 5;
        }
        return (
            <div className="flex">
                {[...Array(totalStars)].map((_, i) => (
                    <Star key={i} size={16} className={i < filledStars ? 'text-yellow-400 fill-current' : 'text-gray-600'} />
                ))}
            </div>
        );
    };

    return (
        <div className="glass-card p-4 sm:p-8 text-center relative flex flex-col items-center max-w-2xl mx-auto">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-4">
                    <div className="w-1/4">
                        <button
                            onClick={onBack}
                            className="text-gray-200 hover:text-white transition p-2"
                            title="뒤로가기"
                            aria-label="Back to Korean selection"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    </div>
                    <div className="w-1/2 text-center">
                        <h2 className="text-2xl font-bold text-white">맞춤법 퀴즈</h2>
                    </div>
                    <div className="w-1/4 text-right">
                        <p className="text-xl text-primary-light font-semibold">점수: {score}</p>
                    </div>
                </div>

                {!gameOver ? (
                    <div className="w-full">
                        <div className="bg-black/10 p-2 rounded-lg mb-4 flex justify-around text-xs sm:text-sm text-gray-300">
                           {currentQuestion.category && <span className="flex items-center"><HelpCircle size={14} className="mr-1.5"/>유형: {currentQuestion.category}</span>}
                           {currentQuestion.difficulty && <span className="flex items-center"><Star size={14} className="mr-1.5"/>난이도: {renderDifficulty(currentQuestion.difficulty)}</span>}
                        </div>

                        <div className="bg-black/20 p-8 rounded-2xl mb-6 min-h-[120px] flex items-center justify-center relative border-2 border-white/10">
                            <p className="text-2xl sm:text-3xl text-white font-medium leading-relaxed">{currentQuestion.question}</p>
                        </div>

                        <div className="flex w-full h-40 sm:h-56 gap-2 mb-4">
                            {currentQuestion.options.map((option, index) => {
                                const isCorrect = option === currentQuestion.answer;
                                let choiceClasses = `w-1/2 flex items-center justify-center text-3xl font-bold rounded-2xl transition-all duration-300 transform border-4`;

                                if (selectedAnswer) {
                                    choiceClasses += ' cursor-not-allowed';
                                    if (isCorrect) {
                                        choiceClasses += ' bg-green-500/90 border-green-300 text-white scale-105 shadow-lg';
                                    } else if (option === selectedAnswer) {
                                        choiceClasses += ' bg-red-500/80 border-red-300 text-white opacity-70';
                                    } else {
                                        choiceClasses += ' bg-gray-700/40 border-gray-600 text-gray-400 opacity-50';
                                    }
                                } else {
                                    const colors = ['bg-blue-900/50 border-blue-700 hover:bg-blue-800/70', 'bg-purple-900/50 border-purple-700 hover:bg-purple-800/70'];
                                    choiceClasses += ` cursor-pointer hover:scale-105 ${colors[index % 2]} text-white`;
                                }

                                return (
                                    <div key={index} onClick={() => handleAnswerSelect(option)} className={choiceClasses}>
                                        {option}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {feedback && (
                             <div className="w-full" ref={explanationRef}>
                                <div className="bg-black/20 p-4 rounded-xl mb-4 text-left border border-white/10">
                                    <h3 className="font-bold text-lg text-blue-300 flex items-center mb-2"><BookOpen size={18} className="mr-2"/>해설</h3>
                                    <p className="text-gray-200">{currentQuestion.explanation || "해설 정보가 없습니다."}</p>
                                </div>
                                {currentQuestion.tip && (
                                    <div className="bg-yellow-900/30 p-4 rounded-xl text-left border border-yellow-500/30">
                                        <h3 className="font-bold text-lg text-yellow-300 flex items-center mb-2"><Lightbulb size={18} className="mr-2"/>암기 팁!</h3>
                                        <p className="text-yellow-200">{currentQuestion.tip}</p>
                                    </div>
                                )}
                                <Button onClick={handleNextQuestion} variant="threedee" color="primary" className="w-full mt-4">
                                    다음
                                </Button>
                            </div>
                        )}

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

export default SpellingGame;
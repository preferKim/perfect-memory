import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, HelpCircle, Star, BookOpen, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import Button from '../Button';

const SpacingGame = ({ onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', or null
    const [gameOver, setGameOver] = useState(false);
    const [spacings, setSpacings] = useState([]);
    const [lastUserAnswer, setLastUserAnswer] = useState('');
    const explanationRef = useRef(null);

    useEffect(() => {
        fetch('/words/korean_spacing_easy.json')
            .then(res => res.json())
            .then(data => {
                const shuffled = data.sort(() => Math.random() - 0.5);
                setQuestions(shuffled);
                if (shuffled.length > 0) {
                    setSpacings(new Array(shuffled[0].question.length - 1).fill(false));
                }
            })
            .catch(err => console.error("Failed to load spacing questions:", err));
    }, []);

    useEffect(() => {
        if (feedback && explanationRef.current) {
            explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [feedback]);

    const startNewGame = () => {
        const shuffled = questions.sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setCurrentQuestionIndex(0);
        setScore(0);
        setFeedback(null);
        setGameOver(false);
        if (shuffled.length > 0) {
            setSpacings(new Array(shuffled[0].question.length - 1).fill(false));
            setLastUserAnswer('');
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            setSpacings(new Array(questions[nextIndex].question.length - 1).fill(false));
            setFeedback(null);
            setLastUserAnswer('');
        } else {
            setGameOver(true);
        }
    };

    const normalizeAnswer = (str) => {
        return str.trim().replace(/\s+/g, ' ');
    };

    const buildAnswerFromSpacings = () => {
        const question = questions[currentQuestionIndex].question;
        let result = question[0];
        for (let i = 0; i < spacings.length; i++) {
            if (spacings[i]) {
                result += ' ';
            }
            result += question[i + 1];
        }
        return result;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (feedback) return;

        const userAnswer = normalizeAnswer(buildAnswerFromSpacings());
        const correctAnswer = normalizeAnswer(questions[currentQuestionIndex].answer);

        setLastUserAnswer(userAnswer);
        if (userAnswer === correctAnswer) {
            setScore(prev => prev + 1);
            setFeedback('correct');
        } else {
            setFeedback('wrong');
        }
    };

    const toggleSpace = (index) => {
        if (feedback) return;
        setSpacings(prevSpacings => {
            const newSpacings = [...prevSpacings];
            newSpacings[index] = !newSpacings[index];
            return newSpacings;
        });
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
        if (level === '초급') filledStars = 1;
        else if (level === '중급') filledStars = 3;
        else if (level === '고급') filledStars = 5;
        
        return (
            <div className="flex">
                {[...Array(totalStars)].map((_, i) => (
                    <Star key={i} size={16} className={i < filledStars ? 'text-yellow-400 fill-current' : 'text-gray-600'} />
                ))}
            </div>
        );
    };

    const renderInteractiveQuestion = () => {
        const question = currentQuestion.question;
        const chars = question.split('');
    
        return (
            <div className="flex flex-wrap items-center justify-center p-4 leading-loose">
                {chars.map((char, index) => (
                    <React.Fragment key={index}>
                        <span className="text-2xl sm:text-3xl text-white font-medium select-none">{char}</span>
                        {index < chars.length - 1 && (
                            <span 
                                className={`h-10 inline-block cursor-pointer align-bottom ${spacings[index] ? 'w-5' : 'w-1'}`} 
                                onClick={() => toggleSpace(index)}
                            >
                                {spacings[index] ? '\u00A0' : ''}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };
    
    return (
        <div className="glass-card p-4 sm:p-8 text-center relative flex flex-col items-center max-w-2xl mx-auto">
            <div className="w-full">
                <div className="w-full flex justify-between items-center mb-4">
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
            
                {!gameOver ? (
                    <div className="w-full">
                        <div className="bg-black/10 p-2 rounded-lg mb-4 flex justify-around text-xs sm:text-sm text-gray-300">
                           {currentQuestion.category && <span className="flex items-center"><HelpCircle size={14} className="mr-1.5"/>유형: {currentQuestion.category}</span>}
                           {currentQuestion.difficulty && <span className="flex items-center"><Star size={14} className="mr-1.5"/>난이도: {renderDifficulty(currentQuestion.difficulty)}</span>}
                        </div>
                        
                        <p className="text-white/80 text-base mb-2">글자 사이를 클릭하여 띄어쓰기를 조절하세요.</p>
                        <div className={`bg-black/20 p-2 rounded-2xl mb-6 min-h-[120px] flex items-center justify-center relative border-2 transition-colors ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-white/10'}`}>
                            {!feedback ? (
                                renderInteractiveQuestion()
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    {feedback === 'correct' ? (
                                        <CheckCircle size={80} className="text-green-400 animate-bounce" />
                                    ) : (
                                        <XCircle size={80} className="text-red-400 animate-bounce" />
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {!feedback ? (
                            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                                <Button type="submit" variant="threedee" color="primary">
                                    확인
                                </Button>
                            </form>
                        ) : (
                             <div className="w-full animate-fade-in" ref={explanationRef}>
                                {feedback === 'wrong' && (
                                    <div className="bg-red-900/40 p-4 rounded-xl mb-4 text-left border border-red-500/50">
                                        <h3 className="font-bold text-lg text-red-300 mb-2">제출한 답</h3>
                                        <p className="text-white font-mono p-2 bg-black/30 rounded">{lastUserAnswer || ' '}</p>
                                        <h3 className="font-bold text-lg text-green-300 mt-3 mb-2">정답</h3>
                                        <p className="text-white font-mono p-2 bg-black/30 rounded">{currentQuestion.answer}</p>
                                    </div>
                                )}
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
                                    다음 문제
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

export default SpacingGame;
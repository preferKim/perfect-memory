import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import Button from '../Button';

const GrammarQuiz = ({ onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedWords, setSelectedWords] = useState([]);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', or null
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('/words/korean_grammar_quiz.json');
                if (!response.ok) {
                    throw new Error('Failed to load quiz data');
                }
                const data = await response.json();
                // Shuffle questions for variety
                setQuestions(data.sort(() => Math.random() - 0.5));
            } catch (error) {
                console.error("Error fetching quiz data:", error);
                // Handle error, maybe show a message to the user
            }
        };
        fetchQuestions();
    }, []);

    const currentQuestion = questions[currentQuestionIndex];

    const handleWordClick = (word) => {
        if (feedback !== null) return; // Don't allow changes after checking answer

        setSelectedWords(prev =>
            prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
        );
    };

    const checkAnswer = () => {
        if (!currentQuestion) return;

        const correctAnswers = currentQuestion.answers;
        // Check if the selected words match the correct answers perfectly
        const isCorrect = selectedWords.length === correctAnswers.length &&
            selectedWords.every(word => correctAnswers.includes(word.trim()));

        if (isCorrect) {
            setScore(prev => prev + 1);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedWords([]);
            setFeedback(null);
        } else {
            setIsFinished(true);
        }
    };
    
    const restartQuiz = () => {
        setCurrentQuestionIndex(0);
        setSelectedWords([]);
        setScore(0);
        setFeedback(null);
        setIsFinished(false);
        // Reshuffle questions on restart
        setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
    };

    if (questions.length === 0) {
        return <div className="text-center text-white">퀴즈를 불러오는 중...</div>;
    }
    
    if (isFinished) {
        return (
            <div className="glass-card p-6 sm:p-8 text-center text-white">
                <h2 className="text-3xl font-bold mb-4 text-primary-light">퀴즈 완료!</h2>
                <p className="text-xl mb-6">
                    총 {questions.length}문제 중 <span className="text-yellow-300 font-bold">{score}</span>문제를 맞혔습니다!
                </p>
                <div className="flex justify-center gap-4">
                    <Button onClick={restartQuiz} variant="threedee" color="primary">다시 풀기</Button>
                    <Button onClick={onBack} variant="threedee" color="normal">돌아가기</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 sm:p-8 text-white relative">
            <div className="w-full flex justify-between items-center mb-4">
                <div className="w-1/4">
                    <button
                        onClick={onBack}
                        className="text-gray-200 hover:text-white transition p-2"
                        title="뒤로가기"
                        aria-label="Back to selection"
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>
                <div className="w-1/2 text-center">
                    <h2 className="text-2xl font-bold text-white">문법 기본 퀴즈</h2>
                </div>
                <div className="w-1/4 text-right">
                    <p className="text-xl text-primary-light font-semibold">점수: {score}</p>
                </div>
            </div>

            <div className="text-center">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-300">문제 {currentQuestionIndex + 1} / {questions.length}</p>
                    {currentQuestion.level && (
                        <span className="text-xs font-bold bg-blue-500/50 text-white px-2 py-1 rounded-full">
                            LV.{currentQuestion.level}
                        </span>
                    )}
                </div>
                <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>

                <div className="bg-black/30 p-6 rounded-lg mb-6 min-h-[100px] flex items-center">
                    <p className="text-2xl tracking-wider text-left">
                        {currentQuestion.words.map((word, index) => (
                            <span
                                key={index}
                                onClick={() => handleWordClick(word)}
                                className={`cursor-pointer p-1 rounded transition-colors duration-200 inline-block mr-1 ${selectedWords.includes(word) ? 'bg-yellow-500 text-black' : 'hover:bg-white/20'
                                    } ${feedback === 'correct' && currentQuestion.answers.includes(word.trim()) ? 'bg-green-500 !text-black' : ''
                                    } ${feedback === 'incorrect' && selectedWords.includes(word) && !currentQuestion.answers.includes(word.trim()) ? 'bg-red-500 !text-black line-through' : ''
                                    } ${feedback !== null && currentQuestion.answers.includes(word.trim()) ? 'border-b-2 border-green-400' : '' }`}
                            >
                                {word}
                            </span>
                        ))}
                    </p>
                </div>

                <div className="h-36 flex items-center justify-center">
                    {feedback === null ? (
                        <Button
                            onClick={checkAnswer}
                            variant="threedee"
                            color="primary"
                            disabled={selectedWords.length === 0}
                        >
                            정답 확인
                        </Button>
                    ) : (
                        <div className="text-center w-full">
                            <p className={`text-xl font-bold mb-2 ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                                {feedback === 'correct' ? '정답입니다!' : '오답입니다.'}
                            </p>
                            
                            {currentQuestion.explain && (
                                <div className="bg-black/20 p-3 rounded-lg text-left mb-4 max-w-md mx-auto">
                                    <h4 className="font-bold text-sm text-yellow-300 flex items-center mb-1">
                                        <Lightbulb size={14} className="mr-1.5" />
                                        해설
                                    </h4>
                                    <p className="text-sm text-gray-200">{currentQuestion.explain}</p>
                                </div>
                            )}
                            
                            <Button onClick={nextQuestion} variant="threedee" color="secondary">
                                {currentQuestionIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrammarQuiz;

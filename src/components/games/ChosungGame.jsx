import React, { useState, useEffect, useRef } from 'react';
import Button from '../Button';
import { ArrowLeft, Star } from 'lucide-react';

const ChosungGame = ({ onGameEnd, onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [feedback, setFeedback] = useState('');
    const [showHint, setShowHint] = useState(false);
    const inputRef = useRef(null);

    const renderDifficulty = (level) => {
        const totalStars = 3; // Max 3 stars
        let filledStars = Math.min(level, totalStars);
        return (
            <div className="flex">
                {[...Array(totalStars)].map((_, i) => (
                    <Star key={i} size={14} className={i < filledStars ? 'text-yellow-400 fill-current' : 'text-gray-600'} />
                ))}
            </div>
        );
    }; // Added inputRef

    useEffect(() => {
        // Fetch questions from the JSON file
        fetch('/words/korean_chosung_easy.json')
            .then(res => res.json())
            .then(data => setQuestions(data.sort(() => 0.5 - Math.random()).slice(0, 10))); // Shuffle and take 10
    }, []);

    useEffect(() => {
        if (questions.length === 0 || feedback.startsWith('정답') || feedback.startsWith('시간 초과')) {
            return;
        }

        // Timer logic
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    handleNextQuestion(false); // Move to next question if time runs out
                    return 15;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestionIndex, questions, feedback]);

    // Added useEffect for auto-focus
    // Added useEffect for auto-focus and maintain focus on hint
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentQuestionIndex, questions, showHint]); // Added showHint to dependencies
    
    const handleNextQuestion = (isCorrect) => {
        if (isCorrect) {
            const newScore = score + 10 + timeLeft;
            setScore(newScore);
            setFeedback(`정답! 🎉 (+${10 + timeLeft}점)`);
        } else {
            setFeedback(`시간 초과! 정답: ${questions[currentQuestionIndex].answer}`);
        }

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setUserInput('');
                setTimeLeft(15);
                setFeedback('');
                setShowHint(false); // Reset showHint for new question
            } else {
                const finalScore = isCorrect ? score + 10 + timeLeft : score;
                onGameEnd(finalScore); // End game
            }
        }, 1500);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userInput.trim() === questions[currentQuestionIndex].answer) {
            handleNextQuestion(true);
        } else {
            setFeedback('오답입니다. 다시 시도해보세요!');
            setUserInput('');
        }
    };

    if (questions.length === 0) {
        return <div className="text-center text-xl">퀴즈를 불러오는 중...</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="text-center w-full max-w-2xl mx-auto flex flex-col h-screen">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-4">
                <div className="w-1/4 text-left">
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
                    <h2 className="text-2xl font-bold text-white">초성 퀴즈</h2>
                </div>
                <div className="w-1/4 text-right">
                    <p className="text-xl text-primary-light font-semibold">점수: {score}</p>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-grow overflow-y-auto pb-4"> 
                <div className="bg-black/10 p-2 rounded-lg mb-4 flex justify-around text-xs sm:text-sm text-gray-300">
                    <span className="flex items-center"><Star size={14} className="mr-1.5 text-yellow-400"/>난이도: {renderDifficulty(currentQuestion.level)}</span>
                    <span className="flex items-center">남은 시간: {timeLeft}초</span>
                    <span className="flex items-center">진행: {currentQuestionIndex + 1}/{questions.length}</span>
                </div>
                
                <div className="glass-card p-8 rounded-lg mb-6 max-w-md mx-auto">
                    <p className="text-2xl font-semibold text-gray-300 mb-2">카테고리: {currentQuestion.category}</p>
                    <p className="text-5xl font-bold tracking-[.2em] mb-4">{currentQuestion.chosung}</p>
                    
                    {!showHint && (
                        <Button onClick={() => setShowHint(true)} variant="flat" color="gray" className="mt-2 text-sm px-4 py-2">
                            힌트 보기 💡
                        </Button>
                    )}
                    {showHint && (
                        <p className="text-lg text-primary-light mt-2">힌트: {currentQuestion.hint}</p>
                    )}
                </div>
            </div>

            {/* Input and Feedback Area (fixed at bottom of flex container) */}
            <div className="p-4 bg-gray-900/80 sticky bottom-0 z-10"> {/* Added sticky footer for input/feedback */}
                <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="text-2xl text-center bg-transparent border-2 border-white/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-light w-4/5" // Changed flex-grow to w-4/5
                        ref={inputRef}
                        disabled={feedback.startsWith('정답') || feedback.startsWith('시간 초과')}
                    />
                    <Button 
                        type="submit" 
                        variant="threedee" 
                        color="primary"
                        className="flex-shrink-0"
                        disabled={feedback.startsWith('정답') || feedback.startsWith('시간 초과')}
                    >
                        제출
                    </Button>
                </form>
                
                {feedback && <p className={`mt-4 text-xl font-bold ${feedback.includes('정답') ? 'text-green-400' : 'text-red-400'}`}>{feedback}</p>}
            </div>
        </div>
    );
};

export default ChosungGame;

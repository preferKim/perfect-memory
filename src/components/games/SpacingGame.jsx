import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Button from '../Button';

const SpacingGame = ({ onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', or null
    const [gameOver, setGameOver] = useState(false);
    const [spacings, setSpacings] = useState([]);

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

    const startNewGame = () => {
        const shuffled = questions.sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setCurrentQuestionIndex(0);
        setScore(0);
        setFeedback(null);
        setGameOver(false);
        if (shuffled.length > 0) {
            setSpacings(new Array(shuffled[0].question.length - 1).fill(false));
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

        if (userAnswer === correctAnswer) {
            setScore(prev => prev + 1);
            setFeedback('correct');
        } else {
            setFeedback('wrong');
        }

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                const nextIndex = currentQuestionIndex + 1;
                setCurrentQuestionIndex(nextIndex);
                setSpacings(new Array(questions[nextIndex].question.length - 1).fill(false));
                setFeedback(null);
            } else {
                setGameOver(true);
            }
        }, 2000);
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
    
    const renderFeedback = () => {
        if (!feedback) return null;
        
        const currentQuestion = questions[currentQuestionIndex];
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

    const renderInteractiveQuestion = () => {
        const question = questions[currentQuestionIndex].question;
        const chars = question.split('');

        return (
            <div className="flex flex-wrap items-center justify-center cursor-pointer">
                {chars.map((char, index) => (
                    <React.Fragment key={index}>
                        <span className="text-2xl sm:text-3xl text-white font-medium">{char}</span>
                        {spacings[index] && <span className="text-2xl sm:text-3xl text-white font-medium px-1"> </span>}
                        {index < chars.length - 1 && (
                            <div 
                                className="w-2 -ml-2 h-12" // Negative margin to overlap and not create space
                                onClick={() => toggleSpace(index)}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

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
                        <p className="text-white/90 text-xl mb-4 font-semibold">글자사이를 클릭해서 띄어쓰기</p>
                        <div className="bg-black/20 p-8 rounded-2xl mb-8 min-h-[120px] flex items-center justify-center relative border-2 border-white/10">
                            {renderInteractiveQuestion()}
                            {renderFeedback()}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
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

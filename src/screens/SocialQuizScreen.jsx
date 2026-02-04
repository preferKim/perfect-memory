import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X, BookOpen } from 'lucide-react';
import Button from '../components/Button';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../hooks/useAuth';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useLearningContent } from '../hooks/useLearningContent';

const SocialQuizScreen = () => {
    const navigate = useNavigate();
    const { difficulty } = useParams();
    const { addXp } = usePlayer();
    const { user } = useAuth();
    const { recordAnswer } = useLearningProgress(user?.id);
    const { getQuestions } = useLearningContent();

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null); // Store the selected option text
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const explanationRef = useRef(null);

    const difficultyMap = {
        easy: '초등',
        medium: '중등',
        hard: '고등',
    };
    const quizTitle = `사회 퀴즈 (${difficultyMap[difficulty] || '알 수 없음'})`;

    useEffect(() => {
        if (isAnswered && explanationRef.current) {
            explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isAnswered]);

    const xpAddedRef = useRef(false);
    useEffect(() => {
        if (gameFinished && user && score > 0 && !xpAddedRef.current) {
            xpAddedRef.current = true;
            addXp(score * 5);
        }
    }, [gameFinished, user, score]);

    const loadQuestions = async () => {
        setIsLoading(true);

        try {
            // Supabase에서 데이터 가져오기 시도 (_wordId 포함)
            const courseCode = `social_${difficulty}`;
            let questionsData = await getQuestions(courseCode, { limit: 20, shuffle: true });

            // Supabase에 데이터가 없으면 JSON fallback
            if (!questionsData || questionsData.length === 0) {
                console.log('Supabase에 데이터 없음, JSON fallback 사용');

                const res = await fetch(`/words/social_${difficulty}.json`);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

                const data = await res.json();
                questionsData = data.questions || [];
            }

            if (questionsData.length === 0) {
                console.warn(`No questions found for difficulty ${difficulty}.`);
            }

            const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
            setQuestions(shuffled.slice(0, 10));
        } catch (error) {
            console.error(`Failed to load social studies problems for difficulty ${difficulty}:`, error);
            setQuestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadQuestions();
    }, [difficulty]);

    const handleAnswerSelect = async (option) => {
        if (isAnswered) return;

        setSelectedAnswer(option.text);
        setIsAnswered(true);

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = option.isCorrect;

        if (isCorrect) {
            setScore(score + 1);
        } else {
            setWrongAnswers(wrongAnswers + 1);
        }

        // DB에 답안 기록 (오답 시 약점 문제로 저장)
        if (user?.id && currentQuestion._wordId) {
            try {
                await recordAnswer(currentQuestion._wordId, isCorrect, option.text);
            } catch (err) {
                console.error('Failed to record answer:', err);
            }
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setGameFinished(true);
        }
    };

    const restartGame = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
        setWrongAnswers(0);
        setGameFinished(false);
        loadQuestions();
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen text-white">문제를 불러오는 중...</div>;
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 p-4 text-center">
                <div className="glass-card p-8 rounded-2xl w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-white">준비중입니다.</h2>
                    <p className="text-xl text-gray-300 mb-6">선택하신 난이도에 해당하는 문제가 없습니다.</p>
                    <Button onClick={() => navigate(-1)} color="secondary">
                        돌아가기
                    </Button>
                </div>
            </div>
        );
    }

    if (gameFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 p-4 text-center">
                <div className="glass-card p-8 rounded-2xl w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-white">퀴즈 완료!</h2>
                    <p className="text-xl text-gray-200 mb-6">
                        총 {questions.length}문제 중 <span className="font-bold text-green-400">{score}</span>개를 맞혔습니다! (오답: {wrongAnswers})
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => navigate('/social')} color="gray" className="flex-1">
                            난이도 선택
                        </Button>
                        <Button onClick={restartGame} color="secondary" className="flex-1">
                            다시 풀기
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    const correctAnswer = currentQuestion.answerOptions.find(o => o.isCorrect)?.text;

    const getButtonClass = (option) => {
        if (!isAnswered) {
            return "bg-white/5 hover:bg-white/10 border-white/10";
        }
        if (option.isCorrect) {
            return "bg-green-500/50 border-green-500";
        }
        if (option.text === selectedAnswer && !option.isCorrect) {
            return "bg-red-500/50 border-red-500";
        }
        return "bg-white/5 border-white/10 opacity-60";
    };

    const getIcon = (option) => {
        if (!isAnswered) return null;
        if (option.isCorrect) return <Check className="text-green-300" />;
        if (option.text === selectedAnswer && !option.isCorrect) return <X className="text-red-300" />;
        return null;
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-3xl">
                {/* Header */}
                <div className="relative flex items-center justify-between mb-4 self-stretch">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} className="text-gray-300" />
                    </button>
                    <div className="text-lg font-bold text-white flex items-center gap-4">
                        <span>{quizTitle}</span>
                        <div className="flex items-center gap-3 text-sm bg-black/20 px-3 py-1 rounded-lg">
                            <span className="text-green-400 font-bold">O: {score}</span>
                            <span className="text-red-400 font-bold">X: {wrongAnswers}</span>
                        </div>
                    </div>
                    <div className="w-8"></div> {/* Spacer */}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2.5 mb-6">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>

                {/* Question Card */}
                <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-lg mb-6">
                    <p className="text-sm text-gray-300 mb-2">문제 {currentQuestionIndex + 1}/{questions.length}</p>
                    <p className="text-xl sm:text-2xl font-medium text-white leading-relaxed whitespace-pre-line">
                        {currentQuestion.question}
                    </p>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {currentQuestion.answerOptions.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={isAnswered}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${getButtonClass(option)}`}
                        >
                            <span className="font-medium text-white">{option.text}</span>
                            {getIcon(option)}
                        </button>
                    ))}
                </div>

                {/* Explanation & Next Button */}
                {isAnswered && (
                    <div ref={explanationRef} className="glass-card p-6 rounded-2xl shadow-lg animate-fade-in">
                        <h3 className="font-bold text-lg mb-2 flex items-center">
                            {selectedAnswer === correctAnswer ?
                                <span className="text-green-400">정답입니다!</span> :
                                <span className="text-red-400">오답입니다.</span>
                            }
                        </h3>
                        {currentQuestion.hint && (
                            <div className="text-gray-200 mb-4 text-left">
                                <h4 className="text-md font-semibold text-white mb-2 flex items-center">
                                    <BookOpen size={18} className="mr-2 text-yellow-400" /> 해설
                                </h4>
                                <p className="text-gray-300 leading-relaxed">{currentQuestion.hint}</p>
                            </div>
                        )}
                        <Button
                            onClick={handleNextQuestion}
                            color="secondary"
                            className="w-full"
                        >
                            {currentQuestionIndex < questions.length - 1 ? "다음 문제" : "결과 보기"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialQuizScreen;
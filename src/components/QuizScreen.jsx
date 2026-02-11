import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, Star, BookOpen } from 'lucide-react';
import MathRenderer from './MathRenderer';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../hooks/useAuth';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useLearningContent } from '../hooks/useLearningContent';

/**
 * 공통 퀴즈 화면 컴포넌트
 *
 * @param {object} config - 퀴즈 설정 객체
 * @param {string} config.subject - XP 카테고리 & 과목 식별자 (예: 'math', 'science')
 * @param {string} config.title - 화면 상단 제목
 * @param {string} config.courseCode - Supabase 쿼리용 코드
 * @param {string|number} config.backPath - 뒤로가기 경로 (예: '/math' 또는 -1)
 * @param {function} [config.loadQuestions] - 커스텀 문제 로딩 함수 (getQuestions를 인자로 받음)
 * @param {number} [config.questionsPerRound=10] - 회차당 문제 수
 * @param {number} [config.timerSeconds=1800] - 타이머 초 (0이면 비활성화)
 * @param {number} [config.scoreMultiplier=10] - 점수 배율
 * @param {number} [config.optionColumns=2] - 선택지 열 수 (1 or 2)
 * @param {boolean} [config.showPassFail=false] - 합격/불합격 표시
 * @param {number} [config.passThreshold=0.6] - 합격 기준 비율
 */
const QuizScreen = ({ config }) => {
    const navigate = useNavigate();
    const { addXp } = usePlayer();
    const { user } = useAuth();
    const { recordAnswer, startSession, endSession, toggleFavorite, isFavorite } = useLearningProgress(user?.id);
    const { getQuestions } = useLearningContent();

    // Config defaults
    const {
        subject,
        title,
        courseCode,
        backPath = -1,
        loadQuestions: customLoadQuestions,
        questionsPerRound = 10,
        timerSeconds = 1800,
        scoreMultiplier = 10,
        optionColumns = 2,
        showPassFail = false,
        passThreshold = 0.6,
    } = config;

    // State
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(timerSeconds);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const explanationRef = useRef(null);
    const sessionRef = useRef(null);

    const hasTimer = timerSeconds > 0;

    // Navigate back helper
    const goBack = useCallback(() => {
        if (typeof backPath === 'number') {
            navigate(backPath);
        } else {
            navigate(backPath);
        }
    }, [navigate, backPath]);

    // Auto-scroll to explanation
    useEffect(() => {
        if (isAnswered && explanationRef.current) {
            explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isAnswered]);

    // Timer logic
    useEffect(() => {
        if (!hasTimer) return;
        let interval;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isTimerRunning) {
            finishGame();
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft, hasTimer]);

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Default question loader
    const defaultLoadQuestions = async () => {
        return await getQuestions(courseCode, { limit: questionsPerRound, shuffle: true });
    };

    // Load questions
    const loadQuestions = useCallback(async () => {
        setIsLoading(true);
        try {
            const loader = customLoadQuestions || defaultLoadQuestions;
            let questionsData = await loader(getQuestions);

            if (!questionsData || questionsData.length === 0) {
                console.warn(`No questions found for courseCode: ${courseCode}`);
                setQuestions([]);
                return;
            }

            // Normalize: ensure all questions have consistent format
            const normalized = questionsData.map(q => ({
                id: q.id || q._wordId,
                _wordId: q._wordId || q.id,
                problem: q.problem || q.question,
                options: q.options || (q.answerOptions ? q.answerOptions.map(o => o.text) : []),
                answer: q.answer || (q.answerOptions ? q.answerOptions.find(o => o.isCorrect)?.text : ''),
                hint: q.hint,
                explanation: q.explanation || q.hint,
                level: q.level || q._level,
            }));

            setQuestions(normalized);

            // Start timer
            if (hasTimer) {
                setTimeLeft(timerSeconds);
                setIsTimerRunning(true);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            setQuestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [courseCode, customLoadQuestions, getQuestions, questionsPerRound, hasTimer, timerSeconds]);

    // Init session when questions are loaded
    useEffect(() => {
        const initSession = async () => {
            if (user?.id && questions.length > 0 && !sessionRef.current && !gameFinished) {
                sessionRef.current = await startSession(courseCode, 'quiz');
            }
        };
        initSession();
    }, [user?.id, questions.length, courseCode, gameFinished, startSession]);

    // Load questions on mount / config change
    useEffect(() => {
        loadQuestions();
        return () => {
            setIsTimerRunning(false);
        };
    }, [courseCode]);

    // Handle answer selection
    const handleAnswerSelect = async (option) => {
        if (isAnswered || gameFinished) return;

        setSelectedAnswer(option);
        setIsAnswered(true);

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = option === currentQuestion.answer;

        if (isCorrect) {
            setScore(prev => prev + 1);
            addXp(subject, 1);
        } else {
            setWrongAnswers(prev => prev + 1);
        }

        // Record to DB
        if (user?.id && currentQuestion._wordId) {
            try {
                await recordAnswer(currentQuestion._wordId, isCorrect, option);
            } catch (error) {
                console.error('Failed to record answer:', error);
            }
        }
    };

    // Handle next question
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setShowHint(false);
        } else {
            finishGame();
        }
    };

    // Finish game
    const finishGame = () => {
        setGameFinished(true);
        setIsTimerRunning(false);
        if (user?.id && sessionRef.current) {
            endSession({
                totalQuestions: questions.length,
                correctCount: score,
                wrongCount: wrongAnswers,
                score: score * scoreMultiplier,
            });
            sessionRef.current = null;
        }
    };

    // Restart game
    const restartGame = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
        setWrongAnswers(0);
        setGameFinished(false);
        setShowHint(false);
        sessionRef.current = null;
        loadQuestions();
    };

    // Button styles
    const getButtonClass = (option) => {
        if (!isAnswered) return 'bg-white/5 hover:bg-white/10 border-white/10';
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = option === currentQuestion.answer;
        if (isCorrect) return 'bg-green-500/50 border-green-500';
        if (option === selectedAnswer && !isCorrect) return 'bg-red-500/50 border-red-500';
        return 'bg-white/5 border-white/10 opacity-60';
    };

    // Icons
    const getIcon = (option) => {
        if (!isAnswered) return null;
        const currentQuestion = questions[currentQuestionIndex];
        if (option === currentQuestion.answer) return <Check className="text-green-500" />;
        if (option === selectedAnswer && option !== currentQuestion.answer) return <X className="text-red-500" />;
        return null;
    };

    // ──── Render states ────

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-white">문제를 불러오는 중...</div>;
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <div className="glass-card p-8 rounded-2xl w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-white">준비중입니다.</h2>
                    <p className="text-xl text-gray-300 mb-6">선택하신 항목에 해당하는 문제가 없습니다.</p>
                    <button onClick={goBack} className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-lg transition-colors">
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (gameFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        const passed = score / questions.length >= passThreshold;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {showPassFail ? '시험 종료!' : '퀴즈 완료!'}
                    </h2>
                    <div className="text-6xl font-bold text-primary mb-2">{percentage}점</div>
                    <p className="text-gray-300 mb-6">
                        총 {questions.length}문제 중 <span className="font-bold text-green-400">{score}</span>문제 정답
                        <br />({wrongAnswers}문제 오답)
                    </p>
                    {showPassFail && (
                        passed ? (
                            <div className="bg-green-500/20 text-green-400 p-3 rounded-lg font-bold mb-6">합격입니다! 🎉</div>
                        ) : (
                            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg font-bold mb-6">불합격입니다. 힘내세요! 💪</div>
                        )
                    )}
                    <div className="flex gap-4">
                        <button
                            onClick={goBack}
                            className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            목록으로
                        </button>
                        <button
                            onClick={restartGame}
                            className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            다시 풀기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ──── Main quiz UI ────
    const currentQuestion = questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    const gridClass = optionColumns === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2';

    return (
        <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center min-h-screen w-full max-w-3xl mx-auto">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-4">
                <button onClick={goBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} className="text-gray-300" />
                </button>
                <div className="text-lg font-bold text-white flex items-center gap-4">
                    <span>{title}</span>
                    {hasTimer ? (
                        <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-primary-light'}`}>
                            <Clock size={20} />
                            {formatTime(timeLeft)}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-sm bg-black/20 px-3 py-1 rounded-lg">
                            <span className="text-green-400 font-bold">O: {score}</span>
                            <span className="text-red-400 font-bold">X: {wrongAnswers}</span>
                        </div>
                    )}
                </div>
                <div className="text-sm text-gray-400">
                    {currentQuestionIndex + 1} / {questions.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2.5 mb-6">
                <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${progressPercentage}%` }}></div>
            </div>

            {/* Question Card */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-lg mb-4 w-full relative">
                {/* Favorite button */}
                {user?.id && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (currentQuestion._wordId) {
                                toggleFavorite(currentQuestion._wordId);
                            }
                        }}
                        className="absolute top-4 right-4 p-2 hover:scale-110 transition active:scale-95"
                    >
                        <Star
                            size={24}
                            className={isFavorite(currentQuestion._wordId)
                                ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                                : 'text-gray-400 hover:text-yellow-400 transition-colors'}
                        />
                    </button>
                )}

                {/* Level badge */}
                {currentQuestion.level && (
                    <span className="inline-block px-2 py-1 rounded bg-white/10 text-xs text-gray-300 mb-2">
                        {currentQuestion.level}
                    </span>
                )}

                <p className="text-sm text-gray-300 mb-2">문제 {currentQuestionIndex + 1}/{questions.length}</p>

                {/* Problem text */}
                <div className="mb-2">
                    <p className="text-xl sm:text-2xl font-medium text-white leading-relaxed pr-8">
                        <MathRenderer text={currentQuestion.problem} />
                    </p>
                </div>

                {/* Hint toggle (before answer) */}
                {!showHint && !isAnswered && currentQuestion.hint && (
                    <button
                        onClick={() => setShowHint(true)}
                        className="mb-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                        힌트보기
                    </button>
                )}
                {showHint && !isAnswered && currentQuestion.hint && (
                    <p className="text-white text-sm italic mb-4 flex items-center underline">
                        <MathRenderer text={currentQuestion.hint} />
                    </p>
                )}
            </div>

            {/* Options */}
            <div className={`grid ${gridClass} gap-3 w-full mb-6`}>
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={isAnswered}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${getButtonClass(option)}`}
                    >
                        <span className="font-medium text-white">
                            <MathRenderer text={option} />
                        </span>
                        {getIcon(option)}
                    </button>
                ))}
            </div>

            {/* Explanation & Next Button */}
            {isAnswered && (
                <div ref={explanationRef} className="glass-card p-6 rounded-2xl shadow-lg w-full animate-fade-in mb-24">
                    <h3 className="font-bold text-lg mb-2 text-white">
                        {selectedAnswer === currentQuestion.answer ? '정답입니다!' : '오답입니다.'}
                    </h3>
                    {currentQuestion.explanation && (
                        <div className="text-gray-200 mb-4 text-left">
                            <h4 className="text-md font-semibold text-white mb-2 flex items-center">
                                <BookOpen size={18} className="mr-2 text-yellow-400" /> 해설
                            </h4>
                            <p className="text-gray-300 leading-relaxed">
                                <MathRenderer text={currentQuestion.explanation} />
                            </p>
                        </div>
                    )}
                    <button
                        onClick={handleNextQuestion}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        {currentQuestionIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizScreen;

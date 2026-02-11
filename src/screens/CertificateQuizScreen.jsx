import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, X, Clock, Star } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../hooks/useAuth';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { supabase } from '../supabaseClient';

const CertificateQuizScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addXp } = usePlayer();
    const { user } = useAuth();
    const { recordAnswer, startSession, endSession, toggleFavorite, isFavorite } = useLearningProgress(user?.id);
    const { subjectId } = location.state || { subjectId: 1 };

    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const explanationRef = useRef(null);
    const sessionRef = useRef(null);

    // Auto-scroll to explanation
    useEffect(() => {
        if (isAnswered && explanationRef.current) {
            explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isAnswered]);

    // Timer logic
    useEffect(() => {
        let interval;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setGameFinished(true);
            setIsTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft]);

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Load Data
    const loadQuestions = async () => {
        setIsLoading(true);
        try {
            let finalQuestions = [];

            // AWS Subjects (Local JSON)
            if (typeof subjectId === 'string' && subjectId.startsWith('AWS_')) {
                setTimeLeft(60 * 60); // 1 hour for AWS exams

                try {
                    const response = await fetch(`/words/certificate_${subjectId}.json`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${subjectId}`);
                    }
                    const data = await response.json();

                    // Shuffle and take 20
                    const shuffled = [...(data || [])].sort(() => 0.5 - Math.random());
                    finalQuestions = shuffled.slice(0, 20);

                    // Transform for current component state
                    // Local JSON structure is flat, unlike Supabase 'content' field
                    setQuestions(finalQuestions.map(q => ({
                        ...q,
                        id: q.id || Math.random().toString(36).substr(2, 9) // Ensure ID exists
                    })));

                    // Start Session (Virtual)
                    setIsTimerRunning(true);
                    setIsLoading(false);
                    return; // Exit early for AWS

                } catch (e) {
                    console.error("Failed to load AWS questions:", e);
                    // Fallback or error handling
                }
            }

            // Original Logic for Info Proc Engineer
            else if (subjectId === 'all') {
                setTimeLeft(150 * 60); // 2.5 hours for full exam

                // Select 20 random questions from each level (1-5)
                const levels = [1, 2, 3, 4, 5];
                for (const level of levels) {
                    const courseCode = `certificate_EIP_${level}`;

                    // Fetch all questions for this level
                    const { data: levelQuestions, error } = await supabase
                        .from('words')
                        .select('*')
                        .eq('course_code', courseCode)
                        .eq('is_active', true);

                    if (error) {
                        console.error(`Error fetching level ${level}:`, error);
                        continue;
                    }

                    // Shuffle and take 20
                    const shuffled = [...(levelQuestions || [])].sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, 20);
                    finalQuestions = [...finalQuestions, ...selected];
                }
            } else {
                const courseCode = `certificate_EIP_${subjectId}`;
                setTimeLeft(30 * 60); // 30 minutes for single subject

                // Fetch questions for single subject
                const { data: subjectQuestions, error } = await supabase
                    .from('words')
                    .select('*')
                    .eq('course_code', courseCode)
                    .eq('is_active', true);

                if (error) {
                    console.error('Error fetching questions:', error);
                    throw error;
                }

                // Shuffle and take 20
                const shuffled = [...(subjectQuestions || [])].sort(() => 0.5 - Math.random());
                finalQuestions = shuffled.slice(0, 20);
            }

            if (finalQuestions.length === 0) {
                console.warn('No questions found for subject:', subjectId);
            }

            // Transform questions to match expected format (Supabase)
            const transformedQuestions = finalQuestions.map(q => ({
                id: q.id, // Supabase ID for recordAnswer
                level: q.level,
                problem: q.content.problem,
                options: q.content.options,
                answer: q.content.answer,
                hint: q.content.hint,
                explanation: q.content.explanation,
                // Add _wordId for consistancy with other screens if needed, or use id
                _wordId: q.id
            }));

            setQuestions(transformedQuestions);

            // Start Session
            if (user?.id) {
                const courseCode = subjectId === 'all' ? 'certificate_EIP_all' : `certificate_EIP_${subjectId}`;
                sessionRef.current = await startSession(courseCode, 'quiz');
            }
            setIsTimerRunning(true);

        } catch (error) {
            console.error("Error loading questions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadQuestions();
        return () => {
            // Cleanup session if needed (though endSession logic handles finishing)
            setIsTimerRunning(false);
        };
    }, [subjectId]);

    // Handle Answer
    const handleAnswerSelect = async (option) => {
        if (isAnswered || gameFinished) return;

        setSelectedAnswer(option);
        setIsAnswered(true);

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = option === currentQuestion.answer;

        if (isCorrect) {
            setScore(score + 1);
            addXp('certificate', 1);
        } else {
            setWrongAnswers(wrongAnswers + 1);
        }

        // Record to DB
        if (user?.id && currentQuestion.id) {
            try {
                await recordAnswer(
                    currentQuestion.id,
                    isCorrect,
                    option,
                    null // timeSpentMs (optional)
                );
            } catch (error) {
                console.error('Failed to record answer:', error);
            }
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            finishGame();
        }
    };

    const finishGame = () => {
        setGameFinished(true);
        setIsTimerRunning(false);
        if (user?.id && sessionRef.current) {
            endSession({
                totalQuestions: questions.length,
                correctCount: score,
                wrongCount: wrongAnswers,
                score: score * 5
            });
            // XP already awarded per correct answer
        }
    };

    // Styles
    const getButtonClass = (option) => {
        if (!isAnswered) return "bg-white/5 hover:bg-white/10 border-white/10";
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = option === currentQuestion.answer;

        if (isCorrect) return "bg-green-500/50 border-green-500";
        if (option === selectedAnswer && !isCorrect) return "bg-red-500/50 border-red-500";
        return "bg-white/5 border-white/10 opacity-60";
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

    if (questions.length === 0) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white">
            <h2 className="text-2xl font-bold mb-4">문제가 없습니다.</h2>
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-700 rounded-lg">돌아가기</button>
        </div>
    );

    if (gameFinished) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">시험 종료!</h2>
                    <div className="text-6xl font-bold text-primary mb-2">{Math.round((score / questions.length) * 100)}점</div>
                    <p className="text-gray-300 mb-6">
                        총 {questions.length}문제 중 {score}문제 정답<br />
                        ({wrongAnswers}문제 오답)
                    </p>
                    {score / questions.length >= 0.6 ? (
                        <div className="bg-green-500/20 text-green-400 p-3 rounded-lg font-bold mb-6">합격입니다! 🎉</div>
                    ) : (
                        <div className="bg-red-500/20 text-red-400 p-3 rounded-lg font-bold mb-6">불합격입니다. 힘내세요! 💪</div>
                    )}
                    <button
                        onClick={() => navigate('/certificate')}
                        className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center min-h-screen w-full max-w-3xl mx-auto">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 text-gray-300">
                    <ArrowLeft size={24} />
                </button>
                <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-primary-light'}`}>
                    <Clock size={20} />
                    {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-400">
                    {currentQuestionIndex + 1} / {questions.length}
                </div>
            </div>

            {/* Question Card */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-lg mb-6 w-full relative">
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
                            className={isFavorite(currentQuestion._wordId) ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-gray-600 hover:text-gray-400"}
                        />
                    </button>
                )}
                <div className="mb-2">
                    <span className="inline-block px-2 py-1 rounded bg-white/10 text-xs text-gray-300 mb-2">
                        {subjectId === 'all' ? `${currentQuestion.level}과목` : `${subjectId}과목`}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed pr-8">
                        {currentQuestion.problem}
                    </h2>
                </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3 w-full mb-6">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={isAnswered}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${getButtonClass(option)}`}
                    >
                        <span className="font-medium text-white">{option}</span>
                        {isAnswered && option === currentQuestion.answer && <Check className="text-green-500" />}
                        {isAnswered && option === selectedAnswer && option !== currentQuestion.answer && <X className="text-red-500" />}
                    </button>
                ))}
            </div>

            {/* Explanation */}
            {isAnswered && (
                <div ref={explanationRef} className="glass-card p-6 rounded-2xl shadow-lg w-full animate-fade-in mb-24">
                    <h3 className="font-bold text-lg mb-2 text-white">
                        {selectedAnswer === currentQuestion.answer ? "정답입니다!" : "오답입니다."}
                    </h3>
                    <div className="text-gray-300 mb-4 bg-black/20 p-4 rounded-lg">
                        <strong className="block text-primary-light mb-1">해설</strong>
                        {currentQuestion.explanation}
                    </div>
                    <button
                        onClick={handleNextQuestion}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        {currentQuestionIndex < questions.length - 1 ? "다음 문제" : "결과 보기"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CertificateQuizScreen;

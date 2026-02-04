import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Volume2, BookOpen, Brain } from 'lucide-react';
import Button from '../components/Button';
import MathRenderer from '../components/MathRenderer';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../hooks/useAuth';
import { useLearningProgress } from '../hooks/useLearningProgress';

/**
 * 통합 오답노트 학습 화면
 * - 모든 과목을 4지선다 형식으로 통합
 * - 과목별 데이터 정규화
 */
const WrongAnswerScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addXp } = usePlayer();
    const { user } = useAuth();
    const { recordAnswer, removeWeakWord } = useLearningProgress(user?.id);

    const { customWords = [], subject = 'mixed' } = location.state || {};

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const [gameFinished, setGameFinished] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const explanationRef = useRef(null);

    // TTS for English
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    // 데이터 정규화 함수
    const normalizeQuestion = (word, allWords) => {
        const courseCode = word._courseCode || '';

        // 영어
        if (courseCode.startsWith('english') || word.english) {
            const correctAnswer = word.korean;
            const otherWords = allWords
                .filter(w => w.korean && w.korean !== correctAnswer)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(w => w.korean);

            return {
                type: 'english',
                questionText: word.english,
                pronunciation: word.pronunciation,
                options: [...otherWords, correctAnswer].sort(() => Math.random() - 0.5),
                correctAnswer,
                explanation: word.pronunciation ? `발음: ${word.pronunciation}` : null,
                speakable: word.english,
                wordId: word._wordId || word.wordId
            };
        }

        // 수학
        if (courseCode.startsWith('math') || word.problem) {
            return {
                type: 'math',
                questionText: word.problem,
                options: word.options || [],
                correctAnswer: word.answer,
                explanation: word.explanation,
                hint: word.hint,
                wordId: word._wordId || word.wordId
            };
        }

        // 과학/사회 (answerOptions 형식)
        if (word.answerOptions) {
            const correctOption = word.answerOptions.find(opt => opt.isCorrect);
            return {
                type: 'quiz',
                questionText: word.question,
                options: word.answerOptions.map(opt => opt.text),
                correctAnswer: correctOption?.text || '',
                explanation: word.hint || word.rationale,
                wordId: word._wordId || word.wordId
            };
        }

        // 국어 맞춤법/띄어쓰기
        if (word.question && word.options) {
            return {
                type: 'korean',
                questionText: word.question,
                options: word.options,
                correctAnswer: word.answer,
                explanation: word.explanation || word.tip,
                wordId: word._wordId || word.wordId
            };
        }

        // 초성퀴즈
        if (word.chosung) {
            const correctAnswer = word.answer;
            const otherWords = allWords
                .filter(w => w.answer && w.answer !== correctAnswer)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(w => w.answer);

            return {
                type: 'chosung',
                questionText: `초성: ${word.chosung}`,
                hint: word.hint,
                options: [...otherWords, correctAnswer].sort(() => Math.random() - 0.5),
                correctAnswer,
                explanation: `카테고리: ${word.category}`,
                wordId: word._wordId || word.wordId
            };
        }

        // 문학용어
        if (word.term && word.description) {
            const correctAnswer = word.term;
            const otherWords = allWords
                .filter(w => w.term && w.term !== correctAnswer)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(w => w.term);

            return {
                type: 'literary',
                questionText: word.description,
                options: [...otherWords, correctAnswer].sort(() => Math.random() - 0.5),
                correctAnswer,
                explanation: word.examples?.[0]?.quote ? `예: "${word.examples[0].quote}"` : null,
                wordId: word._wordId || word.wordId
            };
        }

        // 기본 폴백
        return {
            type: 'generic',
            questionText: JSON.stringify(word).slice(0, 100),
            options: ['확인'],
            correctAnswer: '확인',
            wordId: word._wordId || word.wordId
        };
    };

    // 초기화
    useEffect(() => {
        if (customWords.length > 0) {
            const normalized = customWords.map(w => normalizeQuestion(w, customWords));
            setQuestions(normalized.sort(() => Math.random() - 0.5));
        }
    }, [customWords]);

    // 설명 스크롤
    useEffect(() => {
        if (isAnswered && explanationRef.current) {
            explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isAnswered]);

    // 게임 종료 시 XP (한 번만 실행)
    const xpAddedRef = useRef(false);
    useEffect(() => {
        if (gameFinished && score > 0 && !xpAddedRef.current) {
            xpAddedRef.current = true;
            addXp(score * 5);
        }
    }, [gameFinished, score]);

    const handleAnswerSelect = async (option) => {
        if (isAnswered) return;

        setSelectedAnswer(option);
        setIsAnswered(true);

        const currentQ = questions[currentIndex];
        const isCorrect = option === currentQ.correctAnswer;

        if (isCorrect) {
            setScore(s => s + 1);
        } else {
            setWrongAnswers(w => w + 1);
        }

        // DB 기록
        if (user?.id && currentQ.wordId) {
            try {
                await recordAnswer(currentQ.wordId, isCorrect, option);
            } catch (err) {
                console.error('Failed to record answer:', err);
            }
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setShowExplanation(false);
        } else {
            setGameFinished(true);
        }
    };

    const getButtonColor = (option) => {
        if (!isAnswered) return 'primary';
        if (option === questions[currentIndex].correctAnswer) return 'success';
        if (option === selectedAnswer) return 'danger';
        return 'gray';
    };

    // 로딩/빈 상태
    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="glass-card p-8 text-center">
                    <Brain size={64} className="mx-auto mb-4 text-gray-400" />
                    <h2 className="text-2xl font-bold text-white mb-4">오답 문제가 없습니다</h2>
                    <p className="text-gray-300 mb-6">학습 중 틀린 문제가 여기에 표시됩니다.</p>
                    <Button onClick={() => navigate(-1)} variant="threedee" color="primary">
                        돌아가기
                    </Button>
                </div>
            </div>
        );
    }

    // 완료 화면
    if (gameFinished) {
        const accuracy = Math.round((score / questions.length) * 100);
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-8 text-center max-w-md w-full"
                >
                    <div className="text-6xl mb-4">
                        {accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">오답노트 학습 완료!</h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-500/20 rounded-xl p-4">
                            <div className="text-3xl font-bold text-green-400">{score}</div>
                            <div className="text-sm text-gray-300">정답</div>
                        </div>
                        <div className="bg-red-500/20 rounded-xl p-4">
                            <div className="text-3xl font-bold text-red-400">{wrongAnswers}</div>
                            <div className="text-sm text-gray-300">오답</div>
                        </div>
                    </div>
                    <p className="text-xl text-gray-200 mb-6">정답률: {accuracy}%</p>
                    <div className="flex gap-3">
                        <Button onClick={() => navigate('/dashboard')} variant="threedee" color="gray" className="flex-1">
                            대시보드
                        </Button>
                        <Button onClick={() => navigate('/')} variant="threedee" color="primary" className="flex-1">
                            홈으로
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-white/10 transition"
                    >
                        <ArrowLeft size={24} className="text-white" />
                    </button>
                    <div className="text-lg font-bold text-white flex items-center gap-4">
                        <Brain size={20} className="text-danger-light" />
                        <span>오답노트 학습</span>
                        <div className="flex items-center gap-2 text-sm bg-black/20 px-3 py-1 rounded-lg">
                            <span className="text-green-400">O: {score}</span>
                            <span className="text-red-400">X: {wrongAnswers}</span>
                        </div>
                    </div>
                    <div className="w-10" />
                </div>

                {/* Progress */}
                <div className="w-full bg-white/10 rounded-full h-2 mb-6">
                    <motion.div
                        className="bg-primary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="glass-card p-6 sm:p-8 mb-6"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm text-gray-400">
                                {currentIndex + 1} / {questions.length}
                            </span>
                            {currentQ.type === 'english' && currentQ.speakable && (
                                <button
                                    onClick={() => speak(currentQ.speakable)}
                                    className="p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition"
                                >
                                    <Volume2 size={20} className="text-primary-light" />
                                </button>
                            )}
                        </div>

                        <div className="text-center mb-6">
                            {currentQ.type === 'math' ? (
                                <div className="text-xl sm:text-2xl text-white leading-relaxed">
                                    <MathRenderer text={currentQ.questionText} />
                                </div>
                            ) : (
                                <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed whitespace-pre-line">
                                    {currentQ.questionText}
                                </p>
                            )}

                            {currentQ.pronunciation && (
                                <p className="text-primary-light mt-2 font-mono">
                                    {currentQ.pronunciation}
                                </p>
                            )}

                            {currentQ.hint && !isAnswered && (
                                <p className="text-gray-400 text-sm mt-3 italic">
                                    💡 힌트: {currentQ.hint}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {currentQ.options.map((option, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Button
                                onClick={() => handleAnswerSelect(option)}
                                disabled={isAnswered}
                                variant="threedee"
                                color={getButtonColor(option)}
                                className="w-full min-h-[60px] text-left px-4 flex items-center justify-between"
                            >
                                <span className="flex-1">
                                    {currentQ.type === 'math' ? (
                                        <MathRenderer text={option} />
                                    ) : (
                                        option
                                    )}
                                </span>
                                {isAnswered && option === currentQ.correctAnswer && (
                                    <Check size={20} className="text-green-300 ml-2" />
                                )}
                                {isAnswered && option === selectedAnswer && option !== currentQ.correctAnswer && (
                                    <X size={20} className="text-red-300 ml-2" />
                                )}
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* Explanation & Next */}
                {isAnswered && (
                    <motion.div
                        ref={explanationRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <h3 className={`text-xl font-bold mb-3 ${selectedAnswer === currentQ.correctAnswer ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {selectedAnswer === currentQ.correctAnswer ? '정답입니다! 🎉' : '오답입니다 😥'}
                        </h3>

                        {currentQ.explanation && (
                            <div className="bg-black/20 rounded-xl p-4 mb-4">
                                <div className="flex items-start gap-2">
                                    <BookOpen size={18} className="text-yellow-400 mt-1 flex-shrink-0" />
                                    <div className="text-gray-200">
                                        {currentQ.type === 'math' ? (
                                            <MathRenderer text={currentQ.explanation} />
                                        ) : (
                                            currentQ.explanation
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleNext}
                            variant="threedee"
                            color="secondary"
                            className="w-full"
                        >
                            {currentIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default WrongAnswerScreen;

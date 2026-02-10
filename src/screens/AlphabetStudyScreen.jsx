import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, ChevronLeft, ChevronRight, RotateCcw, Shuffle, BookOpen, Gamepad2, CheckCircle, XCircle } from 'lucide-react';
import Button from '../components/Button';
import FeedbackAnimation from '../components/FeedbackAnimation';

const AlphabetStudyScreen = () => {
    const navigate = useNavigate();
    const [alphabets, setAlphabets] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [filterLevel, setFilterLevel] = useState(null); // null = 전체, 1 = 기본, 2 = 이중자음
    const [studyMode, setStudyMode] = useState('flashcard'); // 'flashcard' | 'quiz'

    // Quiz state
    const [quizType, setQuizType] = useState('englishToKorean'); // 'englishToKorean' | 'koreanToEnglish'
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [quizWords, setQuizWords] = useState([]);
    const [quizIndex, setQuizIndex] = useState(0);

    const cardRef = useRef(null);

    useEffect(() => {
        const loadAlphabets = async () => {
            try {
                const response = await fetch('/words/english_mapping.json');
                const data = await response.json();
                setAlphabets(data);
            } catch (error) {
                console.error('Failed to load alphabet data:', error);
            }
        };
        loadAlphabets();
    }, []);

    const filteredAlphabets = filterLevel === null
        ? alphabets
        : alphabets.filter(a => a.level === filterLevel);

    const currentAlphabet = studyMode === 'flashcard'
        ? filteredAlphabets[currentIndex]
        : quizWords[quizIndex];

    // Initialize quiz
    useEffect(() => {
        if (studyMode === 'quiz' && filteredAlphabets.length > 0) {
            startQuiz();
        }
    }, [studyMode, filterLevel, filteredAlphabets.length]);

    const startQuiz = (type = quizType) => {
        const shuffled = [...filteredAlphabets].sort(() => Math.random() - 0.5);
        setQuizWords(shuffled);
        setQuizIndex(0);
        setScore(0);
        setWrongCount(0);
        setTotal(0);
        setFeedback(null);
        if (shuffled.length > 0) {
            generateOptions(shuffled[0], shuffled, type);
        }
    };

    const generateOptions = (current, pool, type = quizType) => {
        if (!current) return;
        const wrong = pool
            .filter(w => w.english !== current.english)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        if (type === 'englishToKorean') {
            setOptions([...wrong.map(w => w.korean), current.korean].sort(() => Math.random() - 0.5));
        } else {
            setOptions([...wrong.map(w => w.english), current.english].sort(() => Math.random() - 0.5));
        }
    };

    const speakLetter = (text, lang = 'en-US') => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.7;
        window.speechSynthesis.speak(utterance);
    };

    // Flashcard navigation
    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : filteredAlphabets.length - 1));
    };

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex(prev => (prev < filteredAlphabets.length - 1 ? prev + 1 : 0));
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleShuffle = () => {
        if (filteredAlphabets.length > 0) {
            const shuffled = [...filteredAlphabets].sort(() => Math.random() - 0.5);
            setAlphabets(prev => {
                const otherLevel = prev.filter(a => filterLevel !== null && a.level !== filterLevel);
                return filterLevel === null ? shuffled : [...shuffled, ...otherLevel];
            });
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    };

    const handleReset = async () => {
        try {
            const response = await fetch('/words/english_mapping.json');
            const data = await response.json();
            setAlphabets(data);
            setCurrentIndex(0);
            setIsFlipped(false);
        } catch (error) {
            console.error('Failed to reload alphabet data:', error);
        }
    };

    // Quiz answer check
    const checkAnswer = (selected) => {
        if (feedback) return;

        const correctAnswer = quizType === 'englishToKorean'
            ? currentAlphabet.korean
            : currentAlphabet.english;

        const isCorrect = selected === correctAnswer;

        setTotal(prev => prev + 1);
        if (isCorrect) {
            setScore(prev => prev + 1);
            setFeedback('correct');
        } else {
            setWrongCount(prev => prev + 1);
            setFeedback('wrong');
        }

        setTimeout(() => {
            setFeedback(null);
            if (quizIndex < quizWords.length - 1) {
                const nextIndex = quizIndex + 1;
                setQuizIndex(nextIndex);
                generateOptions(quizWords[nextIndex], quizWords);
            } else {
                // Quiz finished
                setFeedback('finished');
            }
        }, 1200);
    };

    // Keyboard navigation for flashcards
    useEffect(() => {
        if (studyMode !== 'flashcard') return;

        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') handlePrev();
            else if (e.key === 'ArrowRight') handleNext();
            else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleFlip();
            }
            else if (e.key === 's' && currentAlphabet) {
                speakLetter(currentAlphabet.english);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [studyMode, currentIndex, filteredAlphabets.length, currentAlphabet]);

    if (alphabets.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen text-xl font-bold text-white">
                로딩 중...
            </div>
        );
    }

    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
        <div className="glass-card p-6 sm:p-8 text-center relative min-h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/english')}
                    className="text-sm font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all flex items-center"
                >
                    <ArrowLeft size={16} className="mr-1" /> 돌아가기
                </button>
                <h1 className="text-2xl font-bold text-white">🔤 알파벳 익히기</h1>
                <div className="w-24"></div>
            </div>

            {/* Study Mode Toggle */}
            <div className="flex justify-center gap-2 mb-4">
                <button
                    onClick={() => setStudyMode('flashcard')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${studyMode === 'flashcard'
                        ? 'bg-primary text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                >
                    <BookOpen size={16} /> 카드 학습
                </button>
                <button
                    onClick={() => setStudyMode('quiz')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${studyMode === 'quiz'
                        ? 'bg-secondary text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                >
                    <Gamepad2 size={16} /> 퀴즈 모드
                </button>
            </div>

            {/* Level Filter */}
            <div className="flex justify-center gap-2 mb-6">
                <button
                    onClick={() => { setFilterLevel(null); setCurrentIndex(0); setIsFlipped(false); }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filterLevel === null
                        ? 'bg-primary text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                >
                    전체 ({alphabets.length})
                </button>
                <button
                    onClick={() => { setFilterLevel(1); setCurrentIndex(0); setIsFlipped(false); }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filterLevel === 1
                        ? 'bg-success text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                >
                    A-Z ({alphabets.filter(a => a.level === 1).length})
                </button>
                <button
                    onClick={() => { setFilterLevel(2); setCurrentIndex(0); setIsFlipped(false); }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filterLevel === 2
                        ? 'bg-secondary text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                >
                    이중자음 ({alphabets.filter(a => a.level === 2).length})
                </button>
            </div>

            {/* Flashcard Mode */}
            {studyMode === 'flashcard' && (
                <>
                    {/* Progress */}
                    <div className="mb-4">
                        <div className="text-gray-300 text-sm mb-2">
                            {currentIndex + 1} / {filteredAlphabets.length}
                        </div>
                        <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-primary to-primary-light h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / filteredAlphabets.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Card */}
                    {currentAlphabet && (
                        <div className="flex justify-center items-center mb-6">
                            <button
                                onClick={handlePrev}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition mr-4"
                                aria-label="이전"
                            >
                                <ChevronLeft size={32} className="text-white" />
                            </button>

                            <div
                                ref={cardRef}
                                onClick={handleFlip}
                                className="relative w-72 h-80 cursor-pointer"
                                style={{ perspective: '1000px' }}
                            >
                                <div
                                    className="relative w-full h-full transition-transform duration-500"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    }}
                                >
                                    {/* Front */}
                                    <div
                                        className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-3xl border-2 border-white/20 flex flex-col items-center justify-center"
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        <div className="text-8xl font-black text-white mb-4">
                                            {currentAlphabet.english}
                                        </div>
                                        <div className="text-2xl text-primary-light font-mono">
                                            {currentAlphabet.pronunciation}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); speakLetter(currentAlphabet.english); }}
                                            className="mt-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition"
                                            aria-label="발음 듣기"
                                        >
                                            <Volume2 size={24} className="text-primary-light" />
                                        </button>
                                        <div className="mt-4 text-gray-400 text-sm">
                                            탭하여 한글 발음 보기
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div
                                        className="absolute inset-0 bg-gradient-to-br from-success/30 to-success/10 rounded-3xl border-2 border-white/20 flex flex-col items-center justify-center"
                                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                    >
                                        <div className="text-sm text-gray-400 mb-2">
                                            {currentAlphabet.category}
                                        </div>
                                        <div className="text-6xl font-bold text-white mb-4">
                                            {currentAlphabet.korean}
                                        </div>
                                        <div className="bg-white/10 rounded-xl px-6 py-4 text-center">
                                            <div className="text-3xl font-bold text-primary-light mb-1">
                                                {currentAlphabet.example}
                                            </div>
                                            <div className="text-xl text-gray-300">
                                                {currentAlphabet.example_meaning}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); speakLetter(currentAlphabet.example); }}
                                            className="mt-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition"
                                            aria-label="예시 발음 듣기"
                                        >
                                            <Volume2 size={24} className="text-success-light" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleNext}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition ml-4"
                                aria-label="다음"
                            >
                                <ChevronRight size={32} className="text-white" />
                            </button>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={handleShuffle}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white transition"
                        >
                            <Shuffle size={18} />
                            섞기
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white transition"
                        >
                            <RotateCcw size={18} />
                            처음으로
                        </button>
                    </div>

                    {/* Keyboard hints */}
                    <div className="mt-6 text-gray-500 text-xs">
                        키보드: ← → 이동 | Space/Enter 뒤집기 | S 발음 듣기
                    </div>
                </>
            )}

            {/* Quiz Mode */}
            {studyMode === 'quiz' && (
                <>
                    {/* Quiz Type Toggle */}
                    <div className="flex justify-center gap-2 mb-4">
                        <button
                            onClick={() => { setQuizType('englishToKorean'); startQuiz('englishToKorean'); }}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${quizType === 'englishToKorean'
                                ? 'bg-primary/50 text-white border-2 border-primary'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20 border-2 border-transparent'
                                }`}
                        >
                            영어 → 한글
                        </button>
                        <button
                            onClick={() => { setQuizType('koreanToEnglish'); startQuiz('koreanToEnglish'); }}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${quizType === 'koreanToEnglish'
                                ? 'bg-secondary/50 text-white border-2 border-secondary'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20 border-2 border-transparent'
                                }`}
                        >
                            한글 → 영어
                        </button>
                    </div>

                    {feedback === 'finished' ? (
                        /* Quiz Results */
                        <div className="bg-black/20 rounded-3xl p-8 max-w-md mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-4">🎉 퀴즈 완료!</h2>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-success/20 rounded-xl p-4">
                                    <div className="text-success-light text-4xl font-bold">{score}</div>
                                    <div className="text-gray-300 text-sm">정답</div>
                                </div>
                                <div className="bg-danger/20 rounded-xl p-4">
                                    <div className="text-danger-light text-4xl font-bold">{wrongCount}</div>
                                    <div className="text-gray-300 text-sm">오답</div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-primary-light mb-6">
                                정답률: {accuracy}%
                            </div>
                            <Button
                                onClick={startQuiz}
                                variant="threedee"
                                color="primary"
                            >
                                🔄 다시 도전하기
                            </Button>
                        </div>
                    ) : currentAlphabet ? (
                        <>
                            {/* Score display */}
                            <div className="flex justify-center gap-6 mb-4">
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                                    <CheckCircle size={20} className="text-success-light" />
                                    <span className="text-success-light font-bold text-xl">{score}</span>
                                </div>
                                <div className="text-gray-400 text-sm self-center">
                                    {quizIndex + 1} / {quizWords.length}
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
                                    <XCircle size={20} className="text-danger-light" />
                                    <span className="text-danger-light font-bold text-xl">{wrongCount}</span>
                                </div>
                            </div>

                            {/* Question */}
                            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 mb-6 max-w-md mx-auto border-2 border-white/10">
                                <div className="text-gray-400 text-sm mb-2">
                                    {quizType === 'englishToKorean' ? '이 알파벳의 한글 발음은?' : '이 발음의 알파벳은?'}
                                </div>
                                <div className="text-6xl font-black text-white mb-2">
                                    {quizType === 'englishToKorean' ? currentAlphabet.english : currentAlphabet.korean}
                                </div>
                                {quizType === 'englishToKorean' && (
                                    <button
                                        onClick={() => speakLetter(currentAlphabet.english)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                                    >
                                        <Volume2 size={20} className="text-primary-light" />
                                    </button>
                                )}
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto relative">
                                {options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => checkAnswer(option)}
                                        disabled={feedback !== null}
                                        className={`p-4 rounded-2xl text-2xl font-bold transition-all ${feedback !== null
                                            ? option === (quizType === 'englishToKorean' ? currentAlphabet.korean : currentAlphabet.english)
                                                ? 'bg-success text-white'
                                                : 'bg-white/5 text-gray-500'
                                            : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}

                                {/* Feedback overlay */}
                                {feedback && feedback !== 'finished' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                                        <FeedbackAnimation
                                            type={feedback}
                                            correctAnswer={quizType === 'englishToKorean' ? currentAlphabet.korean : currentAlphabet.english}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Restart button */}
                            <div className="mt-6">
                                <button
                                    onClick={startQuiz}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white transition mx-auto"
                                >
                                    <RotateCcw size={18} />
                                    처음부터 다시
                                </button>
                            </div>
                        </>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default AlphabetStudyScreen;

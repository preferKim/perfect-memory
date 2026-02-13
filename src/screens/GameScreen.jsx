import React, { useState, useEffect, useRef, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Volume2, Play, Pause, ArrowLeft, Star } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import PlayerStats from '../components/PlayerStats';
import PauseMenu from '../components/PauseMenu';
import RankingScreen from './RankingScreen';
import ConnectingGameScreen from './ConnectingGameScreen';
import FeedbackAnimation from '../components/FeedbackAnimation';
import { useLearningContent, fetchFromJson } from '../hooks/useLearningContent';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useAuth } from '../hooks/useAuth';

const initialState = {
    status: 'idle', gameMode: 'normal', difficulty: 'easy', playerName: '',
    words: [], allWords: [], connectWords: [], currentIndex: 0, options: [],
    score: 0, wrongAnswers: 0, total: 0, lives: 3, matchedPairs: [],
    stage: 1, feedback: null, timeLeft: 5, speedRunTimeLeft: 100,
    connectTime: 0, isPaused: false, isSpeaking: false, levelDescriptions: null,
};

function reducer(state, action) {
    switch (action.type) {
        case 'SPEAKING_START': return { ...state, isSpeaking: true };
        case 'SPEAKING_END': return { ...state, isSpeaking: false };
        case 'START_GAME':
            return {
                ...initialState,
                playerName: action.payload.name,
                gameMode: action.payload.mode,
                difficulty: action.payload.level,
                status: 'loading',
            };
        case 'SET_WORDS_SUCCESS':
            return {
                ...state,
                words: action.payload.words || [],
                allWords: action.payload.allWords || [],
                connectWords: action.payload.connectWords || [],
                status: 'playing',
            };
        case 'TICK':
            // 답안 피드백 중에는 타이머 정지
            if (state.isPaused || state.feedback || (state.gameMode === 'normal' && state.isSpeaking)) return state;
            if (state.gameMode === 'normal' && state.timeLeft > 0) return { ...state, timeLeft: state.timeLeft - 1 };
            if (state.gameMode === 'speed' && state.speedRunTimeLeft > 0) return { ...state, speedRunTimeLeft: state.speedRunTimeLeft - 1 };
            if (state.gameMode === 'connect') return { ...state, connectTime: state.connectTime + 1 };
            return state;
        case 'SET_OPTIONS': return { ...state, options: action.payload };
        case 'CHECK_ANSWER': {
            const { isCorrect } = action.payload;
            return { ...state, score: isCorrect ? state.score + 1 : state.score, wrongAnswers: !isCorrect ? state.wrongAnswers + 1 : state.wrongAnswers, total: state.total + 1, feedback: isCorrect ? 'correct' : 'wrong' };
        }
        case 'NEXT_WORD': {
            if (state.gameMode === 'speed') return { ...state, currentIndex: Math.floor(Math.random() * state.words.length), feedback: null };
            if (state.currentIndex < state.words.length - 1) return { ...state, currentIndex: state.currentIndex + 1, feedback: null, timeLeft: 5 };
            return { ...state, status: 'finished' };
        }
        case 'TIMEOUT': return { ...state, total: state.total + 1, wrongAnswers: state.wrongAnswers + 1, feedback: 'timeout' };
        case 'FINISH_GAME': {
            let finalScore = state.score;
            if (state.gameMode === 'speed') finalScore = state.score - (state.wrongAnswers * 5);
            else if (state.gameMode === 'connect') finalScore = state.lives > 0 ? state.lives * 10 : state.matchedPairs.length * 5;
            return { ...state, status: 'finished', score: finalScore };
        }
        case 'TOGGLE_PAUSE': return { ...state, isPaused: !state.isPaused };
        case 'CHECK_CONNECT_ANSWER': {
            const { word1, word2 } = action.payload;
            if (word1.english === word2.english) return { ...state, matchedPairs: [...state.matchedPairs, word1.english] };
            return { ...state, lives: state.lives - 1 };
        }
        default: return state;
    }
}

const GameScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addXp, addWeakWord } = usePlayer();
    const { user } = useAuth();
    const { name, level, mode } = location.state || { name: 'Player', level: 'easy', mode: 'normal' };

    const [state, dispatch] = useReducer(reducer, initialState);
    const { status, gameMode, difficulty, words, allWords, connectWords, currentIndex, options, score, wrongAnswers, total, lives, matchedPairs, feedback, timeLeft, speedRunTimeLeft, connectTime, isPaused } = state;

    const [dragStart, setDragStart] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const quizRef = useRef(null);
    const cardRef = useRef(null);
    const timerRef = useRef(null);
    const dragPosRef = useRef({ x: 0, y: 0 });

    // Supabase 학습 훅
    const { getQuestions } = useLearningContent();
    const { startSession, endSession, recordAnswer, toggleFavorite, isFavorite } = useLearningProgress(user?.id);
    const sessionRef = useRef(null);

    useEffect(() => {
        dispatch({ type: 'START_GAME', payload: { name, level, mode } });
    }, [name, level, mode]);

    useEffect(() => {
        if (status === 'loading') {
            const loadGameData = async () => {
                try {
                    // 오답노트에서 customWords가 전달된 경우
                    const { customWords, gameType } = location.state || {};

                    let wordsData;
                    if (customWords && customWords.length > 0) {
                        console.log('Using custom words from wrong answer notebook:', customWords.length);
                        wordsData = customWords;
                    } else {
                        const courseCode = `english_${difficulty}`;

                        // Supabase에서 데이터 가져오기 시도
                        wordsData = await getQuestions(courseCode, { limit: 100, shuffle: false });

                        // Supabase에 데이터가 없으면 JSON fallback
                        if (!wordsData || wordsData.length === 0) {
                            console.log('Supabase에 데이터 없음, JSON fallback 사용');
                            wordsData = await fetchFromJson('english', difficulty);
                        }
                    }

                    let payload = {};
                    if (gameMode === 'speed') payload = { words: wordsData, allWords: wordsData };
                    else if (gameMode === 'connect') payload = { connectWords: wordsData.sort(() => .5 - Math.random()).slice(0, 10) };
                    else payload = { words: wordsData.sort(() => .5 - Math.random()), allWords: wordsData };
                    dispatch({ type: 'SET_WORDS_SUCCESS', payload });
                } catch (error) {
                    console.error("Failed to load game data:", error);
                    // Fallback to JSON
                    try {
                        const wordsData = await fetchFromJson('english', difficulty);
                        let payload = {};
                        if (gameMode === 'speed') payload = { words: wordsData, allWords: wordsData };
                        else if (gameMode === 'connect') payload = { connectWords: wordsData.sort(() => .5 - Math.random()).slice(0, 10) };
                        else payload = { words: wordsData.sort(() => .5 - Math.random()), allWords: wordsData };
                        dispatch({ type: 'SET_WORDS_SUCCESS', payload });
                    } catch (e) { console.error("JSON fallback also failed:", e); }
                }
            };
            loadGameData();
        }
    }, [status, difficulty, gameMode, location.state]);

    // 세션 시작 (user가 로드된 후 게임이 playing 상태일 때)
    useEffect(() => {
        const initSession = async () => {
            if (user?.id && status === 'playing' && !sessionRef.current) {
                const courseCode = `english_${difficulty}`;
                console.log('Starting session for:', courseCode, gameMode);
                sessionRef.current = await startSession(courseCode, gameMode);
                console.log('Session started:', sessionRef.current);
            }
        };
        initSession();
    }, [user?.id, status, difficulty, gameMode, startSession]);

    useEffect(() => {
        if (status !== 'playing' || isPaused) {
            clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
        return () => clearInterval(timerRef.current);
    }, [status, isPaused]);

    useEffect(() => {
        if (status === 'playing') {
            if (gameMode === 'normal' && timeLeft === 0) handleTimeout();
            else if (gameMode === 'speed' && speedRunTimeLeft === 0) dispatch({ type: 'FINISH_GAME' });
            else if (gameMode === 'connect' && (lives <= 0 || (connectWords.length && matchedPairs.length === connectWords.length))) {
                if (lives > 0 && matchedPairs.length === connectWords.length) {
                    addXp('english', 5);
                }
                dispatch({ type: 'FINISH_GAME' });
            }
        }
    }, [status, gameMode, timeLeft, speedRunTimeLeft, lives, matchedPairs.length, connectWords.length]);

    useEffect(() => {
        if (status === 'playing' && words.length > 0 && gameMode !== 'connect') {
            generateOptions();
            if (gameMode === 'normal') speakWord(words[currentIndex]?.english, 2);
        }
    }, [status, currentIndex, words]);

    // Keyboard navigation
    useEffect(() => {
        if (status !== 'playing' || isPaused || feedback || gameMode === 'connect') return;

        const handleKeyPress = (e) => {
            // Prevent default behavior for arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            if (e.key === 'ArrowUp') checkAnswer('up');
            else if (e.key === 'ArrowDown') checkAnswer('down');
            else if (e.key === 'ArrowLeft') checkAnswer('left');
            else if (e.key === 'ArrowRight') checkAnswer('right');
            else if (e.key === ' ' && words[currentIndex]) {
                speakWord(words[currentIndex].english, 1);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [status, isPaused, feedback, gameMode, currentIndex, words]);

    const speakWord = (word, repeatCount = 1, onComplete) => {
        if (!('speechSynthesis' in window)) { if (onComplete) onComplete(); return; }
        window.speechSynthesis.cancel();
        dispatch({ type: 'SPEAKING_START' });
        let spoken = 0;
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.onend = () => {
            spoken++;
            if (spoken < repeatCount) setTimeout(() => window.speechSynthesis.speak(utterance), 500);
            else { dispatch({ type: 'SPEAKING_END' }); if (onComplete) onComplete(); }
        };
        window.speechSynthesis.speak(utterance);
    };

    const generateOptions = () => {
        const current = words[currentIndex];
        if (!current) return;
        const source = allWords.length > 0 ? allWords : words;
        const wrong = source.filter(w => w.english !== current.english).sort(() => .5 - Math.random()).slice(0, 3).map(w => w.korean);
        dispatch({ type: 'SET_OPTIONS', payload: [...wrong, current.korean].sort(() => .5 - Math.random()) });
    };

    const handleNext = () => dispatch({ type: 'NEXT_WORD' });
    const handleTimeout = () => {
        dispatch({ type: 'TIMEOUT' });
        // Track weak word on timeout
        if (words[currentIndex]) {
            addWeakWord(words[currentIndex]);
        }
        setTimeout(() => speakWord(words[currentIndex]?.english, 1, handleNext), 500);
    };

    const checkAnswer = (direction) => {
        const directionMap = { up: 0, down: 1, left: 2, right: 3 };
        const selectedAnswer = options[directionMap[direction]];
        const currentWord = words[currentIndex];
        const isCorrect = selectedAnswer === currentWord.korean;
        dispatch({ type: 'CHECK_ANSWER', payload: { isCorrect } });

        if (isCorrect) {
            addXp('english', 1);
        } else {
            // Track weak word on wrong answer
            if (currentWord) {
                addWeakWord(currentWord);
            }
        }

        // Supabase에 답안 기록 (로그인 사용자 + 세션 있을 때)
        if (user?.id && sessionRef.current && currentWord?._wordId) {
            console.log('Recording answer:', currentWord._wordId, isCorrect);
            recordAnswer(currentWord._wordId, isCorrect, selectedAnswer);
        }

        setTimeout(handleNext, 1200);
    };

    const handleDragStart = (e) => {
        const pos = e.type.includes('mouse') ? { x: e.clientX, y: e.clientY } : { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setDragStart(pos);
        setIsDragging(true);
        if (cardRef.current) cardRef.current.style.transition = 'none';
    };

    const handleDragMove = (e) => {
        if (!isDragging || !dragStart) return;
        if (e.cancelable) e.preventDefault();
        const pos = e.type.includes('mouse') ? { x: e.clientX, y: e.clientY } : { x: e.touches[0].clientX, y: e.touches[0].clientY };
        dragPosRef.current = pos;
        const dx = pos.x - dragStart.x;
        const dy = pos.y - dragStart.y;
        if (cardRef.current) cardRef.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.1}deg)`;
    };

    const handleDragEnd = () => {
        if (!isDragging || !dragStart) return;
        const dx = dragPosRef.current.x - dragStart.x, dy = dragPosRef.current.y - dragStart.y;
        const threshold = 50;
        let dir = null;
        if (Math.abs(dx) > Math.abs(dy)) { if (Math.abs(dx) > threshold) dir = dx > 0 ? 'right' : 'left'; }
        else { if (Math.abs(dy) > threshold) dir = dy > 0 ? 'down' : 'up'; }
        if (dir) checkAnswer(dir);
        setIsDragging(false);
        setDragStart(null);
        if (cardRef.current) { cardRef.current.style.transform = ''; cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; }
    };

    const getTimerColor = () => {
        const time = gameMode === 'speed' ? speedRunTimeLeft : timeLeft;
        if (gameMode === 'speed') { if (time > 30) return 'text-success-dark'; if (time > 10) return 'text-speed-dark'; return 'text-danger-dark'; }
        if (time > 3) return 'text-success-dark'; if (time > 1) return 'text-speed-dark'; return 'text-danger-dark';
    };

    const togglePause = () => dispatch({ type: 'TOGGLE_PAUSE' });
    const handleRestart = () => dispatch({ type: 'START_GAME', payload: { name, level, mode } });

    if (status === 'loading' || (words.length === 0 && gameMode !== 'connect')) return <div className="flex items-center justify-center h-screen text-xl font-bold text-white">Loading...</div>;
    if (status === 'finished') {
        // 세션 종료 (로그인 사용자만)
        if (user?.id && sessionRef.current) {
            endSession({ totalQuestions: total, correctCount: score, wrongCount: wrongAnswers, score });
            sessionRef.current = null;
        }
        return <RankingScreen onRestart={handleRestart} gameMode={gameMode} score={score} wrongAnswers={wrongAnswers} total={total} lives={lives} time={gameMode === 'connect' ? connectTime : speedRunTimeLeft} />;
    }
    if (gameMode === 'connect') {
        return (
            <div className="relative w-full min-h-screen">
                {isPaused && <PauseMenu onResume={togglePause} onRestart={handleRestart} onExit={() => navigate('/english')} />}
                <ConnectingGameScreen
                    words={connectWords}
                    lives={lives}
                    onCheckAnswer={(w1, w2) => dispatch({ type: 'CHECK_CONNECT_ANSWER', payload: { word1: w1, word2: w2 } })}
                    matchedPairs={matchedPairs}
                    resetGame={togglePause}
                    time={connectTime}
                />
            </div>
        );
    }

    const currentWord = words[currentIndex] || {};
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const finalScore = score - (wrongAnswers * 5);

    return (
        <div ref={quizRef} className="transition-opacity duration-500 flex flex-col gap-2" style={{ opacity: 1 }}>
            {isPaused && <PauseMenu onResume={togglePause} onRestart={handleRestart} onExit={() => navigate('/english')} />}
            <PlayerStats />
            <div className="glass-card px-8 pt-8 pb-4 text-center relative">
                <button onClick={togglePause} className="absolute left-4 top-4 text-gray-300 hover:text-white transition p-2" title="일시정지" aria-label="일시정지"><ArrowLeft size={24} /></button>
                {user?.id && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (currentWord._wordId) {
                                toggleFavorite(currentWord._wordId);
                            }
                        }}
                        className="absolute right-4 top-4 text-gray-300 hover:text-white transition p-2 hover:scale-110 active:scale-95"
                        title="즐겨찾기"
                        aria-label="즐겨찾기"
                    >
                        <Star
                            size={28}
                            className={isFavorite(currentWord._wordId) ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-gray-400 hover:text-gray-200"}
                        />
                    </button>
                )}
                <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="text-5xl font-bold text-white relative">
                        {currentWord.english}
                    </div>
                    {gameMode !== 'speed' && <button onClick={() => speakWord(currentWord.english, 1)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition" aria-label="발음 듣기 (Space 키)"><Volume2 size={28} className="text-primary-light" /></button>}
                </div>
                {currentWord.pronunciation && <div className="text-2xl text-primary-light font-mono tracking-wider mb-2">{currentWord.pronunciation}</div>}
                <div className="flex items-center justify-between gap-4 mb-6 px-2">
                    <div className="flex flex-col items-center bg-white/5 px-5 py-3 rounded-2xl min-w-[80px]"><div className="text-success-light mb-1"><CheckCircle size={24} /></div><div className="text-3xl font-bold text-success-light">{score}</div></div>
                    <div className="flex flex-col items-center">
                        <div className={`text-6xl font-black tabular-nums tracking-tight ${getTimerColor()} drop-shadow-sm`}>{gameMode === 'speed' ? speedRunTimeLeft : timeLeft}</div>
                        {gameMode !== 'speed' && <button onClick={togglePause} className="mt-2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition text-gray-300">{isPaused ? <Play size={20} /> : <Pause size={20} />}</button>}
                    </div>
                    <div className="flex flex-col items-center bg-white/5 px-5 py-3 rounded-2xl min-w-[80px]"><div className="text-danger-light mb-1"><XCircle size={24} /></div><div className="text-3xl font-bold text-danger-light">{wrongAnswers}</div></div>
                </div>
                <div className="text-gray-300 text-sm">총 문제 : {total}, 정답률 : {accuracy}%{gameMode === 'speed' && ` / 최종점수 : ${finalScore}`}</div>
            </div>
            <div className="relative h-[330px] glass-card px-4 py-8">
                {['up', 'down', 'left', 'right'].map((dir, i) => <div key={dir} className={`absolute ${dir === 'up' || dir === 'down' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2'} ${dir === 'up' ? 'top-6' : dir === 'down' ? 'bottom-6' : dir === 'left' ? 'left-2' : 'right-2'}`}><div className="glass-card bg-primary/10 border text-white rounded-2xl px-8 py-3 min-w-[120px] text-center"><div className="text-lg font-bold tracking-tight">{options[i]}</div></div></div>)}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gray-900/50 rounded-full shadow-inner border-2 border-white/10"></div>
                    <div ref={cardRef} className="relative w-20 h-20 cursor-grab active:cursor-grabbing select-none" style={{ touchAction: 'none' }} onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd} onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}>
                        <div className="absolute inset-0 flex items-center justify-center">{/* SVG Joystick */}</div>
                        {isDragging && <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl -z-10 animate-pulse"></div>}
                    </div>
                </div>
                <div className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20 rounded-2xl transition-all duration-300 ease-in-out ${feedback ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {feedback && (
                        <FeedbackAnimation
                            type={feedback}
                            answer={options[['up', 'down', 'left', 'right'].findIndex(dir => {
                                const directionMap = { up: 0, down: 1, left: 2, right: 3 };
                                return options[directionMap[dir]] === (feedback === 'correct' ? currentWord.korean : null);
                            })]}
                            correctAnswer={currentWord.korean}
                        />
                    )}
                </div>
            </div>
        </div >
    );
};

export default GameScreen;

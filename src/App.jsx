import React, { useState, useEffect, useRef, useReducer } from 'react';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import RankingScreen from './screens/RankingScreen';
import ConnectingGameScreen from './screens/ConnectingGameScreen';

const initialState = {
    status: 'idle', // 'idle', 'loading', 'playing', 'finished'
    gameMode: 'normal',
    difficulty: 'easy',
    playerName: '',
    words: [],
    allWords: [],
    connectWords: [],
    currentIndex: 0,
    options: [],
    score: 0,
    wrongAnswers: 0,
    total: 0,
    lives: 3,
    matchedPairs: [],
    stage: 1,
    feedback: null,
    timeLeft: 5,
    speedRunTimeLeft: 100,
    connectTime: 0,
    isTimerPaused: false,
    isSpeaking: false,
};

function reducer(state, action) {
    switch (action.type) {
        case 'SPEAKING_START':
            return { ...state, isSpeaking: true };
        case 'SPEAKING_END':
            return { ...state, isSpeaking: false };
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
        case 'SET_WORDS_ERROR':
            return {
                ...state,
                words: defaultWords,
                status: 'playing',
            };
        case 'TICK':
            if (state.isTimerPaused || (state.gameMode === 'normal' && state.isSpeaking)) return state;
            if (state.gameMode === 'normal' && state.timeLeft > 0) {
                return { ...state, timeLeft: state.timeLeft - 1 };
            }
            if (state.gameMode === 'speed' && state.speedRunTimeLeft > 0) {
                return { ...state, speedRunTimeLeft: state.speedRunTimeLeft - 1 };
            }
            if (state.gameMode === 'connect') {
                return { ...state, connectTime: state.connectTime + 1 };
            }
            return state;
        case 'SET_OPTIONS':
            return { ...state, options: action.payload };
        case 'CHECK_ANSWER': {
            const isCorrect = action.payload.isCorrect;
            const newScore = isCorrect ? state.score + 1 : state.score;
            const newWrongAnswers = !isCorrect ? state.wrongAnswers + 1 : state.wrongAnswers;
            if (state.gameMode === 'speed') {
                return {
                    ...state,
                    score: newScore,
                    wrongAnswers: newWrongAnswers,
                    total: state.total + 1,
                };
            }
            return {
                ...state,
                score: newScore,
                total: state.total + 1,
                feedback: isCorrect ? 'correct' : 'wrong',
            };
        }
        case 'NEXT_WORD': {
            if (state.gameMode === 'speed') {
                const nextRandomIndex = Math.floor(Math.random() * state.words.length);
                return { ...state, currentIndex: nextRandomIndex, feedback: null };
            }
            // Normal Mode
            if (state.currentIndex < state.words.length - 1) {
                return { ...state, currentIndex: state.currentIndex + 1, feedback: null, timeLeft: 5 };
            }
            if (state.allWords.length > 0) {
                const nextStage = state.stage + 1;
                const nextStageWords = state.allWords.filter(w => w.level === nextStage);
                if (nextStageWords.length > 0) {
                    return {
                        ...state,
                        stage: nextStage,
                        words: nextStageWords.sort(() => Math.random() - 0.5).slice(0, 4),
                        currentIndex: 0,
                        feedback: null,
                        timeLeft: 5,
                    };
                }
            }
            // If no more words or stages, finish game
            return { ...state, status: 'finished' };
        }
        case 'TIMEOUT':
            return { ...state, total: state.total + 1, feedback: 'timeout' };
        case 'FINISH_GAME':
             if(state.gameMode === 'speed') {
                const finalScore = state.score - (state.wrongAnswers * 5);
                // Here you would typically also update a global ranking state or send to a server
             }
            return { ...state, status: 'finished' };
        case 'RESET_GAME':
            return {
                ...initialState,
                status: 'idle',
            };
        case 'PAUSE_TIMER':
            return { ...state, isTimerPaused: !state.isTimerPaused };

        case 'CHECK_CONNECT_ANSWER': {
            const { word1, word2 } = action.payload;
            if (word1.english === word2.english) {
                const newMatchedPairs = [...state.matchedPairs, word1.english];
                if (newMatchedPairs.length === state.connectWords.length) {
                    return { ...state, matchedPairs: newMatchedPairs, score: state.lives * 10, status: 'finished' };
                }
                return { ...state, matchedPairs: newMatchedPairs };
            }
            const newLives = state.lives - 1;
            if (newLives <= 0) {
                return { ...state, lives: newLives, score: state.matchedPairs.length * 5, status: 'finished' };
            }
            return { ...state, lives: newLives };
        }
        default:
            return state;
    }
}

const defaultWords = [
    { english: "apple", korean: "사과" },
    { english: "book", korean: "책" },
    { english: "cat", korean: "고양이" },
    { english: "dog", korean: "개" },
    { english: "house", korean: "집" },
    { english: "tree", korean: "나무" },
    { english: "water", korean: "물" },
    { english: "fire", korean: "불" },
    { english: "sun", korean: "태양" },
    { english: "moon", korean: "달" }
];

const WordSwipeQuiz = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { 
        status, gameMode, difficulty, playerName, words, allWords, connectWords, 
        currentIndex, options, score, wrongAnswers, total, lives, matchedPairs, 
        stage, feedback, timeLeft, speedRunTimeLeft, connectTime, isTimerPaused, isSpeaking 
    } = state;

    const [dragStart, setDragStart] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [timerMode, setTimerMode] = useState(true);
    const [speedRankings, setSpeedRankings] = useState([]);

    const cardRef = useRef(null);
    const timerRef = useRef(null);
    const quizRef = useRef(null);
    const dragPosRef = useRef({ x: 0, y: 0 });

    // Load words when game starts
    const loadWords = async (level, mode) => {
        try {
            const response = await fetch(`/words/${level}.json`);
            if (response.ok) {
                const data = await response.json();
                let payload = {};
                if (mode === 'speed') {
                    payload = { words: data, allWords: data };
                } else if (mode === 'connect') {
                    payload = { connectWords: data.sort(() => Math.random() - 0.5).slice(0, 10), words: [] };
                } else {
                    if (Array.isArray(data) && data.length > 0 && data.some(item => 'level' in item)) {
                        const stageWords = data.filter(w => w.level === 1);
                        payload = {
                            words: stageWords.length > 0 ? stageWords.sort(() => Math.random() - 0.5).slice(0, 4) : [],
                            allWords: data
                        };
                    } else {
                        payload = { words: data.sort(() => Math.random() - 0.5).slice(0, 20), allWords: [] };
                    }
                }
                dispatch({ type: 'SET_WORDS_SUCCESS', payload });
            } else {
                dispatch({ type: 'SET_WORDS_ERROR' });
            }
        } catch (error) {
            dispatch({ type: 'SET_WORDS_ERROR' });
        }
    };

    const resetGame = () => {
        dispatch({ type: 'RESET_GAME' });
    };

    const handleRestart = () => {
        resetGame();
    };

    const startGame = (name, level, mode) => {
        dispatch({ type: 'START_GAME', payload: { name, level, mode } });
    };

    const checkConnectAnswer = (word1, word2) => {
        dispatch({ type: 'CHECK_CONNECT_ANSWER', payload: { word1, word2 } });
    };
    
    // Side-effects management
    useEffect(() => {
        if (status === 'loading') {
            loadWords(difficulty, gameMode);
        }
    }, [status, difficulty, gameMode]);

    useEffect(() => {
        if (status === 'playing') {
            generateOptions();
            const wordToSpeak = words[currentIndex]?.english;
            if (wordToSpeak) {
                const repeatCount = gameMode === 'speed' ? 1 : 2;
                speakWord(wordToSpeak, repeatCount);
            }
        }
    }, [currentIndex, status, words]); // Depends on words loading and index changing

    useEffect(() => {
        const handleBackButton = (e) => {
            if (status === 'playing') {
                e.preventDefault();
                resetGame();
            }
        };

        if (status === 'playing') {
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('popstate', handleBackButton);
        }

        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, [status]);

    // Timers
    useEffect(() => {
        if (status !== 'playing') return;

        timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
        
        return () => {
            if(timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, isTimerPaused]);

    // Timer-based events
    useEffect(() => {
        if (status !== 'playing') return;

        if (gameMode === 'normal' && timerMode && !isTimerPaused && !feedback) {
            if (timeLeft === 0) {
                handleTimeout();
            } else if (timeLeft <= 3) {
                playWarningSound();
            }
        } else if (gameMode === 'speed' && speedRunTimeLeft === 0) {
            const finalScore = score - (wrongAnswers * 5);
            setSpeedRankings(prev => [...prev, { name: playerName, score: finalScore }].sort((a, b) => b.score - a.score));
            dispatch({ type: 'FINISH_GAME' });
        }
    }, [timeLeft, speedRunTimeLeft, status]);


    const handleNext = () => {
        dispatch({ type: 'NEXT_WORD' });
    };

    const handleTimeout = () => {
        dispatch({ type: 'TIMEOUT' });
        playTimeoutBuzzer();

        setTimeout(() => {
            const currentWord = words[currentIndex];
            speakWord(currentWord.english, 1, () => {
                if (currentWord.example) {
                    speakWord(currentWord.example, 1, handleNext);
                } else {
                    handleNext();
                }
            });
        }, 500);
    };

    const speakWord = (word, repeatCount = 1, onComplete) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            dispatch({ type: 'SPEAKING_START' });
            
            const speak = (count = 0) => {
                if (count < repeatCount) {
                    const utterance = new SpeechSynthesisUtterance(word);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.8;
                    utterance.onend = () => {
                        setTimeout(() => speak(count + 1), 500); // Small delay between repeats
                    };
                    window.speechSynthesis.speak(utterance);
                } else {
                    dispatch({ type: 'SPEAKING_END' });
                    if (onComplete) onComplete();
                }
            };
            
            speak();
        } else {
            if (onComplete) onComplete();
        }
    };

    const playWarningSound = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    };

    const playTimeoutBuzzer = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const playBeep = (delayTime) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = 600;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            }, delayTime);
        };
        playBeep(0);
        playBeep(300);
    };

    const generateOptions = () => {
        if (!words[currentIndex]) return;
        const current = words[currentIndex];
        const sourceForOptions = allWords.length > 0 ? allWords : words;

        const wrongOptions = sourceForOptions
            .filter(w => w.english !== current.english)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => w.korean);

        const allOptions = [...wrongOptions, current.korean]
            .sort(() => Math.random() - 0.5);

        dispatch({ type: 'SET_OPTIONS', payload: allOptions });
    };

    const handleDragStart = (e) => {
        const pos = e.type.includes('mouse')
            ? { x: e.clientX, y: e.clientY }
            : { x: e.touches[0].clientX, y: e.touches[0].clientY };

        setDragStart(pos);
        setIsDragging(true);
        if (cardRef.current) {
            cardRef.current.style.transition = 'none';
        }
    };

    const handleDragMove = (e) => {
        if (!isDragging || !dragStart) return;
        if (e.cancelable) e.preventDefault();
        
        const pos = e.type.includes('mouse')
            ? { x: e.clientX, y: e.clientY }
            : { x: e.touches[0].clientX, y: e.touches[0].clientY };

        dragPosRef.current = pos;

        const dx = pos.x - dragStart.x;
        const dy = pos.y - dragStart.y;
        const rotation = dx * 0.1;

        if (cardRef.current) {
            cardRef.current.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`;
        }
    };

    const handleDragEnd = () => {
        if (!isDragging || !dragStart) {
            setIsDragging(false);
            return;
        }

        const dragCurrent = dragPosRef.current;
        const dx = dragCurrent.x - dragStart.x;
        const dy = dragCurrent.y - dragStart.y;
        const threshold = 50;

        let direction = null;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > threshold) {
                direction = dx > 0 ? 'right' : 'left';
            }
        } else {
            if (Math.abs(dy) > threshold) {
                direction = dy > 0 ? 'down' : 'up';
            }
        }

        if (direction) {
            checkAnswer(direction);
        }

        setIsDragging(false);
        setDragStart(null);

        if (cardRef.current) {
            cardRef.current.style.transform = '';
            cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }
    };

    const checkAnswer = (direction) => {
        const directionMap = { up: 0, down: 1, left: 2, right: 3 };
        const selectedAnswer = options[directionMap[direction]];
        const correctAnswer = words[currentIndex].korean;
        const isCorrect = selectedAnswer === correctAnswer;

        dispatch({ type: 'CHECK_ANSWER', payload: { isCorrect } });
        
        if (gameMode === 'speed') {
            handleNext();
            return;
        }

        if (isCorrect) {
            const currentWord = words[currentIndex];
            if (currentWord.example) {
                speakWord(currentWord.example, 1, handleNext);
            } else {
                setTimeout(handleNext, 1000);
            }
        } else {
            playTimeoutBuzzer();
            setTimeout(() => {
                const currentWord = words[currentIndex];
                speakWord(currentWord.english, 1, () => {
                    if (currentWord.example) {
                        speakWord(currentWord.example, 1, handleNext);
                    } else {
                        handleNext();
                    }
                });
            }, 500);
        }
    };

    const togglePause = () => {
        dispatch({ type: 'PAUSE_TIMER' });
    };

    const getTimerColor = () => {
        const time = gameMode === 'speed' ? speedRunTimeLeft : timeLeft;
        if (gameMode === 'speed') {
             if (time > 30) return 'text-success-dark';
             if (time > 10) return 'text-speed-dark';
             return 'text-danger-dark';
        }
        if (time > 3) return 'text-success-dark';
        if (time > 1) return 'text-speed-dark';
        return 'text-danger-dark';
    };

    const renderContent = () => {
        switch (status) {
            case 'idle':
                return <HomeScreen onStartGame={startGame} isLoading={false} />;
            case 'loading':
                return <HomeScreen onStartGame={startGame} isLoading={true} />;
            case 'playing':
                if (gameMode === 'connect') {
                    return <ConnectingGameScreen 
                        words={connectWords} 
                        lives={lives}
                        onCheckAnswer={checkConnectAnswer}
                        matchedPairs={matchedPairs}
                        resetGame={resetGame}
                        time={connectTime}
                    />;
                }
                return (
                    <GameScreen
                        words={words}
                        currentIndex={currentIndex}
                        stage={stage}
                        score={score}
                        wrongAnswers={wrongAnswers}
                        total={total}
                        timeLeft={gameMode === 'speed' ? speedRunTimeLeft : timeLeft}
                        timerMode={timerMode}
                        isTimerPaused={isTimerPaused}
                        options={options}
                        feedback={gameMode === 'speed' ? null : feedback}
                        isDragging={isDragging}
                        quizRef={quizRef}
                        cardRef={cardRef}
                        resetGame={resetGame}
                        speakWord={speakWord}
                        togglePause={togglePause}
                        getTimerColor={getTimerColor}
                        handleDragStart={handleDragStart}
                        handleDragMove={handleDragMove}
                        handleDragEnd={handleDragEnd}
                        gameMode={gameMode}
                    />
                );
            case 'finished':
                return <RankingScreen 
                    rankings={speedRankings} 
                    onRestart={handleRestart} 
                    gameMode={gameMode}
                    score={score}
                    wrongAnswers={wrongAnswers}
                    total={total}
                    lives={lives}
                    time={gameMode === 'connect' ? connectTime : speedRunTimeLeft}
                />;
            default:
                return <HomeScreen onStartGame={startGame} isLoading={false} />;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center overflow-x-hidden">
            <div className="max-w-2xl w-full">
                {renderContent()}
            </div>
        </div>
    );
};


export default WordSwipeQuiz;
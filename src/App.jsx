import React, { useState, useEffect, useRef, useReducer } from 'react';
import { supabase } from './supabaseClient';
import EnglishSelectionScreen from './screens/EnglishSelectionScreen';
import GameScreen from './screens/GameScreen';
import RankingScreen from './screens/RankingScreen';
import ConnectingGameScreen from './screens/ConnectingGameScreen';
import SubjectScreen from './screens/SubjectScreen';
import TamagotchiScreen from './screens/TamagotchiScreen';
import MathSelectionScreen from './screens/MathSelectionScreen';
import MathGameScreen from './screens/MathGameScreen';
import { usePlayer } from './context/PlayerContext';
import LevelUpNotification from './components/LevelUpNotification';
import PauseMenu from './components/PauseMenu';


const initialState = {
    status: 'idle', // 'idle', 'loading', 'playing', 'finished', 'tamagotchi'
    gameMode: 'normal',
    difficulty: 'easy',
    playerName: '',
    words: [],
    allWords: [],
    connectWords: [],
    currentIndex: 0,
    options: [],
    score: 0,
    points: 0,
    wrongAnswers: 0,
    total: 0,
    lives: 3,
    matchedPairs: [],
    stage: 1,
    feedback: null,
    timeLeft: 5,
    speedRunTimeLeft: 100,
    connectTime: 0,
    isPaused: false,
    isSpeaking: false,
    levelDescriptions: null,
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
                levelDescriptions: state.levelDescriptions, // Keep descriptions
                points: state.points, // Keep points
            };
        case 'SET_POINTS':
            return { ...state, points: action.payload };
        case 'GO_TO_TAMAGOTCHI':
            return { ...state, status: 'tamagotchi' };
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
        case 'SET_LEVEL_DESCRIPTIONS':
            return { ...state, levelDescriptions: action.payload };
        case 'TICK':
            if (state.isPaused || (state.gameMode === 'normal' && state.isSpeaking)) return state;
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
            return { ...state, total: state.total + 1, wrongAnswers: state.wrongAnswers + 1, feedback: 'timeout' };
        case 'FINISH_GAME': {
            let finalScore = state.score;
            if (state.gameMode === 'speed') {
                finalScore = state.score - (state.wrongAnswers * 5);
            } else if (state.gameMode === 'connect') {
            if (state.lives > 0) { // Win condition: lives remaining
                finalScore = state.lives * 10;
            } else { // Lose condition: no lives remaining
                finalScore = state.matchedPairs.length * 5;
            }
        }
            
            const newTotalPoints = state.points + finalScore;
            
            if (action.payload.user) {
                // The side effect is handled in a useEffect hook within the component
            }

            return { ...state, status: 'finished', points: newTotalPoints, score: finalScore };
        }
        case 'RESET_GAME':
            return {
                ...initialState,
                status: 'idle',
                points: state.points, // Keep points on reset
            };
        case 'TOGGLE_PAUSE':
            return { ...state, isPaused: !state.isPaused };

        case 'CHECK_CONNECT_ANSWER': {
            const { word1, word2 } = action.payload;
            if (word1.english === word2.english) {
                const newMatchedPairs = [...state.matchedPairs, word1.english];
                return { ...state, matchedPairs: newMatchedPairs };
            }
            const newLives = state.lives - 1;
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
    const { addXp, resetLevelUp } = usePlayer();
    const { 
        status, gameMode, difficulty, playerName, words, allWords, connectWords, 
        currentIndex, options, score, points, wrongAnswers, total, lives, matchedPairs, 
        stage, feedback, timeLeft, speedRunTimeLeft, connectTime, isPaused, isSpeaking 
    } = state;


    const [dragStart, setDragStart] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [timerMode, setTimerMode] = useState(true);
    const [speedRankings, setSpeedRankings] = useState([]);
    const [user, setUser] = useState(null);
    const [currentDescription, setCurrentDescription] = useState('');
    const [screen, setScreen] = useState('subjects'); // 'subjects', 'modes', 'math-selection'
    const [mathDifficulty, setMathDifficulty] = useState('easy');
    const [selectedTopicLevel, setSelectedTopicLevel] = useState(1);

    useEffect(() => {
        if (status === 'playing' && gameMode === 'normal' && state.levelDescriptions) {
            const key = `english_${difficulty}_${stage}`;
            const description = state.levelDescriptions[key] || `Level ${stage}`; // Fallback
            setCurrentDescription(description);
        } else {
            setCurrentDescription('');
        }
    }, [stage, status, gameMode, difficulty, state.levelDescriptions]);

    const cardRef = useRef(null);
    const timerRef = useRef(null);
    const quizRef = useRef(null);
    const dragPosRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const fetchPoints = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('points')
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching points:', error);
                } else if (data) {
                    dispatch({ type: 'SET_POINTS', payload: data.points });
                }
            };

            fetchPoints();
        }
    }, [user]);

    useEffect(() => {
        if (status === 'loading') {
            const loadAllData = async () => {
                try {
                    // Fetch both in parallel
                    const [descResponse, wordsResponse] = await Promise.all([
                        fetch(`/words/level_descriptions.json`),
                        fetch(`/words/english_${difficulty}.json`)
                    ]);

                    if (!descResponse.ok || !wordsResponse.ok) {
                        throw new Error('Failed to load game data');
                    }

                    const descriptions = await descResponse.json();
                    const wordsData = await wordsResponse.json();

                    // Dispatch descriptions first
                    dispatch({ type: 'SET_LEVEL_DESCRIPTIONS', payload: descriptions });

                    // Then dispatch words success, which will change status to 'playing'
                    let payload = {};
                    if (gameMode === 'speed') {
                        payload = { words: wordsData, allWords: wordsData };
                    } else if (gameMode === 'connect') {
                        payload = { connectWords: wordsData.sort(() => Math.random() - 0.5).slice(0, 10), words: [] };
                    } else {
                        if (Array.isArray(wordsData) && wordsData.length > 0 && wordsData.some(item => 'level' in item)) {
                            const stageWords = wordsData.filter(w => w.level === 1);
                            payload = {
                                words: stageWords.length > 0 ? stageWords.sort(() => Math.random() - 0.5).slice(0, 4) : [],
                                allWords: wordsData
                            };
                        } else {
                            payload = { words: wordsData.sort(() => Math.random() - 0.5).slice(0, 20), allWords: [] };
                        }
                    }
                    dispatch({ type: 'SET_WORDS_SUCCESS', payload });

                } catch (error) {
                    console.error("Failed to load game data:", error);
                    dispatch({ type: 'SET_WORDS_ERROR' });
                }
            };

            loadAllData();
        }
    }, [status, difficulty, gameMode, dispatch]);

    const resetGame = () => {
        dispatch({ type: 'RESET_GAME' });
        setScreen('subjects');
    };

    const handleBackToMathSelection = () => {
        setScreen('math-selection');
    };

    const handleRestart = () => {
        resetGame();
    };

    const startGame = (name, level, mode) => {
        dispatch({ type: 'START_GAME', payload: { name, level, mode } });
    };

    const handleSignUp = async (email, password, nickname) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: nickname,
                    },
                },
            });
            if (error) throw error;
            alert('회원가입 성공! 이메일을 확인해주세요.');
        } catch (error) {
            console.error('Sign up error:', error.message);
            alert('회원가입 실패: ' + error.message);
        }
    };

    const handleLogin = async (email, password) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            alert('로그인 성공!');
        } catch (error) {
            console.error('Login error:', error.message);
            alert('로그인 실패: ' + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Logout error:', error.message);
            alert('로그아웃 실패: ' + error.message);
        }
    };

    const checkConnectAnswer = (word1, word2) => {
        dispatch({ type: 'CHECK_CONNECT_ANSWER', payload: { word1, word2 } });
        if (word1.english === word2.english) {
            playCorrectSound(); // Play correct sound
            // --- Add XP logic here ---
            let xpAmount = 0;
            switch (difficulty) {
                case 'easy':
                    xpAmount = 1;
                    break;
                case 'medium':
                    xpAmount = 2;
                    break;
                case 'hard':
                    xpAmount = 3;
                    break;
                default:
                    xpAmount = 1; // Default to easy if difficulty is not set
            }
            addXp(xpAmount);
            // -------------------------
        } else {
            playWarningSound(); // Play wrong sound
        }
    };
    
    // Side-effects management
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

    const handleExitToSelectionScreen = () => {
        dispatch({ type: 'RESET_GAME' });
    }

    const handleGameRestart = () => {
        dispatch({ type: 'TOGGLE_PAUSE' }); // Close pause menu
        startGame(playerName, difficulty, gameMode);
    }
    
    const togglePauseGame = () => {
        dispatch({ type: 'TOGGLE_PAUSE' });
    };

    useEffect(() => {
        const handleBackButton = (e) => {
            if (status === 'playing') {
                e.preventDefault();
                togglePauseGame();
            }
        };

        if (status === 'playing') {
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('popstate', handleBackButton);
        }

        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, [status, togglePauseGame]);

    // Timers
    useEffect(() => {
        if (status !== 'playing') return;

        timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
        
        return () => {
            if(timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, isPaused]);

    // Timer-based events
    useEffect(() => {
        if (status !== 'playing') return;

        if (gameMode === 'normal' && timeLeft === 0) {
            handleTimeout();
        } else if (gameMode === 'speed' && speedRunTimeLeft === 0) {
            setSpeedRankings(prev => [...prev, { name: playerName, score: score - (wrongAnswers * 5) }].sort((a, b) => b.score - a.score));
            dispatch({ type: 'FINISH_GAME', payload: { user } });
        }
    }, [timeLeft, speedRunTimeLeft, status]);

    useEffect(() => {
        if (status !== 'playing' || gameMode !== 'connect') return;
    
        // Check for win condition
        if (connectWords.length > 0 && matchedPairs.length === connectWords.length) {
            dispatch({ type: 'FINISH_GAME', payload: { user } });
        }
        // Check for lose condition
        else if (lives <= 0) {
            dispatch({ type: 'FINISH_GAME', payload: { user } });
        }
    }, [matchedPairs, lives, status, gameMode, connectWords, user]);

    useEffect(() => {
        if (status === 'finished' && user) {
            updatePoints(user.id, points);
        }
    }, [status, user, points]);


    const updatePoints = async (userId, newPoints) => {
        const { error } = await supabase
            .from('profiles')
            .update({ points: newPoints })
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating points:', error);
        }
    };

    const handleNext = () => {
        if (currentIndex >= words.length - 1 && stage >= (allWords.reduce((max, w) => Math.max(max, w.level), 0) || 1)) {
            dispatch({ type: 'FINISH_GAME', payload: { user } });
        } else {
            dispatch({ type: 'NEXT_WORD' });
        }
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

    const playCorrectSound = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 1200; // Higher frequency for a "ding" sound
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime); // Slightly louder
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1); // Short duration
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
        
        if (isCorrect) {
            let xpAmount = 0;
            switch (difficulty) {
                case 'easy':
                    xpAmount = 1;
                    break;
                case 'medium':
                    xpAmount = 2;
                    break;
                case 'hard':
                    xpAmount = 3;
                    break;
                default:
                    xpAmount = 1; // Default to easy if difficulty is not set
            }
            addXp(xpAmount);
        }
        
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

    const handleNavigate = (screen) => {
        if (screen === 'tamagotchi') {
            dispatch({ type: 'GO_TO_TAMAGOTCHI' });
        }
    };

    const handleSubjectSelect = (subject) => {
        if (subject === 'english') {
            setScreen('modes');
        } else if (subject === 'math') {
            setScreen('math-selection');
        } else {
            alert('아직 준비되지 않았습니다.');
        }
    };

    const handleMathLevelSelect = (topicLevel, difficulty) => {
        const difficultyMap = {
            elementary: 'easy',
            middle: 'medium',
            high: 'hard',
        };
        setMathDifficulty(difficultyMap[difficulty] || 'easy');
        setSelectedTopicLevel(topicLevel);
        setScreen('math-game');
    };

    const renderContent = () => {
        if (screen === 'subjects') {
            return <SubjectScreen 
                onSubjectSelect={handleSubjectSelect}
                onSignUp={handleSignUp}
                onLogin={handleLogin}
                onLogout={handleLogout}
                user={user}
                onNavigate={handleNavigate}
            />;
        }

        if (screen === 'math-selection') {
            return <MathSelectionScreen 
                onLevelSelect={handleMathLevelSelect}
                onBack={resetGame}
            />;
        }

        if (screen === 'math-game') {
            return <MathGameScreen onBack={handleBackToMathSelection} difficulty={mathDifficulty} topicLevel={selectedTopicLevel} />;
        }

        switch (status) {
            case 'idle':
                return <EnglishSelectionScreen onStartGame={startGame} onSignUp={handleSignUp} onLogin={handleLogin} onLogout={handleLogout} isLoading={false} user={user} onNavigate={handleNavigate} onBackToSubjects={() => setScreen('subjects')} />;
            case 'loading':
                return <EnglishSelectionScreen onStartGame={startGame} onSignUp={handleSignUp} onLogin={handleLogin} onLogout={handleLogout} isLoading={true} user={user} onNavigate={handleNavigate} onBackToSubjects={() => setScreen('subjects')} />;
            case 'playing':
                if (gameMode === 'connect') {
                    return <ConnectingGameScreen 
                        words={connectWords} 
                        lives={lives}
                        onCheckAnswer={checkConnectAnswer}
                        matchedPairs={matchedPairs}
                        resetGame={handleExitToSelectionScreen}
                        time={connectTime}
                    />;
                }
                return (
                    <div className="relative">
                        {isPaused && (
                            <PauseMenu 
                                onResume={togglePauseGame} 
                                onRestart={handleGameRestart}
                                onExit={handleExitToSelectionScreen} 
                            />
                        )}
                        <GameScreen
                            words={words}
                            currentIndex={currentIndex}
                            stage={stage}
                            score={score}
                            wrongAnswers={wrongAnswers}
                            total={total}
                            timeLeft={gameMode === 'speed' ? speedRunTimeLeft : timeLeft}
                            timerMode={timerMode}
                            isPaused={isPaused}
                            options={options}
                            feedback={gameMode === 'speed' ? null : feedback}
                            isDragging={isDragging}
                            quizRef={quizRef}
                            cardRef={cardRef}
                            resetGame={togglePauseGame}
                            speakWord={speakWord}
                            togglePause={togglePauseGame}
                            getTimerColor={getTimerColor}
                            handleDragStart={handleDragStart}
                            handleDragMove={handleDragMove}
                            handleDragEnd={handleDragEnd}
                            gameMode={gameMode}
                            description={currentDescription}
                        />
                    </div>
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
            case 'tamagotchi':
                return <TamagotchiScreen onBack={resetGame} points={points} user={user} updatePoints={updatePoints} />;
            default:
                return <EnglishSelectionScreen onStartGame={startGame} onSignUp={handleSignUp} onLogin={handleLogin} onLogout={handleLogout} isLoading={false} user={user} onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center overflow-x-hidden">
            <div className="max-w-2xl w-full">
                {renderContent()}
            </div>
            <LevelUpNotification />
        </div>
    );

};


export default WordSwipeQuiz;
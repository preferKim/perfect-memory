import React, { useState, useEffect, useRef } from 'react';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import RankingScreen from './screens/RankingScreen';


const WordSwipeQuiz = () => {
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

    const [words, setWords] = useState(defaultWords);
    const [difficulty, setDifficulty] = useState('easy');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState(0);
    const [allWords, setAllWords] = useState([]);
    const [stage, setStage] = useState(1);
    const [total, setTotal] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [dragStart, setDragStart] = useState(null);
    const [dragCurrent, setDragCurrent] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [timerMode, setTimerMode] = useState(true);
    const [timeLeft, setTimeLeft] = useState(5);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [gameMode, setGameMode] = useState('normal');
    const [speedRunTimeLeft, setSpeedRunTimeLeft] = useState(100);
    const [playerName, setPlayerName] = useState('');
    const [speedRankings, setSpeedRankings] = useState([]);
    const [showRanking, setShowRanking] = useState(false);

    const cardRef = useRef(null);
    const timerRef = useRef(null);
    const quizRef = useRef(null);

    // Auto-speak for normal mode
    useEffect(() => {
        if (isGameStarted && words.length > 0 && gameMode === 'normal') {
            generateOptions();
            if (words[currentIndex]) {
                speakWord(words[currentIndex].english);
            }
        } else if (isGameStarted && words.length > 0 && gameMode === 'speed') {
            generateOptions();
        }
    }, [currentIndex, isGameStarted, words, gameMode]);

    useEffect(() => {
        const handleBackButton = (e) => {
            if (isGameStarted) {
                e.preventDefault();
                resetGame();
            }
        };

        if (isGameStarted) {
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('popstate', handleBackButton);
        }

        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, [isGameStarted]);

    // Timer for Normal Mode
    useEffect(() => {
        if (gameMode === 'normal' && timerMode && !isTimerPaused && timeLeft > 0 && !feedback && isGameStarted && !isSpeaking) {
            if (timeLeft <= 3 && timeLeft > 0) {
                playWarningSound();
            }
            timerRef.current = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (gameMode === 'normal' && timerMode && timeLeft === 0 && !feedback && isGameStarted) {
            handleTimeout();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [gameMode, timerMode, timeLeft, isTimerPaused, feedback, isGameStarted, isSpeaking]);

    // Timer for Speed Mode
    useEffect(() => {
        if (gameMode === 'speed' && isGameStarted && !isTimerPaused && speedRunTimeLeft > 0) {
            playWarningSound();
            timerRef.current = setTimeout(() => {
                setSpeedRunTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (gameMode === 'speed' && isGameStarted && speedRunTimeLeft === 0) {
            const finalScore = score - (wrongAnswers * 5);
            setSpeedRankings(prev => [...prev, { name: playerName, score: finalScore }]);
            setShowRanking(true);
            setIsGameStarted(false);
            setShowQuiz(false);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [gameMode, isGameStarted, isTimerPaused, speedRunTimeLeft, playerName, score, wrongAnswers]);


    const loadWords = async (level, mode) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/words/${level}.json`);
            if (response.ok) {
                const data = await response.json();
                if (mode === 'speed') {
                    setAllWords(data);
                    setWords(data);
                } else { // normal mode
                    if (Array.isArray(data) && data.length > 0 && data.some(item => 'level' in item)) {
                        setAllWords(data);
                        setStage(1);
                        const stageWords = data.filter(w => w.level === 1);
                        setWords(stageWords.length > 0 ? stageWords.sort(() => Math.random() - 0.5).slice(0, 4) : []);
                    } else {
                        setWords(data.sort(() => Math.random() - 0.5).slice(0, 20));
                        setAllWords([]);
                    }
                }
                setDifficulty(level);
            } else {
                console.log('파일을 찾을 수 없어 기본 단어를 사용합니다.');
                const selectedWords = defaultWords.sort(() => Math.random() - 0.5).slice(0, 20);
                setWords(selectedWords);
                setAllWords([]);
            }
        } catch (error) {
            console.log('파일 로드 실패, 기본 단어를 사용합니다.');
            const selectedWords = defaultWords.sort(() => Math.random() - 0.5).slice(0, 20);
            setWords(selectedWords);
            setAllWords([]);
        }
        setIsLoading(false);
    };

    const handleNext = () => {
        setFeedback(null);

        if (gameMode === 'speed') {
             if (words.length > 0) {
                setCurrentIndex(Math.floor(Math.random() * words.length));
            }
            return;
        }

        // Normal Mode
        setTimeLeft(5);
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            if (allWords.length > 0) {
                const nextStage = stage + 1;
                const nextStageWords = allWords.filter(w => w.level === nextStage);
                if (nextStageWords.length > 0) {
                    setStage(nextStage);
                    setWords(nextStageWords.sort(() => Math.random() - 0.5).slice(0, 4));
                    setCurrentIndex(0);
                } else {
                    setIsGameStarted(false);
                    setShowQuiz(false);
                }
            } else {
                setCurrentIndex(0);
            }
        }
    };

    const handleTimeout = () => {
        setTotal(total + 1);
        setFeedback('timeout');
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

    const speakWord = (word, repeatCount = 2, onComplete) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(true);
            
            const speak = (count = 0) => {
                if (count < repeatCount) {
                    const utterance = new SpeechSynthesisUtterance(word);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.8;
                    utterance.onend = () => {
                        setTimeout(() => speak(count + 1), 1000);
                    };
                    window.speechSynthesis.speak(utterance);
                } else {
                    setIsSpeaking(false);
                    if (onComplete) onComplete();
                }
            };
            
            speak();
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

        setOptions(allOptions);
    };

    const handleDragStart = (e) => {
        const pos = e.type.includes('mouse')
            ? { x: e.clientX, y: e.clientY }
            : { x: e.touches[0].clientX, y: e.touches[0].clientY };

        setDragStart(pos);
        setDragCurrent(pos);
        setIsDragging(true);
    };

    const handleDragMove = (e) => {
        if (!isDragging || !dragStart) return;
        if (e.cancelable) e.preventDefault();
        const pos = e.type.includes('mouse')
            ? { x: e.clientX, y: e.clientY }
            : { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setDragCurrent(pos);
    };

    const handleDragEnd = () => {
        if (!isDragging || !dragStart || !dragCurrent) {
            setIsDragging(false);
            return;
        }

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
        setDragCurrent(null);
    };

    const checkAnswer = (direction) => {
        const directionMap = { up: 0, down: 1, left: 2, right: 3 };
        const selectedAnswer = options[directionMap[direction]];
        const correctAnswer = words[currentIndex].korean;
        const isCorrect = selectedAnswer === correctAnswer;

        setTotal(total + 1);
        if (isCorrect) {
            setScore(score + 1);
            if (gameMode === 'speed') {
                handleNext();
                return;
            }
            setFeedback('correct');
            const currentWord = words[currentIndex];
            if (currentWord.example) {
                speakWord(currentWord.example, 1, handleNext);
            } else {
                setTimeout(handleNext, 1000);
            }
        } else {
             if (gameMode === 'speed') {
                setWrongAnswers(wrongAnswers + 1);
                handleNext();
                return;
            }
            setFeedback('wrong');
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

    const resetGame = () => {
        setCurrentIndex(0);
        setScore(0);
        setWrongAnswers(0);
        setTotal(0);
        setFeedback(null);
        setTimeLeft(5);
        setIsTimerPaused(false);
        setIsGameStarted(false);
        setShowQuiz(false);
        setIsSpeaking(false);
        setGameMode('normal');
        setSpeedRunTimeLeft(100);
        setPlayerName('');
        setShowRanking(false);
    };

    const handleRestart = () => {
        resetGame();
    };

    const startGame = async (name, level, mode) => {
        setPlayerName(name);
        setGameMode(mode);
        await loadWords(level, mode);
        setIsGameStarted(true);
        setCurrentIndex(0);
        setScore(0);
        setWrongAnswers(0);
        setTotal(0);
        setStage(1);
        setFeedback(null);
        setTimeLeft(5);
        setSpeedRunTimeLeft(100);
        setIsTimerPaused(false);
        setShowRanking(false);

        setTimeout(() => {
            setShowQuiz(true);
            setTimeout(() => {
                if (quizRef.current) {
                    quizRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }, 300);
    };

    const togglePause = () => {
        setIsTimerPaused(!isTimerPaused);
    };

    const getDragTransform = () => {
        if (!isDragging || !dragStart || !dragCurrent) return '';
        const dx = dragCurrent.x - dragStart.x;
        const dy = dragCurrent.y - dragStart.y;
        const rotation = dx * 0.1;
        return `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`;
    };

    const getTimerColor = () => {
        const time = gameMode === 'speed' ? speedRunTimeLeft : timeLeft;
        if (gameMode === 'speed') {
             if (time > 30) return 'text-green-600';
             if (time > 10) return 'text-yellow-600';
             return 'text-red-600';
        }
        if (time > 3) return 'text-green-600';
        if (time > 1) return 'text-yellow-600';
        return 'text-red-600';
    };

    const renderContent = () => {
        if (showRanking) {
            return <RankingScreen rankings={speedRankings} onRestart={handleRestart} />;
        }
        if (isGameStarted && showQuiz) {
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
                    getDragTransform={getDragTransform}
                    getTimerColor={getTimerColor}
                    handleDragStart={handleDragStart}
                    handleDragMove={handleDragMove}
                    handleDragEnd={handleDragEnd}
                    gameMode={gameMode}
                />
            );
        }
        return <HomeScreen onStartGame={startGame} isLoading={isLoading} />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 flex items-center justify-center overflow-x-hidden">
            <div className="max-w-2xl w-full">
                {renderContent()}
            </div>
        </div>
    );
};


export default WordSwipeQuiz;
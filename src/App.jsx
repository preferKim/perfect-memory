import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, RotateCcw, Volume2, Clock, Play, Pause, ArrowLeft } from 'lucide-react';

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
    const [total, setTotal] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [dragStart, setDragStart] = useState(null);
    const [dragCurrent, setDragCurrent] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [timerMode, setTimerMode] = useState(true);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const cardRef = useRef(null);
    const timerRef = useRef(null);
    const quizRef = useRef(null);

    useEffect(() => {
        if (isGameStarted) {
            generateOptions();
            speakWord(words[currentIndex].english);
        }
    }, [currentIndex, isGameStarted]);

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

    useEffect(() => {
        if (timerMode && !isTimerPaused && timeLeft > 0 && !feedback && isGameStarted) {
            // 3초 이하일 때 경고음 발생
            if (timeLeft <= 3 && timeLeft > 0) {
                playWarningSound();
            }
            
            timerRef.current = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timerMode && timeLeft === 0 && !feedback && isGameStarted) {
            handleTimeout();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [timerMode, timeLeft, isTimerPaused, feedback, isGameStarted]);

    const loadWords = async (level) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/words/${level}.json`);
            if (response.ok) {
                const data = await response.json();
                // 최대 20개의 단어를 랜덤으로 선택
                const selectedWords = data
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 20);
                setWords(selectedWords);
                setDifficulty(level);
            } else {
                console.log('파일을 찾을 수 없어 기본 단어를 사용합니다.');
                const selectedWords = defaultWords
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 20);
                setWords(selectedWords);
            }
        } catch (error) {
            console.log('파일 로드 실패, 기본 단어를 사용합니다.');
            const selectedWords = defaultWords
                .sort(() => Math.random() - 0.5)
                .slice(0, 20);
            setWords(selectedWords);
        }
        setIsLoading(false);
    };

    const handleTimeout = () => {
        setTotal(total + 1);
        setFeedback('timeout');
        playTimeoutBuzzer();

        setTimeout(() => {
            setFeedback(null);
            setTimeLeft(10);
            if (currentIndex < words.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setCurrentIndex(0);
            }
        }, 1500);
    };

    const speakWord = (word) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const speak = (count = 0) => {
                if (count < 3) {
                    const utterance = new SpeechSynthesisUtterance(word);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.8;
                    utterance.onend = () => {
                        setTimeout(() => speak(count + 1), 1000);
                    };
                    window.speechSynthesis.speak(utterance);
                }
            };
            
            speak();
        }
    };

    const playWarningSound = () => {
        // Web Audio API를 사용하여 경고음 생성
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // 주파수 설정 (Hz)
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    };

    const playTimeoutBuzzer = () => {
        // 부저음을 두 번 재생
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const playBeep = (delayTime) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 600; // 부저음 주파수
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            }, delayTime);
        };
        
        // 첫 번째 부저음
        playBeep(0);
        // 두 번째 부저음 (300ms 후)
        playBeep(300);
    };

    const generateOptions = () => {
        const current = words[currentIndex];
        const wrongOptions = words
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

        e.preventDefault();

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
        const directionMap = {
            up: 0,
            down: 1,
            left: 2,
            right: 3
        };

        const selectedAnswer = options[directionMap[direction]];
        const correctAnswer = words[currentIndex].korean;
        const isCorrect = selectedAnswer === correctAnswer;

        setTotal(total + 1);
        if (isCorrect) {
            setScore(score + 1);
            setFeedback('correct');
        } else {
            setFeedback('wrong');
        }

        setTimeout(() => {
            setFeedback(null);
            setTimeLeft(10);
            if (currentIndex < words.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setCurrentIndex(0);
            }
        }, 1000);
    };

    const resetGame = () => {
        setCurrentIndex(0);
        setScore(0);
        setTotal(0);
        setFeedback(null);
        setTimeLeft(10);
        setIsTimerPaused(false);
        setIsGameStarted(false);
        setShowQuiz(false);
    };

    const startGame = async (level) => {
        await loadWords(level);
        setIsGameStarted(true);
        setCurrentIndex(0);
        setScore(0);
        setTotal(0);
        setFeedback(null);
        setTimeLeft(10);
        setIsTimerPaused(false);

        setTimeout(() => {
            setShowQuiz(true);
            setTimeout(() => {
                if (quizRef.current) {
                    quizRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }, 300);
    };

    const changeDifficulty = async (level) => {
        await loadWords(level);
        setCurrentIndex(0);
        setScore(0);
        setTotal(0);
        setFeedback(null);
        setTimeLeft(10);
    };

    const toggleTimerMode = () => {
        setTimerMode(!timerMode);
        setTimeLeft(10);
        setIsTimerPaused(false);
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
        if (timeLeft > 6) return 'text-green-600';
        if (timeLeft > 3) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getDifficultyLabel = (level) => {
        const labels = {
            easy: '쉬움',
            medium: '보통',
            hard: '어려움'
        };
        return labels[level] || level;
    };

    const getDifficultyColor = (level) => {
        const colors = {
            easy: 'bg-green-500',
            medium: 'bg-yellow-500',
            hard: 'bg-red-500'
        };
        return colors[level] || 'bg-gray-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 flex items-center justify-center overflow-x-hidden">
            <div className="max-w-2xl w-full">
                {isGameStarted && (
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
                        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                            <button
                                onClick={resetGame}
                                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition flex items-center gap-2"
                                title="시작 화면으로"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => changeDifficulty('easy')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition ${
                                        difficulty === 'easy'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    쉬움
                                </button>
                                <button
                                    onClick={() => changeDifficulty('medium')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition ${
                                        difficulty === 'medium'
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    보통
                                </button>
                                <button
                                    onClick={() => changeDifficulty('hard')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition ${
                                        difficulty === 'hard'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    어려움
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleTimerMode}
                                    className={`p-3 rounded-full transition ${
                                        timerMode
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                    title="타이머 모드"
                                >
                                    <Clock size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 bg-blue-50 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-blue-600">{score}</div>
                                <div className="text-sm text-gray-600">정답</div>
                            </div>
                            <div className="flex-1 bg-purple-50 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-purple-600">{total}</div>
                                <div className="text-sm text-gray-600">총 문제</div>
                            </div>
                            <div className="flex-1 bg-green-50 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    {total > 0 ? Math.round((score / total) * 100) : 0}%
                                </div>
                                <div className="text-sm text-gray-600">정답률</div>
                            </div>
                        </div>
                    </div>
                )}

                {isGameStarted && showQuiz ? (
                    <div
                        ref={quizRef}
                        className="transition-opacity duration-500"
                        style={{ opacity: showQuiz ? 1 : 0 }}
                    >
                        {/* 단어 영역 - 최상단 */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="text-5xl font-bold text-gray-800">
                                    {words[currentIndex].english}
                                </div>
                                <button
                                    onClick={() => speakWord(words[currentIndex].english)}
                                    className="p-3 hover:bg-gray-100 rounded-full transition"
                                    title="발음 듣기"
                                >
                                    <Volume2 size={28} className="text-blue-500" />
                                </button>
                            </div>

                            {timerMode && (
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <div className="text-2xl font-bold text-green-600">
                                        ○ {score}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`text-6xl font-bold ${getTimerColor()}`}>
                                            {timeLeft}
                                        </div>
                                        <button
                                            onClick={togglePause}
                                            className="p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition"
                                            title={isTimerPaused ? "계속" : "일시정지"}
                                        >
                                            {isTimerPaused ? <Play size={24} /> : <Pause size={24} />}
                                        </button>
                                    </div>
                                    <div className="text-2xl font-bold text-red-600">
                                        ✕ {total - score}
                                    </div>
                                </div>
                            )}

                            <div className="text-gray-400 text-sm">
                                {currentIndex + 1} / {words.length}
                            </div>
                        </div>

                        {/* 조이스틱 영역 */}
                        <div className="relative h-[400px] bg-white rounded-2xl shadow-lg px-4 py-8">
                            {/* 위쪽 답안 */}
                            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '2rem' }}>
                                <div className="bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-2xl px-8 py-4 shadow-lg">
                                    <div className="text-xl font-bold">{options[0]}</div>
                                </div>
                            </div>

                            {/* 아래쪽 답안 */}
                            <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '2rem' }}>
                                <div className="bg-gradient-to-b from-green-500 to-green-600 text-white rounded-2xl px-8 py-4 shadow-lg">
                                    <div className="text-xl font-bold">{options[1]}</div>
                                </div>
                            </div>

                            {/* 왼쪽 답안 */}
                            <div className="absolute left-8 top-1/2 -translate-y-1/2">
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl px-8 py-4 shadow-lg">
                                    <div className="text-xl font-bold">{options[2]}</div>
                                </div>
                            </div>

                            {/* 오른쪽 답안 */}
                            <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl px-8 py-4 shadow-lg">
                                    <div className="text-xl font-bold">{options[3]}</div>
                                </div>
                            </div>

                            {/* 중앙 조이스틱 */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div
                                    ref={cardRef}
                                    className="relative w-20 h-20 cursor-grab active:cursor-grabbing select-none"
                                    style={{
                                        transform: getDragTransform(),
                                        transition: isDragging ? 'none' : 'transform 0.3s ease',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={handleDragStart}
                                    onMouseMove={handleDragMove}
                                    onMouseUp={handleDragEnd}
                                    onMouseLeave={handleDragEnd}
                                    onTouchStart={handleDragStart}
                                    onTouchMove={handleDragMove}
                                    onTouchEnd={handleDragEnd}
                                >
                                    {/* 외곽 원 */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full shadow-xl"></div>

                                    {/* 내부 원 */}
                                    <div className="absolute inset-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-inner flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-lg mb-1">🕹️</div>
                                        </div>
                                    </div>

                                    {/* 방향 표시 (드래그 중) */}
                                    {isDragging && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 피드백 오버레이 */}
                            {feedback && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20 rounded-2xl">
                                    <div className={`text-center p-8 rounded-2xl ${
                                        feedback === 'correct' ? 'bg-green-500' :
                                            feedback === 'timeout' ? 'bg-orange-500' : 'bg-red-500'
                                    }`}>
                                        {feedback === 'correct' ? (
                                            <>
                                                <CheckCircle size={80} className="text-white mx-auto mb-4" />
                                                <div className="text-3xl font-bold text-white">정답!</div>
                                            </>
                                        ) : feedback === 'timeout' ? (
                                            <>
                                                <Clock size={80} className="text-white mx-auto mb-4" />
                                                <div className="text-3xl font-bold text-white">시간 초과!</div>
                                                <div className="text-xl text-white mt-2">
                                                    정답: {words[currentIndex].korean}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={80} className="text-white mx-auto mb-4" />
                                                <div className="text-3xl font-bold text-white">오답!</div>
                                                <div className="text-xl text-white mt-2">
                                                    정답: {words[currentIndex].korean}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : !isGameStarted && (
                    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-12 text-center border-4 border-indigo-200">
                        <div className="text-8xl mb-6 animate-bounce">🐻</div>
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-indigo-600 mb-4 leading-tight break-words tracking-tight">
                            영어 단어 퀴즈 놀이!
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 font-medium">
                            친구들과 함께 재미있게 영어를 배워봐요 🎈
                        </p>
                        
                        <div className="bg-indigo-50 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto border-2 border-indigo-100">
                            <h3 className="text-lg font-bold text-indigo-800 mb-4 text-center">🎮 게임 방법</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm">
                                    <div className="text-3xl">👆</div>
                                    <div>
                                        <div className="font-bold text-gray-800">쓱~ 밀어서 정답!</div>
                                        <div className="text-gray-500 text-sm">카드를 정답 쪽으로 밀어주세요</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm">
                                    <div className="text-3xl">🔊</div>
                                    <div>
                                        <div className="font-bold text-gray-800">소리를 들어봐요</div>
                                        <div className="text-gray-500 text-sm">스피커를 누르면 발음이 나와요</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm">
                                    <div className="text-3xl">⏰</div>
                                    <div>
                                        <div className="font-bold text-gray-800">시간은 10초!</div>
                                        <div className="text-gray-500 text-sm">째깍째깍! 서둘러야 해요</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-xl font-bold text-indigo-800 mb-6">도전할 레벨을 골라보세요!</p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <button
                                    onClick={() => startGame('easy')}
                                    disabled={isLoading}
                                    className="px-6 py-4 bg-green-400 text-white text-xl font-bold rounded-2xl hover:bg-green-500 transition shadow-[0_4px_0_rgb(34,197,94)] active:shadow-none active:translate-y-[4px] disabled:opacity-50 w-full sm:w-auto"
                                >
                                    병아리반 🐣
                                </button>
                                <button
                                    onClick={() => startGame('medium')}
                                    disabled={isLoading}
                                    className="px-6 py-4 bg-yellow-400 text-white text-xl font-bold rounded-2xl hover:bg-yellow-500 transition shadow-[0_4px_0_rgb(234,179,8)] active:shadow-none active:translate-y-[4px] disabled:opacity-50 w-full sm:w-auto"
                                >
                                    토끼반 🐰
                                </button>
                                <button
                                    onClick={() => startGame('hard')}
                                    disabled={isLoading}
                                    className="px-6 py-4 bg-red-400 text-white text-xl font-bold rounded-2xl hover:bg-red-500 transition shadow-[0_4px_0_rgb(239,68,68)] active:shadow-none active:translate-y-[4px] disabled:opacity-50 w-full sm:w-auto"
                                >
                                    호랑이반 🐯
                                </button>
                            </div>
                            {isLoading && (
                                <p className="text-indigo-400 mt-4 font-medium animate-pulse">단어 카드를 가져오고 있어요...</p>
                            )}
                        </div>
                    </div>
                )}

                {isGameStarted && (
                    <div className="bg-white rounded-2xl shadow-lg p-4 mt-6">
                        <div className="text-sm text-gray-600 text-center space-y-1">
                            <div>💡 카드를 상하좌우로 드래그하여 정답을 선택하세요</div>
                            <div>🔊 스피커 아이콘을 클릭하면 발음을 들을 수 있어요</div>
                            {timerMode && <div>⏱️ 타이머 모드: 10초 안에 답을 선택하세요!</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WordSwipeQuiz;
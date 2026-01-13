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
    const cardRef = useRef(null);
    const timerRef = useRef(null);
    const quizRef = useRef(null);

    useEffect(() => {
        if (isGameStarted && words.length > 0) {
            generateOptions();
            if (words[currentIndex]) {
                speakWord(words[currentIndex].english);
            }
        }
    }, [currentIndex, isGameStarted, words]);

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
        if (timerMode && !isTimerPaused && timeLeft > 0 && !feedback && isGameStarted && !isSpeaking) {
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
    }, [timerMode, timeLeft, isTimerPaused, feedback, isGameStarted, isSpeaking]);

    const loadWords = async (level) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/words/${level}.json`);

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0 && data.some(item => 'level' in item)) {
                    setAllWords(data);
                    setStage(1);
                    const stageWords = data.filter(w => w.level === 1);
                    setWords(stageWords.length > 0 ? stageWords.sort(() => Math.random() - 0.5).slice(0, 4) : []);
                } else {
                    setWords(data.sort(() => Math.random() - 0.5).slice(0, 20));
                    setAllWords([]);
                }
                setDifficulty(level);
            } else {
                console.log('파일을 찾을 수 없어 기본 단어를 사용합니다.');
                const selectedWords = defaultWords
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 20);
                setWords(selectedWords);
                setAllWords([]);
            }
        } catch (error) {
            console.log('파일 로드 실패, 기본 단어를 사용합니다.');
            const selectedWords = defaultWords
                .sort(() => Math.random() - 0.5)
                .slice(0, 20);
            setWords(selectedWords);
            setAllWords([]);
        }
        setIsLoading(false);
    };

    const handleNext = () => {
        setFeedback(null);
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
        const wrongOptions = allWords
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
            
            const currentWord = words[currentIndex];
            if (currentWord.example) {
                speakWord(currentWord.example, 1, handleNext);
            } else {
                setTimeout(handleNext, 1000);
            }
        } else {
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
        setTotal(0);
        setFeedback(null);
        setTimeLeft(5);
        setIsTimerPaused(false);
        setIsGameStarted(false);
        setShowQuiz(false);
        setIsSpeaking(false);
    };

    const startGame = async (level) => {
        await loadWords(level);
        setIsGameStarted(true);
        setCurrentIndex(0);
        setScore(0);
        setTotal(0);
        setStage(1);
        setFeedback(null);
        setTimeLeft(5);
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
        setTimeLeft(5);
    };

    const toggleTimerMode = () => {
        setTimerMode(!timerMode);
        setTimeLeft(5);
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
        if (timeLeft > 3) return 'text-green-600';
        if (timeLeft > 1) return 'text-yellow-600';
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
                {isGameStarted && showQuiz ? (
                    <div
                        ref={quizRef}
                        className="transition-opacity duration-500"
                        style={{ opacity: showQuiz ? 1 : 0 }}
                    >
                        {/* 단어 영역 - 최상단 */}
                        <div className="bg-white rounded-2xl shadow-lg p-8 mb-2 text-center relative">
                            <button
                                onClick={resetGame}
                                className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 transition p-2"
                                title="그만하기"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div className="text-sm font-bold text-indigo-500 mb-2 uppercase tracking-wider ">
                                Level {stage} ({currentIndex + 1}/{words.length})
                            </div>
                            
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
                                <div className="flex items-center justify-between gap-4 mb-6 px-2">
                                    <div className="flex flex-col items-center bg-green-50 px-5 py-3 rounded-2xl border-2 border-green-100 shadow-sm min-w-[80px]">
                                        <div className="text-green-500 mb-1">
                                            <CheckCircle size={24} />
                                        </div>
                                        <div className="text-3xl font-bold text-green-600">
                                            {score}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className={`text-6xl font-black tabular-nums tracking-tight ${getTimerColor()} drop-shadow-sm`}>
                                            {timeLeft}
                                        </div>
                                        <button
                                            onClick={togglePause}
                                            className="mt-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-500"
                                            title={isTimerPaused ? "계속" : "일시정지"}
                                        >
                                            {isTimerPaused ? <Play size={20} /> : <Pause size={20} />}
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-center bg-red-50 px-5 py-3 rounded-2xl border-2 border-red-100 shadow-sm min-w-[80px]">
                                        <div className="text-red-500 mb-1">
                                            <XCircle size={24} />
                                        </div>
                                        <div className="text-3xl font-bold text-red-600">
                                            {total - score}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="text-gray-400 text-sm">
                                총 문제 : {total} , 정답률 : {total > 0 ? Math.round((score / total) * 100) : 0}%
                            </div>
                        </div>

                        {/* 조이스틱 영역 */}
                        <div className="relative h-[330px] bg-white rounded-2xl shadow-lg px-4 py-8">
                            {/* 위쪽 답안 (Soft Blue) */}
                            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '1.5rem' }}>
                                <div className="bg-white border-2 border-blue-500 text-blue-600 rounded-2xl px-8 py-3 shadow-sm min-w-[120px] text-center">
                                    <div className="text-lg font-bold tracking-tight">{options[0]}</div>
                                </div>
                            </div>

                            {/* 아래쪽 답안 (Soft Green) */}
                            <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '1.5rem' }}>
                                <div className="bg-white border-2 border-emerald-500 text-emerald-600 rounded-2xl px-8 py-3 shadow-sm min-w-[120px] text-center">
                                    <div className="text-lg font-bold tracking-tight">{options[1]}</div>
                                </div>
                            </div>

                            {/* 왼쪽 답안 (Soft Purple) */}
                            <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                <div className="bg-white border-2 border-purple-500 text-purple-600 rounded-2xl px-2 py-6 shadow-sm w-20 text-center">
                                    <div className="text-lg font-bold tracking-tight">{options[2]}</div>
                                </div>
                            </div>

                            {/* 오른쪽 답안 (Soft Orange) */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <div className="bg-white border-2 border-orange-500 text-orange-600 rounded-2xl px-2 py-6 shadow-sm w-20 text-center">
                                    <div className="text-lg font-bold tracking-tight">{options[3]}</div>
                                </div>
                            </div>

                            {/* 중앙 조이스틱 */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                {/* 배경 베이스: 조이스틱이 박혀있는 듯한 깊이감 */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-slate-200 rounded-full shadow-inner border-4 border-slate-300/50"></div>
                                
                                <div
                                    ref={cardRef}
                                    className="relative w-20 h-20 cursor-grab active:cursor-grabbing select-none"
                                    style={{
                                        transform: getDragTransform(),
                                        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
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
                                    {/* 메인 핸들러: 메탈릭한 다크 네이비 */}
                                    <div className={`absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full shadow-2xl transition-transform ${isDragging ? 'scale-95' : 'scale-100'}`}>
                                        
                                        {/* 상단 발광 링 (드래그 시 강조) */}
                                        <div className={`absolute inset-1 rounded-full border-2 transition-colors duration-300 ${isDragging ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 'border-slate-600'}`}></div>

                                        {/* 조이스틱 내부 아이콘/패턴 */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative">
                                                {/* 중앙 십자 포인트 */}
                                                <div className="w-1 h-6 bg-slate-500 rounded-full absolute left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40"></div>
                                                <div className="w-6 h-1 bg-slate-500 rounded-full absolute left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40"></div>
                                                
                                                {/* 중앙 이모지 또는 아이콘 */}
                                                <div className={`text-2xl transform transition-transform ${isDragging ? 'scale-110' : 'scale-100'}`}>
                                                    {isDragging ? '🚀' : '🎮'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 빛 반사 하이라이트 */}
                                        <div className="absolute top-2 left-4 w-6 h-3 bg-white/10 rounded-[100%] rotate-[-20deg]"></div>
                                    </div>
                                    
                                    {/* 드래그 중일 때 바닥에 생기는 그림자 */}
                                    {isDragging && (
                                        <div className="absolute -inset-4 bg-cyan-500/10 rounded-full blur-xl -z-10 animate-pulse"></div>
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
                                                {words[currentIndex].example && (
                                                    <div className="mt-4 text-white text-lg font-medium bg-black bg-opacity-20 p-4 rounded-xl">
                                                        {words[currentIndex].example}
                                                    </div>
                                                )}
                                            </>
                                        ) : feedback === 'timeout' ? (
                                            <>
                                                <Clock size={80} className="text-white mx-auto mb-4" />
                                                <div className="text-3xl font-bold text-white">시간 초과!</div>
                                                <div className="text-xl text-white mt-2">
                                                    정답: {words[currentIndex].korean}
                                                </div>
                                                {words[currentIndex].example && (
                                                    <div className="mt-4 text-white text-lg font-medium bg-black bg-opacity-20 p-4 rounded-xl">
                                                        {words[currentIndex].example}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={80} className="text-white mx-auto mb-4" />
                                                <div className="text-3xl font-bold text-white">오답!</div>
                                                <div className="text-xl text-white mt-2">
                                                    정답: {words[currentIndex].korean}
                                                </div>
                                                {words[currentIndex].example && (
                                                    <div className="mt-4 text-white text-lg font-medium bg-black bg-opacity-20 p-4 rounded-xl">
                                                        {words[currentIndex].example}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : !isGameStarted && (
                    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-12 text-center border-4 border-indigo-200">
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-indigo-600 mb-4 leading-tight break-words tracking-tight animate-bounce">
                            Perfect Memory
                        </h2>
                        <p className="text-sm text-gray-600 mb-4 font-medium">
                            망각 곡선에 맞춘 게임방식 암기법
                        </p>
                        
                        <div className="bg-indigo-50 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto border-2 border-indigo-100">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm">
                                    <div className="text-3xl">🧭</div>
                                    <div>
                                        <div className="font-bold text-gray-800">단순한 조작</div>
                                        <div className="text-gray-500 text-sm">정답 방향으로 밀어주세요</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm">
                                    <div className="text-3xl">🗣️</div>
                                    <div>
                                        <div className="font-bold text-gray-800">음성지원</div>
                                        <div className="text-gray-500 text-sm">실제발음과 예문을 확인하세요</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm">
                                    <div className="text-3xl">🧠</div>
                                    <div>
                                        <div className="font-bold text-gray-800">시간제한</div>
                                        <div className="text-gray-500 text-sm">긴장감으로 암기효과를 높여요</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-xl font-bold text-indigo-800 mb-4">도전할 레벨을 골라보세요!</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => startGame('easy')}
                                    disabled={isLoading}
                                    className="px-2 py-4 bg-green-400 text-white text-sm font-bold rounded-2xl hover:bg-green-500 transition shadow-[0_4px_0_rgb(34,197,94)] active:shadow-none active:translate-y-[4px] disabled:opacity-50"
                                >
                                    🐣<br/>병아리반
                                </button>
                                <button
                                    onClick={() => startGame('medium')}
                                    disabled={isLoading}
                                    className="px-2 py-4 bg-yellow-400 text-white text-sm font-bold rounded-2xl hover:bg-yellow-500 transition shadow-[0_4px_0_rgb(234,179,8)] active:shadow-none active:translate-y-[4px] disabled:opacity-50"
                                >
                                    🐰<br/>토끼반
                                </button>
                                <button
                                    onClick={() => startGame('hard')}
                                    disabled={isLoading}
                                    className="px-2 py-4 bg-red-400 text-white text-sm font-bold rounded-2xl hover:bg-red-500 transition shadow-[0_4px_0_rgb(239,68,68)] active:shadow-none active:translate-y-[4px] disabled:opacity-50"
                                >
                                    🐯<br/>호랑이반
                                </button>
                            </div>
                            {isLoading && (
                                <p className="text-indigo-400 mt-4 font-medium animate-pulse">단어 카드를 가져오고 있어요...</p>
                            )}
                        </div>
                    </div>
                )}

                {isGameStarted && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mt-2">
                    <div className="text-center">
                        <div className="text-md font-medium text-gray-700 mb-1">
                            "Slow and steady wins the race"
                        </div>
                        <span className="inline-block px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-100">
                            천천히 꾸준히 하는 사람이 결국 승리한다
                        </span>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default WordSwipeQuiz;
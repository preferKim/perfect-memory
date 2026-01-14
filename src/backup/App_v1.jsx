import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, RotateCcw, Volume2, Clock, Play, Pause } from 'lucide-react';

const WordSwipeQuiz = () => {
    const words = [
        { english: "apple", korean: "사과" },
        { english: "book", korean: "책" },
        { english: "cat", korean: "고양이" },
        { english: "dog", korean: "개" },
        { english: "house", korean: "집" },
        { english: "tree", korean: "나무" },
        { english: "water", korean: "물" },
        { english: "fire", korean: "불" },
        { english: "sun", korean: "태양" },
        { english: "moon", korean: "달" },
        { english: "star", korean: "별" },
        { english: "car", korean: "자동차" },
        { english: "phone", korean: "전화기" },
        { english: "computer", korean: "컴퓨터" },
        { english: "friend", korean: "친구" }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [total, setTotal] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [dragStart, setDragStart] = useState(null);
    const [dragCurrent, setDragCurrent] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [timerMode, setTimerMode] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const cardRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        generateOptions();
        speakWord(words[currentIndex].english);
    }, [currentIndex]);

    useEffect(() => {
        if (timerMode && !isTimerPaused && timeLeft > 0 && !feedback) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timerMode && timeLeft === 0 && !feedback) {
            handleTimeout();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [timerMode, timeLeft, isTimerPaused, feedback]);

    const handleTimeout = () => {
        setTotal(total + 1);
        setFeedback('timeout');

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
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center overflow-hidden">
            <div className="max-w-2xl w-full">
                {/* 헤더 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">영어 단어 퀴즈</h1>
                            <p className="text-gray-600 mt-1">스와이프로 정답을 선택하세요</p>
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
                            {timerMode && (
                                <button
                                    onClick={togglePause}
                                    className="p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition"
                                    title={isTimerPaused ? "계속" : "일시정지"}
                                >
                                    {isTimerPaused ? <Play size={24} /> : <Pause size={24} />}
                                </button>
                            )}
                            <button
                                onClick={resetGame}
                                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                                title="리셋"
                            >
                                <RotateCcw size={24} />
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

                {/* 게임 영역 */}
                <div className="relative h-[600px]">
                    {/* 방향 레이블 */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white rounded-lg px-6 py-3 shadow-md z-10">
                        <div className="text-lg font-semibold text-gray-700">{options[0]}</div>
                    </div>
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-lg px-6 py-3 shadow-md z-10">
                        <div className="text-lg font-semibold text-gray-700">{options[1]}</div>
                    </div>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-lg px-6 py-3 shadow-md z-10">
                        <div className="text-lg font-semibold text-gray-700">{options[2]}</div>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-lg px-6 py-3 shadow-md z-10">
                        <div className="text-lg font-semibold text-gray-700">{options[3]}</div>
                    </div>

                    {/* 중앙 카드 */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48">
                        <div
                            ref={cardRef}
                            className="bg-white rounded-2xl shadow-2xl p-8 cursor-grab active:cursor-grabbing select-none"
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
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <div className="text-4xl font-bold text-gray-800">
                                        {words[currentIndex].english}
                                    </div>
                                    <button
                                        onClick={() => speakWord(words[currentIndex].english)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition"
                                        title="발음 듣기"
                                    >
                                        <Volume2 size={24} className="text-blue-500" />
                                    </button>
                                </div>

                                {timerMode && (
                                    <div className={`text-5xl font-bold mb-3 ${getTimerColor()}`}>
                                        {timeLeft}
                                    </div>
                                )}

                                <div className="text-gray-400 text-xs">
                                    {currentIndex + 1} / {words.length}
                                </div>
                            </div>
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

                {/* 도움말 */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mt-6">
                    <div className="text-sm text-gray-600 text-center space-y-1">
                        <div>💡 카드를 상하좌우로 드래그하여 정답을 선택하세요</div>
                        <div>🔊 스피커 아이콘을 클릭하면 발음을 들을 수 있어요</div>
                        {timerMode && <div>⏱️ 타이머 모드: 10초 안에 답을 선택하세요!</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WordSwipeQuiz;
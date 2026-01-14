import React from 'react';
import { CheckCircle, XCircle, Clock, Volume2, Play, Pause, ArrowLeft } from 'lucide-react';

const GameScreen = ({
    words,
    currentIndex,
    stage,
    score,
    total,
    timeLeft,
    timerMode,
    isTimerPaused,
    options,
    feedback,
    isDragging,
    quizRef,
    cardRef,
    resetGame,
    speakWord,
    togglePause,
    getDragTransform,
    getTimerColor,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
}) => {
    if (!words || words.length === 0 || !words[currentIndex]) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl font-bold text-gray-700">로딩 중...</div>
            </div>
        );
    }

    return (
        <div
            ref={quizRef}
            className="transition-opacity duration-500"
            style={{ opacity: 1 }}
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
                        <div className={`absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full shadow-2xl transition-transform ${isDragging ? 'scale-95' : 'scale-100'}`}>
                            <div className={`absolute inset-1 rounded-full border-2 transition-colors duration-300 ${isDragging ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 'border-slate-600'}`}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    <div className="w-1 h-6 bg-slate-500 rounded-full absolute left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40"></div>
                                    <div className="w-6 h-1 bg-slate-500 rounded-full absolute left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40"></div>
                                    <div className={`text-2xl transform transition-transform ${isDragging ? 'scale-110' : 'scale-100'}`}>
                                        {isDragging ? '🚀' : '🎮'}
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-2 left-4 w-6 h-3 bg-white/10 rounded-[100%] rotate-[-20deg]"></div>
                        </div>
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
        </div>
    );
};

export default GameScreen;

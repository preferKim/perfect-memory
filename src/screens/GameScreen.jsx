import React from 'react';
import { CheckCircle, XCircle, Clock, Volume2, Play, Pause, ArrowLeft } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import PlayerStats from '../components/PlayerStats';

const GameScreen = ({
    words,
    currentIndex,
    stage,
    score,
    wrongAnswers,
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
    gameMode,
    description,
    difficulty, // Add difficulty prop
}) => {
    const { level: playerLevel, xpGainedInCurrentLevel, xpRequiredForCurrentLevel, addXp } = usePlayer(); // Add addXp

    if (!words || words.length === 0 || !words[currentIndex]) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl font-bold text-white">로딩 중...</div>
            </div>
        );
    }

    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const finalScore = score - (wrongAnswers * 5);

    return (
        <div
            ref={quizRef}
            className="transition-opacity duration-500 flex flex-col gap-2"
            style={{ opacity: 1 }}
        >
            <PlayerStats />
            
            {/* 단어 영역 - 최상단 */}
            <div className="glass-card px-8 pt-8 pb-4 text-center relative">
                <button
                    onClick={resetGame}
                    className="absolute left-4 top-4 text-gray-300 hover:text-white transition p-2"
                    title="그만하기"
                    aria-label="그만하기"
                >
                    <ArrowLeft size={24} />
                </button>

                
                <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="text-5xl font-bold text-white">
                        {words[currentIndex].english}
                    </div>
                    {gameMode !== 'speed' && (
                        <button
                            onClick={() => speakWord(words[currentIndex].english, 1)}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition"
                            title="발음 듣기"
                            aria-label="발음 듣기"
                        >
                            <Volume2 size={28} className="text-primary-light" />
                        </button>
                    )}
                </div>

                {words[currentIndex].pronunciation && (
                    <div className="text-2xl text-primary-light font-mono tracking-wider mb-2">
                        {words[currentIndex].pronunciation}
                    </div>
                )}

                {timerMode && (
                    <div className="flex items-center justify-between gap-4 mb-6 px-2">
                        <div className="flex flex-col items-center bg-white/5 px-5 py-3 rounded-2xl border border-white/10 shadow-sm min-w-[80px]">
                            <div className="text-success-light mb-1">
                                <CheckCircle size={24} />
                            </div>
                            <div className="text-3xl font-bold text-success-light">
                                {score}
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`text-6xl font-black tabular-nums tracking-tight ${getTimerColor()} drop-shadow-sm`}>
                                {timeLeft}
                            </div>
                            {gameMode !== 'speed' && (
                                <button
                                    onClick={togglePause}
                                    className="mt-2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition text-gray-300"
                                    title={isTimerPaused ? "계속" : "일시정지"}
                                    aria-label={isTimerPaused ? "계속" : "일시정지"}
                                >
                                    {isTimerPaused ? <Play size={20} /> : <Pause size={20} />}
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col items-center bg-white/5 px-5 py-3 rounded-2xl border border-white/10 shadow-sm min-w-[80px]">
                            <div className="text-danger-light mb-1">
                                <XCircle size={24} />
                            </div>
                            <div className="text-3xl font-bold text-danger-light">
                                {wrongAnswers}
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-gray-300 text-sm">
                   총 문제 : {total} , 정답률 : {accuracy}%
                   {gameMode === 'speed' && ` / 최종점수 : ${finalScore}`}
                </div>
            </div>

            {/* 조이스틱 영역 */}
            <div className="relative h-[330px] glass-card px-4 py-8">
                {/* 위쪽 답안 */}
                <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '1.5rem' }}>
                    <div className="glass-card bg-primary/10 border border-primary-light/50 shadow-lg shadow-primary-light/10 text-white rounded-2xl px-8 py-3 min-w-[120px] text-center">
                        <div className="text-lg font-bold tracking-tight">{options[0]}</div>
                    </div>
                </div>

                {/* 아래쪽 답안 */}
                <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: '1.5rem' }}>
                    <div className="glass-card bg-success/10 border border-success-light/50 shadow-lg shadow-success-light/10 text-white rounded-2xl px-8 py-3 min-w-[120px] text-center">
                        <div className="text-lg font-bold tracking-tight">{options[1]}</div>
                    </div>
                </div>

                {/* 왼쪽 답안 */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <div className="glass-card bg-speed/10 border border-speed-light/50 shadow-lg shadow-speed-light/10 text-white rounded-2xl px-2 py-6 w-20 text-center">
                        <div className="text-lg font-bold tracking-tight">{options[2]}</div>
                    </div>
                </div>

                {/* 오른쪽 답안 */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="glass-card bg-danger/10 border border-danger-light/50 shadow-lg shadow-danger-light/10 text-white rounded-2xl px-2 py-6 w-20 text-center">
                        <div className="text-lg font-bold tracking-tight">{options[3]}</div>
                    </div>
                </div>

                {/* 중앙 조이스틱 */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gray-900/50 rounded-full shadow-inner border-2 border-white/10"></div>
                    
                    <div
                        ref={cardRef}
                        className="relative w-20 h-20 cursor-grab active:cursor-grabbing select-none"
                        style={{
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
                        <div className={`absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full shadow-2xl transition-transform ${isDragging ? 'scale-95' : 'scale-100'}`}>
                            <div className={`absolute inset-1 rounded-full border-2 transition-colors duration-300 ${isDragging ? 'border-primary-light shadow-[0_0_15px_theme(colors.primary.light)]' : 'border-gray-600'}`}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    <div className="w-1 h-6 bg-gray-500 rounded-full absolute left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40"></div>
                                    <div className="w-6 h-1 bg-gray-500 rounded-full absolute left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40"></div>
                                    <div className={`text-2xl transform transition-transform ${isDragging ? 'scale-110' : 'scale-100'}`}>
                                        {isDragging ? '🚀' : '🎮'}
                                    </div>

                                </div>
                            </div>
                            <div className="absolute top-2 left-4 w-6 h-3 bg-white/10 rounded-[100%] rotate-[-20deg]"></div>
                        </div>
                        {isDragging && (
                            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl -z-10 animate-pulse"></div>
                        )}
                    </div>
                </div>

                {/* 피드백 오버레이 */}
                <div className={`absolute inset-0 flex items-center justify-center bg-black/60 z-20 rounded-2xl transition-all duration-300 ease-in-out ${feedback ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className={`transform text-center p-8 rounded-2xl transition-transform duration-300 ease-in-out glass-card border-0 ${feedback ? 'scale-100' : 'scale-95'} ${
                        feedback === 'correct' ? 'bg-success/70' :
                            feedback === 'timeout' ? 'bg-speed/70' : 'bg-danger/70'
                    }`}>
                        {feedback === 'correct' ? (
                            <>
                                <CheckCircle size={80} className="text-white mx-auto mb-4" />
                                <div className="text-3xl font-bold text-white">정답!</div>
                                {words[currentIndex].example && (
                                    <div className="mt-4 text-white text-lg font-medium bg-black/20 p-4 rounded-xl">
                                        <div>{words[currentIndex].example}</div>
                                        {words[currentIndex].example_meaning && (
                                            <div className="text-gray-300 text-base mt-2">
                                                {words[currentIndex].example_meaning}
                                            </div>
                                        )}
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
                                    <div className="mt-4 text-white text-lg font-medium bg-black/20 p-4 rounded-xl">
                                        <div>{words[currentIndex].example}</div>
                                        {words[currentIndex].example_meaning && (
                                            <div className="text-gray-300 text-base mt-2">
                                                {words[currentIndex].example_meaning}
                                            </div>
                                        )}
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
                                    <div className="mt-4 text-white text-lg font-medium bg-black/20 p-4 rounded-xl">
                                        <div>{words[currentIndex].example}</div>
                                        {words[currentIndex].example_meaning && (
                                            <div className="text-gray-300 text-base mt-2">
                                                {words[currentIndex].example_meaning}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
             <div className="glass-card p-6">
                <div className="text-center">

                    {description ? (
                        <div className="text-md font-medium text-gray-200 mb-1">
                            {description}
                        </div>
                    ) : (
                        <>
                            <div className="text-md font-medium text-gray-200 mb-1">
                                "Slow and steady wins the race"
                            </div>
                            <span className="inline-block px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full border border-white/10">
                                천천히 꾸준히 하는 사람이 결국 승리한다
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameScreen;
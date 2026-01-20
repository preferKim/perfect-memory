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
    isPaused,
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
                    onClick={togglePause}
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
                                    title={isPaused ? "계속" : "일시정지"}
                                    aria-label={isPaused ? "계속" : "일시정지"}
                                >
                                    {isPaused ? <Play size={20} /> : <Pause size={20} />}
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
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fish-body" x1="100" y1="300" x2="400" y2="300" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FF7F50" /> <stop offset="100%" stop-color="#FF4500" /> </linearGradient>
    <linearGradient id="fish-fin" x1="200" y1="200" x2="400" y2="400" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFA07A" /> 
      <stop offset="100%" stop-color="#FF6347" />
    </linearGradient>
    <linearGradient id="bubble-grad" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#AEEEEE" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#E0FFFF" stop-opacity="0.1"/>
    </linearGradient>
    <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5"/>
      <feOffset dx="2" dy="4" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.2"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="512" height="512" rx="120" fill="#E6F7FF" />

  <g filter="url(#soft-shadow)">
    <g transform="translate(256, 180)">
      <circle cx="0" cy="60" r="15" fill="url(#bubble-grad)">
        <animate attributeName="cy" values="60;55;60" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="-20" cy="20" r="12" fill="url(#bubble-grad)" opacity="0.9"/>
      <circle cx="0" cy="0" r="18" fill="url(#bubble-grad)" opacity="0.8"/>
      <circle cx="25" cy="-10" r="14" fill="url(#bubble-grad)" opacity="0.7"/>
      <circle cx="45" cy="-35" r="16" fill="url(#bubble-grad)" opacity="0.6"/>
      <circle cx="35" cy="-65" r="12" fill="url(#bubble-grad)" opacity="0.5"/>
      <circle cx="0" cy="-85" r="14" fill="url(#bubble-grad)" opacity="0.4">
         <animate attributeName="r" values="14;20;14" dur="3s" repeatCount="indefinite" />
         <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="-35" cy="-75" r="10" fill="url(#bubble-grad)" opacity="0.3"/>
    </g>

    <g transform="translate(60, 280) rotate(-10)">
      <path d="M 320 0 C 380 -40, 420 -80, 440 -40 C 460 0, 400 40, 320 40 C 400 80, 460 120, 440 160 C 420 200, 380 160, 320 100" fill="url(#fish-fin)" />
      <path d="M 180 -60 C 220 -120, 280 -120, 300 -40" fill="url(#fish-fin)" />
      <ellipse cx="200" cy="50" rx="160" ry="100" fill="url(#fish-body)" />
      <path d="M 200 150 C 220 200, 260 220, 280 180" fill="url(#fish-fin)" />
      
      <circle cx="80" cy="20" r="30" fill="white" stroke="#FF4500" stroke-width="4"/>
      <circle cx="140" cy="20" r="30" fill="white" stroke="#FF4500" stroke-width="4"/>
      <circle cx="75" cy="25" r="8" fill="#0F172A" />
      <circle cx="145" cy="15" r="8" fill="#0F172A" />
      <ellipse cx="110" cy="80" rx="15" ry="10" fill="#7c2d12" />
      <path d="M 180 -10 C 180 -10, 170 10, 190 20 C 210 30, 220 10, 220 -10" fill="#AEEEEE" opacity="0.8">
         <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
      </path>
    </g>
  </g>
</svg>
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
import React from 'react';
import { Heart, Clock } from 'lucide-react';

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const RankingScreen = ({
    rankings,
    onRestart,
    gameMode = 'speed',
    score = 0,
    wrongAnswers = 0,
    total = 0,
    lives = 0,
    time = 0,
}) => {
    const sortedRankings = [...rankings].sort((a, b) => b.score - a.score);

    const renderNormalModeResult = () => {
        const accuracy = total > 0 ? ((score / total) * 100).toFixed(1) : 0;
        return (
            <>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-primary-dark mb-4 leading-tight">
                    🎉 게임 결과 🎉
                </h2>
                <p className="text-gray-600 mb-8">수고하셨습니다!</p>

                <div className="rounded-xl border-2 border-normal-light bg-normal-light/20 p-6 space-y-4 text-left">
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-700">총점:</span>
                        <span className="text-3xl font-bold text-primary">{score} <span className="text-sm">점</span></span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-700">정답:</span>
                        <span className="text-2xl font-bold text-success-dark">{score} <span className="text-sm">개</span></span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-700">오답/타임아웃:</span>
                        <span className="text-2xl font-bold text-danger-dark">{total - score} <span className="text-sm">개</span></span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-700">정답률:</span>
                        <span className="text-2xl font-bold text-primary">{accuracy}%</span>
                    </div>
                </div>
            </>
        );
    };

    const renderSpeedModeResult = () => (
        <>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-speed-dark mb-4 leading-tight">
                🏆 스피드 모드 랭킹 🏆
            </h2>
            <p className="text-gray-600 mb-8">최고 점수에 도전하세요!</p>

            <div className="max-h-96 overflow-y-auto rounded-xl border-2 border-speed-light bg-speed-light/20 p-4 space-y-3">
                {sortedRankings.map((player, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold w-10">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                            </span>
                            <span className="text-lg font-bold text-gray-800">{player.name}</span>
                        </div>
                        <span className="text-2xl font-bold text-speed-dark">{player.score} <span className="text-sm">점</span></span>
                    </div>
                ))}
                {sortedRankings.length === 0 && (
                    <p className="text-gray-500 py-8">아직 랭킹이 없습니다.</p>
                )}
            </div>
        </>
    );

    const renderConnectModeResult = () => (
        <>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-connect-dark mb-4 leading-tight">
                {lives > 0 ? '✨ 게임 결과 ✨' : '😭 게임 실패 😭'}
            </h2>
            <p className="text-gray-600 mb-8">
                {lives > 0 ? '모든 단어를 성공적으로 연결했습니다!' : (
                    <>
                        단어 연결에 실패 하였습니다.
                        <br />
                        다시 도전하세요
                    </>
                )}
            </p>
    
            <div className="rounded-xl border-2 border-connect-light bg-connect-light/20 p-6 space-y-4 text-left">
                <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-700 flex items-center gap-2"><Heart className="text-danger-dark" /> 남은 목숨:</span>
                    <span className="text-3xl font-bold text-danger-dark">{lives} <span className="text-sm">개</span></span>
                </div>
                <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-700 flex items-center gap-2"><Clock className="text-primary" /> 소요 시간:</span>
                    <span className="text-3xl font-bold text-primary">{formatTime(time)}</span>
                </div>
            </div>
        </>
    );

    const getBorderColor = () => {
        if (gameMode === 'speed') return 'border-speed-light';
        if (gameMode === 'connect') return 'border-connect-light';
        return 'border-normal-light';
    }

    const renderContent = () => {
        switch(gameMode) {
            case 'speed':
                return renderSpeedModeResult();
            case 'connect':
                return renderConnectModeResult();
            default:
                return renderNormalModeResult();
        }
    }

    return (
        <div className={`bg-white rounded-3xl shadow-2xl p-6 sm:p-12 text-center border-4 ${getBorderColor()}`}>
            {renderContent()}

            <button
                onClick={onRestart}
                className="mt-8 px-8 py-4 bg-primary text-white text-lg font-bold rounded-2xl hover:bg-primary-dark transition shadow-lg active:shadow-none active:translate-y-1"
            >
                메인 화면으로 돌아가기
            </button>
        </div>
    );
};

export default RankingScreen;
import React from 'react';

const RankingScreen = ({
    rankings,
    onRestart,
    gameMode = 'speed',
    score = 0,
    wrongAnswers = 0,
    total = 0,
}) => {
    const sortedRankings = [...rankings].sort((a, b) => b.score - a.score);

    const renderNormalModeResult = () => {
        const accuracy = total > 0 ? ((score / total) * 100).toFixed(1) : 0;
        return (
            <>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-indigo-600 mb-4 leading-tight">
                    🎉 게임 결과 🎉
                </h2>
                <p className="text-gray-600 mb-8">수고하셨습니다!</p>

                <div className="rounded-xl border-2 border-indigo-100 bg-indigo-50 p-6 space-y-4 text-left">
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-700">총점:</span>
                        <span className="text-3xl font-bold text-indigo-500">{score} <span className="text-sm">점</span></span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-700">정답:</span>
                        <span className="text-2xl font-bold text-green-500">{score} <span className="text-sm">개</span></span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-700">오답/타임아웃:</span>
                        <span className="text-2xl font-bold text-red-500">{total - score} <span className="text-sm">개</span></span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-700">정답률:</span>
                        <span className="text-2xl font-bold text-blue-500">{accuracy}%</span>
                    </div>
                </div>
            </>
        );
    };

    const renderSpeedModeResult = () => (
        <>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-amber-600 mb-4 leading-tight">
                🏆 스피드 모드 랭킹 🏆
            </h2>
            <p className="text-gray-600 mb-8">최고 점수에 도전하세요!</p>

            <div className="max-h-96 overflow-y-auto rounded-xl border-2 border-amber-100 bg-amber-50 p-4 space-y-3">
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
                        <span className="text-2xl font-bold text-amber-500">{player.score} <span className="text-sm">점</span></span>
                    </div>
                ))}
                {sortedRankings.length === 0 && (
                    <p className="text-gray-500 py-8">아직 랭킹이 없습니다.</p>
                )}
            </div>
        </>
    );

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-12 text-center border-4 border-amber-200">
            {gameMode === 'speed' ? renderSpeedModeResult() : renderNormalModeResult()}

            <button
                onClick={onRestart}
                className="mt-8 px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg active:shadow-none active:translate-y-1"
            >
                메인 화면으로 돌아가기
            </button>
        </div>
    );
};

export default RankingScreen;

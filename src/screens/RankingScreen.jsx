import React from 'react';

const RankingScreen = ({ rankings, onRestart }) => {
    const sortedRankings = [...rankings].sort((a, b) => b.score - a.score);

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-12 text-center border-4 border-amber-200">
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
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
    const navigate = useNavigate();
    const sortedRankings = [...rankings].sort((a, b) => b.score - a.score);

    const renderNormalModeResult = () => {
        const accuracy = total > 0 ? ((score / total) * 100).toFixed(1) : 0;
        return (
            <>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
                    🎉 게임 결과 🎉
                </h2>
                <p className="text-gray-300 mb-8">수고하셨습니다!</p>

                <div className="rounded-xl bg-black/10 p-6 space-y-4 text-left border border-white/10">
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-200">총점:</span>
                        <span className="text-3xl font-bold text-primary-light">{score} <span className="text-sm">점</span></span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-200">정답:</span>
                        <span className="text-2xl font-bold text-success-light">{score} <span className="text-sm">개</span></span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-200">오답/타임아웃:</span>
                        <span className="text-2xl font-bold text-danger-light">{total - score} <span className="text-sm">개</span></span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-gray-200">정답률:</span>
                        <span className="text-2xl font-bold text-primary-light">{accuracy}%</span>
                    </div>
                </div>
            </>
        );
    };

    const renderSpeedModeResult = () => (
        <>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
                🏆 경쟁 모드 랭킹 🏆
            </h2>
            <p className="text-gray-300 mb-8">최고 점수에 도전하세요!</p>

            <div className="max-h-96 overflow-y-auto rounded-xl bg-black/10 p-4 space-y-3 border border-white/10">
                {sortedRankings.map((player, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between bg-white/5 p-4 rounded-lg"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold w-10 text-white">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                            </span>
                            <span className="text-lg font-bold text-gray-100">{player.name}</span>
                        </div>
                        <span className="text-2xl font-bold text-speed-light">{player.score} <span className="text-sm">점</span></span>
                    </div>
                ))}
                {sortedRankings.length === 0 && (
                    <p className="text-gray-400 py-8">아직 랭킹이 없습니다.</p>
                )}
            </div>
        </>
    );

    const renderConnectModeResult = () => (
        <>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
                {lives > 0 ? '✨ 게임 결과 ✨' : '😭 게임 실패 😭'}
            </h2>
            <p className="text-gray-300 mb-8">
                {lives > 0 ? '모든 단어를 성공적으로 연결했습니다!' : (
                    <>
                        단어 연결에 실패 하였습니다.
                        <br />
                        다시 도전하세요
                    </>
                )}
            </p>
    
            <div className="rounded-xl bg-black/10 p-6 space-y-4 text-left border border-white/10">
                <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-200 flex items-center gap-2"><Heart className="text-danger-light" /> 남은 목숨:</span>
                    <span className="text-3xl font-bold text-danger-light">{lives} <span className="text-sm">개</span></span>
                </div>
                <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-200 flex items-center gap-2"><Clock className="text-primary-light" /> 소요 시간:</span>
                    <span className="text-3xl font-bold text-primary-light">{formatTime(time)}</span>
                </div>
            </div>
        </>
    );

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
        <div className="glass-card p-6 sm:p-12 text-center">
            {renderContent()}

            <div className="mt-8 flex justify-center gap-4">
                <Button
                    onClick={() => navigate('/')}
                    variant="threedee"
                    color="normal"
                    className="px-8 py-4 text-lg"
                >
                    메인으로
                </Button>
                <Button
                    onClick={onRestart}
                    variant="threedee"
                    color="primary"
                    className="px-8 py-4 text-lg"
                >
                    다시하기
                </Button>
            </div>
        </div>
    );
};

export default RankingScreen;
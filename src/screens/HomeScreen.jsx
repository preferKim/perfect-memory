import React, { useState } from 'react';

const HomeScreen = ({ onStartGame, isLoading }) => {
    const [gameMode, setGameMode] = useState('normal');
    const [playerName, setPlayerName] = useState('');

    const isStartDisabled = isLoading || (gameMode === 'speed' && !playerName);

    const InfoCard = ({ icon, title, description }) => (
        <div className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm">
            <div className="text-3xl">{icon}</div>
            <div>
                <div className="font-bold text-gray-800">{title}</div>
                <div className="text-gray-500 text-sm">{description}</div>
            </div>
        </div>
    );

    const renderModeInfo = () => {
        switch (gameMode) {
            case 'normal':
                return <InfoCard icon="🎓" title="일반 모드" description="발음을 듣고, 뜻을 확인하며 단어를 암기해보세요." />;
            case 'speed':
                return <InfoCard icon="⚡️" title="경쟁 모드" description="100초 동안 최대한 많은 문제를 풀어보세요. 오답 시 점수가 차감됩니다." />;
            case 'connect':
                return <InfoCard icon="🔗" title="연결 모드" description="제시된 단어와 뜻을 올바르게 연결하세요. 목숨은 3개입니다." />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-12 text-center border-4 border-normal-light">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-primary-dark mb-4 leading-tight break-words tracking-tight animate-bounce">
                Perfect Memory
            </h2>
            <p className="text-sm text-gray-600 mb-8 font-medium">
                망각 곡선에 맞춘 게임방식 암기법
            </p>
            
            <div className="mb-6">
                <p className="text-xl font-bold text-primary-dark mb-4">1. 게임 모드를 선택하세요!</p>
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setGameMode('normal')}
                        className={`px-6 py-3 rounded-xl font-bold transition ${
                            gameMode === 'normal' 
                                ? 'bg-normal-light text-gray-800 shadow-lg scale-105' 
                                : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                        🎓<br />일반<br />모드
                    </button>
                    <button
                        onClick={() => setGameMode('speed')}
                        className={`px-6 py-3 rounded-xl font-bold transition ${
                            gameMode === 'speed' 
                                ? 'bg-speed-light text-gray-800 shadow-lg scale-105' 
                                : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                        ⚡️<br />경쟁<br />모드
                    </button>
                    <button
                        onClick={() => setGameMode('connect')}
                        className={`px-6 py-3 rounded-xl font-bold transition ${
                            gameMode === 'connect'
                                ? 'bg-connect-light text-gray-800 shadow-lg scale-105'
                                : 'bg-gray-200 text-gray-600'
                        }`}
                    >
                        🔗<br />연결<br />모드
                    </button>
                </div>
            </div>

            <div className="bg-normal-light/30 rounded-2xl p-6 mb-6 text-left max-w-md mx-auto border-2 border-normal-light/60">
                {renderModeInfo()}
            </div>

            {gameMode === 'speed' && (
                <div className="mb-6">
                    <label htmlFor="playerName" className="text-xl font-bold text-primary-dark mb-4 block">2. 도전자의 이름을 알려주세요!</label>
                    <input
                        id="playerName"
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="예: 아이유"
                        className="w-full max-w-xs mx-auto px-4 py-3 text-center text-lg font-medium border-2 border-normal-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                </div>
            )}

            <div className="mb-4">
                <p className="text-xl font-bold text-primary-dark mb-4">
                    {gameMode === 'speed' ? '3. ' : '2. '}
                    도전할 레벨을 골라보세요!
                </p>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => onStartGame(playerName, 'easy', gameMode)}
                        disabled={isStartDisabled}
                        className="px-2 py-4 bg-success text-gray-800 text-sm font-bold rounded-2xl hover:bg-success-dark transition shadow-[0_4px_0_theme(colors.success.dark)] active:shadow-none active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🐣<br/>병아리반
                    </button>
                    <button
                        onClick={() => onStartGame(playerName, 'medium', gameMode)}
                        disabled={isStartDisabled}
                        className="px-2 py-4 bg-speed text-gray-800 text-sm font-bold rounded-2xl hover:bg-speed-dark transition shadow-[0_4px_0_theme(colors.speed.dark)] active:shadow-none active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🐰<br/>토끼반
                    </button>
                    <button
                        onClick={() => onStartGame(playerName, 'hard', gameMode)}
                        disabled={isStartDisabled}
                        className="px-2 py-4 bg-danger text-gray-800 text-sm font-bold rounded-2xl hover:bg-danger-dark transition shadow-[0_4px_0_theme(colors.danger.dark)] active:shadow-none active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🐯<br/>호랑이반
                    </button>
                </div>
                {isLoading && (
                    <p className="text-primary mt-4 font-medium animate-pulse">단어 카드를 가져오고 있어요...</p>
                )}
                {gameMode === 'speed' && !playerName && (
                    <p className="text-danger-dark mt-4 font-medium">경쟁 모드는 이름 입력이 필수입니다.</p>
                )}
            </div>
        </div>
    );
};

export default HomeScreen;

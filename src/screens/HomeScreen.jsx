import React from 'react';

const HomeScreen = ({ onStartGame, isLoading }) => {
    return (
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
                        onClick={() => onStartGame('easy')}
                        disabled={isLoading}
                        className="px-2 py-4 bg-green-400 text-white text-sm font-bold rounded-2xl hover:bg-green-500 transition shadow-[0_4px_0_rgb(34,197,94)] active:shadow-none active:translate-y-[4px] disabled:opacity-50"
                    >
                        🐣<br/>병아리반
                    </button>
                    <button
                        onClick={() => onStartGame('medium')}
                        disabled={isLoading}
                        className="px-2 py-4 bg-yellow-400 text-white text-sm font-bold rounded-2xl hover:bg-yellow-500 transition shadow-[0_4px_0_rgb(234,179,8)] active:shadow-none active:translate-y-[4px] disabled:opacity-50"
                    >
                        🐰<br/>토끼반
                    </button>
                    <button
                        onClick={() => onStartGame('hard')}
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
    );
};

export default HomeScreen;

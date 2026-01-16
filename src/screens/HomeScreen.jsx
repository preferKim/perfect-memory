import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { supabase } from '../supabaseClient';

const HomeScreen = ({ onStartGame, onSignUp, onLogin, onLogout, isLoading, user }) => {
    const [gameMode, setGameMode] = useState('normal');
    const [playerName, setPlayerName] = useState('');
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        if (user?.user_metadata?.name) {
            setPlayerName(user.user_metadata.name);
        } else {
            setPlayerName('');
        }
    }, [user]);

    const isStartDisabled = isLoading || (gameMode === 'speed' && !playerName);

    const InfoCard = ({ icon, title, description }) => (
        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl">
            <div className="text-3xl">{icon}</div>
            <div>
                <div className="font-bold text-gray-100">{title}</div>
                <div className="text-gray-300 text-sm">{description}</div>
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

    const handleAuthSubmit = (e) => {
        if (e) e.preventDefault();
        if (authMode === 'signup') {
            onSignUp(email, password, nickname);
        } else {
            onLogin(email, password);
        }
        setIsAuthOpen(false);
    };

    const handleOAuthLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
    };

    if (isAuthOpen) {
        return (
            <div className="glass-card p-6 sm:p-12 text-center">
                <h2 className="text-3xl font-bold text-white mb-8">
                    {authMode === 'login' ? '로그인' : '회원가입'}
                </h2>
                <form onSubmit={handleAuthSubmit} className="max-w-xs mx-auto space-y-4">
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-primary focus:outline-none transition-colors"
                        required
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-primary focus:outline-none transition-colors"
                        required
                    />
                    {authMode === 'signup' && (
                    <input
                        type="text"
                        placeholder="닉네임"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-primary focus:outline-none transition-colors"
                        required
                    />
                    )}
                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <Button onClick={() => setIsAuthOpen(false)} variant="threedee" color="secondary">취소</Button>
                        <Button type="submit" variant="threedee" color="primary">
                            {authMode === 'login' ? '로그인' : '가입하기'}
                        </Button>
                    </div>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-gray-800 px-2 text-sm text-gray-400">또는</span>
                        </div>
                    </div>
                    <Button onClick={handleOAuthLogin} variant="threedee" color="google" className="w-full">
                        구글로 로그인
                    </Button>
                    <div className="mt-4 text-sm text-gray-300">
                        {authMode === 'login' ? (
                            <p>계정이 없으신가요? <button type="button" onClick={() => setAuthMode('signup')} className="text-primary-light hover:underline font-bold ml-1">회원가입</button></p>
                        ) : (
                            <p>이미 계정이 있으신가요? <button type="button" onClick={() => setAuthMode('login')} className="text-primary-light hover:underline font-bold ml-1">로그인</button></p>
                        )}
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 sm:p-12 text-center relative">
            <div className="absolute top-4 right-4 z-10">
                {!user ? (
                    <button 
                        onClick={() => { setIsAuthOpen(true); setAuthMode('login'); }}
                        className="text-sm font-semibold text-gray-200 hover:text-white px-4 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all"
                    >
                        로그인
                    </button>
                ) : (
                    <button 
                        onClick={onLogout}
                        className="text-sm font-semibold text-gray-200 hover:text-white px-4 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all"
                    >
                        로그아웃
                    </button>
                )}
            </div>
            <img src="/images/logo.svg" alt="Perfect Memory Logo" className="w-full max-w-sm mx-auto mb-4" />
            <p className="text-sm text-gray-300 mb-8 font-medium">
                망각 곡선에 맞춘 게임방식 암기법
            </p>
            
            {user && (
                <div className="mb-8">
                    <p className="text-2xl font-bold text-primary-light">
                        {user.user_metadata?.name || '사용자'} 님 환영합니다.
                    </p>
                </div>
            )}

            <div className="mb-6">
                <p className="text-xl font-bold text-white mb-4">1. 게임 모드를 선택하세요!</p>
                <div className="flex justify-center gap-2">
                    <Button
                        onClick={() => setGameMode('normal')}
                        variant="mode"
                        mode="normal"
                        isActive={gameMode === 'normal'}
                    >
                        🎓<br />일반<br />모드
                    </Button>
                    <Button
                        onClick={() => setGameMode('speed')}
                        variant="mode"
                        mode="speed"
                        isActive={gameMode === 'speed'}
                    >
                        ⚡️<br />경쟁<br />모드
                    </Button>
                    <Button
                        onClick={() => setGameMode('connect')}
                        variant="mode"
                        mode="connect"
                        isActive={gameMode === 'connect'}
                    >
                        🔗<br />연결<br />모드
                    </Button>
                </div>
            </div>

            <div className="bg-black/10 rounded-2xl p-6 mb-6 text-left max-w-md mx-auto border-2 border-white/10">
                {renderModeInfo()}
            </div>

            {gameMode === 'speed' && (
                <div className="mb-6">
                    <label htmlFor="playerName" className="text-xl font-bold text-white mb-4 block">2. 도전자의 이름을 알려주세요!</label>
                    <input
                        id="playerName"
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="예: 아이유"
                        className="w-full max-w-xs mx-auto px-4 py-3 text-center text-lg font-medium bg-white/5 border-2 border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                </div>
            )}

            <div className="mb-4">
                <p className="text-xl font-bold text-white mb-4">
                    {gameMode === 'speed' ? '3. ' : '2. '}
                    도전할 레벨을 골라보세요!
                </p>
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        onClick={() => onStartGame(playerName, 'easy', gameMode)}
                        disabled={isStartDisabled}
                        variant="threedee"
                        color="primary"
                    >
                        🐣<br/>병아리반
                    </Button>
                    <Button
                        onClick={() => onStartGame(playerName, 'medium', gameMode)}
                        disabled={isStartDisabled}
                        variant="threedee"
                        color="secondary"
                    >
                        🐰<br/>토끼반
                    </Button>
                    <Button
                        onClick={() => onStartGame(playerName, 'hard', gameMode)}
                        disabled={isStartDisabled}
                        variant="threedee"
                        color="danger"
                    >
                        🐯<br/>호랑이반
                    </Button>
                </div>
                {isLoading && (
                    <p className="text-primary-light mt-4 font-medium animate-pulse">단어 카드를 가져오고 있어요...</p>
                )}
                {gameMode === 'speed' && !playerName && (
                    <p className="text-danger-light mt-4 font-medium">경쟁 모드는 이름 입력이 필수입니다.</p>
                )}
            </div>
        </div>
    );
};

export default HomeScreen;

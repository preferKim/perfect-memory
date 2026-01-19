import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { supabase } from '../supabaseClient';
import PlayerStats from '../components/PlayerStats';

const SubjectScreen = ({ onSubjectSelect, onSignUp, onLogin, onLogout, user, onNavigate }) => {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');

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

    const handleSubjectClick = (subject) => {
        if (subject === 'english' || subject === 'math') {
            onSubjectSelect(subject);
        } else {
            alert('아직 준비되지 않은 과목입니다.');
        }
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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onNavigate('tamagotchi')}
                            className="text-sm font-semibold text-gray-200 hover:text-white px-4 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all"
                        >
                            다마고찌
                        </button>
                        <button 
                            onClick={onLogout}
                            className="text-sm font-semibold text-gray-200 hover:text-white px-4 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all"
                        >
                            로그아웃
                        </button>
                    </div>
                )}
            </div>
            <img src="/images/logo.svg" alt="Perfect Memory Logo" className="w-full max-w-sm mx-auto" />
            <p className="text-sm text-gray-300 mb-2 font-medium">
                망각 곡선에 맞춘 게임방식 암기법
            </p>
            
            {user && (
                <div className="mb-8">
                    <PlayerStats className="mb-4" />
                    <p className="text-2xl font-bold text-primary-light">
                        {user.user_metadata?.name || '사용자'} 님 환영합니다.
                    </p>
                </div>
            )}

            <div className="mb-6">
                <p className="text-xl font-bold text-white mb-4">학습할 과목을 선택하세요!</p>
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                    <Button onClick={() => handleSubjectClick('korean')} variant="threedee" color="secondary" className="w-full h-28 flex flex-col items-center justify-center" disabled={true}>
                        <span className="text-2xl">📖</span><br/>국어<br/><span className="text-sm font-light opacity-70">준비중</span>
                    </Button>
                    <Button onClick={() => handleSubjectClick('english')} variant="threedee" color="primary" className="w-full h-28 flex flex-col items-center justify-center">
                        <span className="text-2xl">🔤</span><br/>영어
                    </Button>
                    <Button onClick={() => handleSubjectClick('math')} variant="threedee" color="danger" className="w-full h-28 flex flex-col items-center justify-center">
                        <span className="text-2xl">➕</span><br/>수학
                    </Button>
                    <Button onClick={() => handleSubjectClick('social')} variant="threedee" color="success" className="w-full h-28 flex flex-col items-center justify-center" disabled={true}>
                        <span className="text-2xl">🏛️</span><br/>사회<br/><span className="text-sm font-light opacity-70">준비중</span>
                    </Button>
                    <Button onClick={() => handleSubjectClick('science')} variant="threedee" color="speed" className="w-full h-28 flex flex-col items-center justify-center" disabled={true}>
                        <span className="text-2xl">🔬</span><br/>과학<br/><span className="text-sm font-light opacity-70">준비중</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};
export default SubjectScreen;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../context/PlayerContext';
import { X, BarChart3, ChevronRight } from 'lucide-react';

const HeaderSection = () => {
    const navigate = useNavigate();
    const { tier, tierConfig, nextTierInfo, xp } = usePlayer();
    const { user, loading, signInWithOAuth, signOut } = useAuth();
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const handleOAuthLogin = async () => {
        await signInWithOAuth('google');
    };

    const handleLogout = async () => {
        await signOut();
    };

    if (isAuthOpen) {
        return (
            <div className="glass-card p-6 sm:p-12 text-center relative">
                <button
                    onClick={() => setIsAuthOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>
                <h2 className="text-3xl font-bold text-white mb-4">
                    로그인
                </h2>
                <p className="text-gray-300 mb-8">
                    구글 계정으로 간편하게 시작하세요
                </p>
                <div className="max-w-xs mx-auto space-y-4">
                    <Button onClick={handleOAuthLogin} variant="threedee" color="google" className="w-full">
                        <svg className="w-5 h-5 mr-2 inline-block" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        구글로 로그인
                    </Button>
                    <Button onClick={() => setIsAuthOpen(false)} variant="threedee" color="secondary" className="w-full">
                        취소
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="absolute top-4 right-4 z-10">
                {loading ? (
                    <div className="text-sm text-gray-400">...</div>
                ) : !user ? (
                    <button
                        onClick={() => setIsAuthOpen(true)}
                        className="text-sm font-semibold text-gray-200 hover:text-white px-4 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all"
                    >
                        로그인
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLogout}
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
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full mb-6 p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/30 hover:border-emerald-400/50 rounded-2xl transition-all duration-300 group cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">
                                {tierConfig?.emoji || '🥉'}
                            </div>
                            <div className="text-left">
                                <p className="text-lg font-bold text-white">
                                    {user.user_metadata?.name || user.email?.split('@')[0] || '사용자'}
                                </p>
                                <p className="text-sm text-emerald-300">{tierConfig?.label || '브론즈'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-300 group-hover:text-white transition-colors">
                            <BarChart3 size={20} />
                            <span className="text-sm font-medium">대시보드</span>
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                    {nextTierInfo && (
                        <>
                            <div className="mt-3 w-full bg-black/20 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${nextTierInfo.levelsNeeded > 0 ? Math.max(0, 100 - (nextTierInfo.levelsNeeded * 25)) : 100}%` }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-400">
                                {nextTierInfo.nextTier
                                    ? `${nextTierInfo.nextTierConfig?.label}까지 최소 레벨 ${nextTierInfo.levelsNeeded} 상승 필요`
                                    : '최고 등급 달성! 🎉'
                                }
                            </p>
                        </>
                    )}
                    <div className="mt-2 flex justify-end">
                        <p className="text-sm font-bold text-yellow-400 bg-black/40 px-3 py-1 rounded-full border border-yellow-400/30">
                            ✨ 총 XP: {(xp || 0).toLocaleString()}
                        </p>
                    </div>
                </button>
            )}
        </>
    );
};

export default HeaderSection;

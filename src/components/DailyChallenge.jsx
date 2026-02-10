import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Flame, Gift, Calendar, TrendingUp } from 'lucide-react';

/**
 * 연속 학습 및 스트릭 보너스를 표시하는 카드 컴포넌트
 */
const DailyChallenge = ({ className = '' }) => {
    const { streakCount, longestStreak, streakBonus, lastStudyDate } = usePlayer();

    // 오늘 학습 여부 확인
    const today = new Date().toISOString().split('T')[0];
    const studiedToday = lastStudyDate === today;

    // 스트릭 밀리스톤
    const milestones = [3, 7, 14, 30];
    const nextMilestone = milestones.find(m => m > streakCount) || 30;
    const progressToMilestone = (streakCount % nextMilestone) / nextMilestone * 100;

    return (
        <div className={`glass-card p-4 ${className}`}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary-light" />
                연속 학습
            </h3>

            {/* 스트릭 현황 */}
            <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className={`text-4xl ${streakCount > 0 ? 'animate-flame' : ''}`}>
                        {streakCount > 0 ? '🔥' : '❄️'}
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white">{streakCount}일</div>
                        <div className="text-sm text-gray-300">
                            {studiedToday ? '오늘 학습 완료!' : '오늘 학습하세요!'}
                        </div>
                    </div>
                </div>

                {streakBonus.bonus > 0 && (
                    <div className="text-right">
                        <div className="text-xl font-bold text-orange-300">{streakBonus.label}</div>
                        <div className="text-sm text-gray-400">XP 보너스</div>
                    </div>
                )}
            </div>

            {/* 다음 마일스톤까지 */}
            {streakCount < 30 && (
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">다음 보너스까지</span>
                        <span className="text-primary-light font-bold">{nextMilestone - (streakCount % nextMilestone)}일</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all"
                            style={{ width: `${progressToMilestone}%` }}
                        />
                    </div>
                </div>
            )}

            {/* 최장 스트릭 */}
            <div className="flex items-center justify-between text-sm bg-black/20 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-gray-300">
                    <TrendingUp size={16} className="text-green-400" />
                    최장 기록
                </div>
                <div className="font-bold text-white">{longestStreak}일</div>
            </div>

            {/* 스트릭 보너스 안내 */}
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                {[
                    { days: 3, bonus: '+10%' },
                    { days: 7, bonus: '+20%' },
                    { days: 14, bonus: '+30%' },
                    { days: 30, bonus: '+50%' }
                ].map(({ days, bonus }) => (
                    <div
                        key={days}
                        className={`rounded-lg py-2 px-1 ${streakCount >= days
                            ? 'bg-orange-500/30 border border-orange-500/50'
                            : 'bg-black/20 opacity-60'
                            }`}
                    >
                        <div className="text-xs text-gray-400">{days}일</div>
                        <div className={`text-sm font-bold ${streakCount >= days ? 'text-orange-300' : 'text-gray-500'}`}>
                            {bonus}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyChallenge;

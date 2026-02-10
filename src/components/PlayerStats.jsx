import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Flame, ChevronUp } from 'lucide-react';

// 과목 설정
const SUBJECT_CONFIG = {
    english: { emoji: '🇬🇧', name: '영어', color: 'primary' },
    math: { emoji: '➕', name: '수학', color: 'speed' },
    social: { emoji: '🏛️', name: '사회', color: 'info' },
    science: { emoji: '🔬', name: '과학', color: 'warning' },
    korean: { emoji: '📖', name: '국어', color: 'success' },
    certificate: { emoji: '💻', name: '자격증', color: 'purple' },
};

const PlayerStats = ({ className = '', showSubjects = false }) => {
    const {
        tier,
        tierConfig,
        streakCount,
        streakBonus,
        subjectStats,
        getSubjectProgress,
        CORE_SUBJECTS,
        nextTierInfo,
    } = usePlayer();

    // 핵심 과목 중 가장 낮은 레벨
    const minLevel = Math.min(...CORE_SUBJECTS.map(s => subjectStats[s]?.level || 1));

    return (
        <div className={`glass-card p-4 ${className}`}>
            {/* 티어 & 연속 학습 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{tierConfig.emoji}</span>
                    <div>
                        <div className="font-bold text-white text-lg">{tierConfig.label} 티어</div>
                        <div className="text-xs text-gray-400">최소 Lv.{minLevel}</div>
                    </div>
                </div>
                {streakCount > 0 && (
                    <div className="flex items-center gap-1 bg-orange-500/20 px-3 py-1.5 rounded-full">
                        <Flame size={18} className="text-orange-400" />
                        <span className="font-bold text-orange-300">{streakCount}일</span>
                        {streakBonus.bonus > 0 && (
                            <span className="text-xs text-orange-400 ml-1">{streakBonus.label}</span>
                        )}
                    </div>
                )}
            </div>

            {/* 다음 티어 안내 */}
            {nextTierInfo && (
                <div className="bg-white/5 rounded-lg px-3 py-2 mb-3 flex items-center gap-2 text-sm">
                    <ChevronUp size={16} className="text-primary-light" />
                    <span className="text-gray-300">
                        <strong className="text-white">{SUBJECT_CONFIG[nextTierInfo.weakestSubject]?.name}</strong>을
                        Lv.{nextTierInfo.nextTierConfig.minLevel}까지 올리면
                        <span className="text-primary-light ml-1">{nextTierInfo.nextTierConfig.emoji} {nextTierInfo.nextTierConfig.label}</span>
                    </span>
                </div>
            )}

            {/* 과목별 레벨 (옵션) */}
            {showSubjects && (
                <div className="space-y-2">
                    {CORE_SUBJECTS.map(subject => {
                        const config = SUBJECT_CONFIG[subject];
                        const stats = subjectStats[subject];
                        const progress = getSubjectProgress(subject);

                        return (
                            <div key={subject} className="flex items-center gap-2">
                                <span className="text-lg w-6">{config.emoji}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-0.5">
                                        <span className="text-gray-300">{config.name}</span>
                                        <span className="text-white font-bold">Lv.{stats.level}</span>
                                    </div>
                                    <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-${config.color} rounded-full transition-all duration-300`}
                                            style={{ width: `${Math.min(progress.percent, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PlayerStats;

import React from 'react';
import { usePlayer } from '../context/PlayerContext';

// 과목 설정
const SUBJECT_CONFIG = {
    english: { emoji: '🇬🇧', name: '영어', color: '#6366f1' },
    math: { emoji: '➕', name: '수학', color: '#f59e0b' },
    social: { emoji: '🏛️', name: '사회', color: '#3b82f6' },
    science: { emoji: '🔬', name: '과학', color: '#eab308' },
    korean: { emoji: '📖', name: '국어', color: '#22c55e' },
};

/**
 * 과목별 레벨을 시각적으로 표시하는 컴포넌트
 * 레이더 차트 형식 대신 간단한 진행 바 형식으로 구현
 */
const SubjectLevels = ({ className = '' }) => {
    const { subjectStats, getSubjectProgress, CORE_SUBJECTS, tier, tierConfig } = usePlayer();

    return (
        <div className={`glass-card p-4 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">과목별 레벨</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xl">{tierConfig.emoji}</span>
                    <span className="text-sm font-medium text-gray-300">{tierConfig.label}</span>
                </div>
            </div>

            <div className="space-y-3">
                {CORE_SUBJECTS.map(subject => {
                    const config = SUBJECT_CONFIG[subject];
                    const stats = subjectStats[subject];
                    const progress = getSubjectProgress(subject);

                    return (
                        <div key={subject} className="flex items-center gap-3">
                            <span className="text-lg w-7">{config.emoji}</span>
                            <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">{config.name}</span>
                                    <span className="text-white font-bold">Lv.{stats.level}</span>
                                </div>
                                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: `${Math.min(progress.percent, 100)}%`,
                                            backgroundColor: config.color,
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                                    <span>{stats.xp} XP</span>
                                    <span>{progress.remainXp} XP 남음</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubjectLevels;

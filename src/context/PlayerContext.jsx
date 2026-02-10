
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

// 과목 목록 (통합 레벨 대상)
const CORE_SUBJECTS = ['english', 'math', 'social', 'science', 'korean'];
// 기타 과목 (통합 레벨에서 제외)
const OTHER_SUBJECTS = ['certificate'];
const ALL_SUBJECTS = [...CORE_SUBJECTS, ...OTHER_SUBJECTS];

// 레벨업에 필요한 누적 XP 계산: N × (N-1) × 5
// Level 1 -> 2: 10 XP, Level 2 -> 3: 30 XP 누적, etc.
const calculateCumulativeXpForLevel = (level) => {
  return level * (level - 1) * 5;
};

// XP로부터 레벨 계산
const calculateLevelFromXp = (xp) => {
  // 역산: level = (1 + sqrt(1 + xp/5)) / 2 (근사)
  // 간단히 순차 탐색
  let level = 1;
  while (calculateCumulativeXpForLevel(level + 1) <= xp && level < 20) {
    level++;
  }
  return level;
};

// 티어 계산 (핵심 과목의 최소 레벨 기반)
const TIER_CONFIG = {
  diamond: { minLevel: 20, label: '다이아몬드', emoji: '💎', color: 'cyan' },
  platinum: { minLevel: 15, label: '플래티넘', emoji: '🏆', color: 'purple' },
  gold: { minLevel: 10, label: '골드', emoji: '🥇', color: 'yellow' },
  silver: { minLevel: 5, label: '실버', emoji: '🥈', color: 'gray' },
  bronze: { minLevel: 1, label: '브론즈', emoji: '🥉', color: 'orange' },
};

const calculateTier = (subjectStats) => {
  const coreLevels = CORE_SUBJECTS.map(s => subjectStats[s]?.level || 1);
  const minLevel = Math.min(...coreLevels);

  if (minLevel >= 20) return 'diamond';
  if (minLevel >= 15) return 'platinum';
  if (minLevel >= 10) return 'gold';
  if (minLevel >= 5) return 'silver';
  return 'bronze';
};

// 연속 학습 보너스 계산
const STREAK_BONUSES = [
  { days: 30, bonus: 0.5, label: '+50%' },
  { days: 14, bonus: 0.3, label: '+30%' },
  { days: 7, bonus: 0.2, label: '+20%' },
  { days: 3, bonus: 0.1, label: '+10%' },
];

const getStreakBonus = (streakCount) => {
  for (const tier of STREAK_BONUSES) {
    if (streakCount >= tier.days) {
      return tier;
    }
  }
  return { days: 0, bonus: 0, label: '' };
};

export const PlayerProvider = ({ children }) => {
  const { user: currentUser } = useAuth();

  // 과목별 통계
  const [subjectStats, setSubjectStats] = useState(() => {
    const initial = {};
    ALL_SUBJECTS.forEach(s => {
      initial[s] = { xp: 0, level: 1 };
    });
    return initial;
  });

  // 연속 학습
  const [streakCount, setStreakCount] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState(null);
  const [longestStreak, setLongestStreak] = useState(0);

  // 레벨업 알림
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [levelUpSubject, setLevelUpSubject] = useState(null);

  // 약점 단어 (기존 유지)
  const [weakWords, setWeakWords] = useState(() => {
    const saved = localStorage.getItem('weakWords');
    return saved ? JSON.parse(saved) : {};
  });

  // 티어 계산 (메모이제이션)
  const tier = useMemo(() => calculateTier(subjectStats), [subjectStats]);
  const tierConfig = TIER_CONFIG[tier];

  // 다음 티어까지 필요한 레벨
  const nextTierInfo = useMemo(() => {
    const coreLevels = CORE_SUBJECTS.map(s => subjectStats[s]?.level || 1);
    const minLevel = Math.min(...coreLevels);
    const weakestSubject = CORE_SUBJECTS.find(s => subjectStats[s]?.level === minLevel);

    const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentTierIdx = tierOrder.indexOf(tier);
    const nextTier = tierOrder[currentTierIdx + 1];

    if (!nextTier) return null;

    const nextTierMinLevel = TIER_CONFIG[nextTier].minLevel;
    const levelsNeeded = nextTierMinLevel - minLevel;

    return {
      nextTier,
      nextTierConfig: TIER_CONFIG[nextTier],
      weakestSubject,
      levelsNeeded,
    };
  }, [subjectStats, tier]);

  // 연속 학습 보너스
  const streakBonus = useMemo(() => getStreakBonus(streakCount), [streakCount]);

  // 데이터 로드
  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (!currentUser) {
        // Reset to defaults
        const initial = {};
        ALL_SUBJECTS.forEach(s => {
          initial[s] = { xp: 0, level: 1 };
        });
        setSubjectStats(initial);
        setStreakCount(0);
        setLastStudyDate(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching player stats:', error);
        return;
      }

      if (data) {
        const stats = {};
        ALL_SUBJECTS.forEach(s => {
          const xp = data[`${s}_xp`] || 0;
          const level = data[`${s}_level`] || 1;
          stats[s] = { xp, level };
        });
        setSubjectStats(stats);
        setStreakCount(data.streak_count || 0);
        setLastStudyDate(data.last_study_date);
        setLongestStreak(data.longest_streak || 0);
      }
    };

    fetchPlayerStats();
  }, [currentUser]);

  // 연속 학습 체크 및 업데이트
  const checkAndUpdateStreak = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    if (lastStudyDate === today) {
      // 오늘 이미 학습함
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastStudyDate === yesterdayStr) {
      // 어제 학습 -> 연속 유지
      newStreak = streakCount + 1;
    }

    const newLongest = Math.max(longestStreak, newStreak);

    setStreakCount(newStreak);
    setLastStudyDate(today);
    setLongestStreak(newLongest);

    if (currentUser) {
      await supabase
        .from('profiles')
        .update({
          streak_count: newStreak,
          last_study_date: today,
          longest_streak: newLongest,
        })
        .eq('user_id', currentUser.id);
    }
  }, [currentUser, lastStudyDate, streakCount, longestStreak]);

  // XP 추가 (과목별)
  const addXp = useCallback(async (subject, amount = 1) => {
    if (!ALL_SUBJECTS.includes(subject)) {
      console.warn(`Unknown subject: ${subject}`);
      return;
    }

    // 연속 학습 체크
    await checkAndUpdateStreak();

    // 보너스 적용
    const bonusMultiplier = 1 + streakBonus.bonus;
    const finalAmount = Math.floor(amount * bonusMultiplier);

    setJustLeveledUp(false);
    setLevelUpSubject(null);

    setSubjectStats(prev => {
      const currentStats = prev[subject];
      const newXp = currentStats.xp + finalAmount;
      const newLevel = calculateLevelFromXp(newXp);

      if (newLevel > currentStats.level) {
        setJustLeveledUp(true);
        setLevelUpSubject(subject);
      }

      return {
        ...prev,
        [subject]: { xp: newXp, level: newLevel },
      };
    });

    // DB 업데이트
    if (currentUser) {
      const currentStats = subjectStats[subject];
      const newXp = currentStats.xp + finalAmount;
      const newLevel = calculateLevelFromXp(newXp);
      const newTier = calculateTier({
        ...subjectStats,
        [subject]: { xp: newXp, level: newLevel },
      });

      await supabase
        .from('profiles')
        .update({
          [`${subject}_xp`]: newXp,
          [`${subject}_level`]: newLevel,
          tier: newTier,
        })
        .eq('user_id', currentUser.id);
    }
  }, [currentUser, subjectStats, streakBonus, checkAndUpdateStreak]);

  const resetLevelUp = useCallback(() => {
    setJustLeveledUp(false);
    setLevelUpSubject(null);
  }, []);

  // 약점 단어 관리 (기존 로직 유지)
  const addWeakWord = useCallback((word) => {
    setWeakWords(prev => {
      const key = word.english || word.term || word.question || JSON.stringify(word).slice(0, 50);
      const updated = { ...prev };
      if (updated[key]) {
        updated[key].count++;
        updated[key].lastMissed = new Date().toISOString();
      } else {
        updated[key] = {
          ...word,
          count: 1,
          lastMissed: new Date().toISOString(),
        };
      }
      localStorage.setItem('weakWords', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeWeakWord = useCallback((key) => {
    setWeakWords(prev => {
      const updated = { ...prev };
      delete updated[key];
      localStorage.setItem('weakWords', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getWeakWordsList = useCallback(() => {
    return Object.values(weakWords)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [weakWords]);

  const clearWeakWords = useCallback(() => {
    setWeakWords({});
    localStorage.removeItem('weakWords');
  }, []);

  // 과목별 현재 레벨 진행률 계산
  const getSubjectProgress = useCallback((subject) => {
    const stats = subjectStats[subject];
    if (!stats) return { percent: 0, xpInLevel: 0, xpNeeded: 10 };

    const currentLevelXp = calculateCumulativeXpForLevel(stats.level);
    const nextLevelXp = calculateCumulativeXpForLevel(stats.level + 1);
    const xpInLevel = stats.xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    const percent = xpNeeded > 0 ? (xpInLevel / xpNeeded) * 100 : 100;

    return { percent, xpInLevel, xpNeeded };
  }, [subjectStats]);

  const value = {
    // 과목별 통계
    subjectStats,
    getSubjectProgress,

    // 티어
    tier,
    tierConfig,
    nextTierInfo,
    TIER_CONFIG,

    // 연속 학습
    streakCount,
    streakBonus,
    longestStreak,
    lastStudyDate,

    // 레벨업 알림
    justLeveledUp,
    levelUpSubject,
    resetLevelUp,

    // 핵심 함수
    addXp,

    // 약점 단어
    weakWords,
    addWeakWord,
    removeWeakWord,
    getWeakWordsList,
    clearWeakWords,

    // 상수
    CORE_SUBJECTS,
    OTHER_SUBJECTS,
    ALL_SUBJECTS,

    // 레거시 호환성: 전체 레벨 및 XP (기존 UI 호환)
    level: Math.max(...CORE_SUBJECTS.map(s => subjectStats[s]?.level || 1)),
    xp: CORE_SUBJECTS.reduce((sum, s) => sum + (subjectStats[s]?.xp || 0), 0),
    xpGainedInCurrentLevel: (() => {
      const totalXp = CORE_SUBJECTS.reduce((sum, s) => sum + (subjectStats[s]?.xp || 0), 0);
      const level = calculateLevelFromXp(totalXp);
      return totalXp - calculateCumulativeXpForLevel(level);
    })(),
    xpRequiredForCurrentLevel: (() => {
      const totalXp = CORE_SUBJECTS.reduce((sum, s) => sum + (subjectStats[s]?.xp || 0), 0);
      const level = calculateLevelFromXp(totalXp);
      return calculateCumulativeXpForLevel(level + 1) - calculateCumulativeXpForLevel(level);
    })(),
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

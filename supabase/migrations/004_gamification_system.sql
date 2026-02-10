-- ============================================
-- 004: Gamification System - Subject Levels, Tiers, Daily Challenges
-- ============================================

-- ⚠️ 기존 컬럼 정리: xp, level, points는 더 이상 사용하지 않음
-- (삭제하지 않고 deprecated로 유지, 나중에 제거 가능)

-- 과목별 XP/레벨 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS english_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS english_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS math_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS math_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS science_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS science_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS korean_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS korean_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certificate_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certificate_level INTEGER DEFAULT 1;

-- 연속 학습 (일일 도전과제)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_study_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- 티어 (계산된 값, 캐싱용)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze';

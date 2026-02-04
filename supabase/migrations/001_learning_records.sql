-- ============================================
-- Learning Records System - Supabase Migration
-- ============================================

-- 1. words 테이블: 학습 콘텐츠 저장
CREATE TABLE IF NOT EXISTS words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 분류 정보
    subject TEXT NOT NULL,
    course_code TEXT NOT NULL,
    
    -- 공통 필드
    item_key TEXT NOT NULL,
    item_type TEXT,
    level INTEGER DEFAULT 1,
    
    -- 콘텐츠 (JSONB로 유연하게 저장)
    content JSONB NOT NULL,
    
    -- 검색용 인덱스 필드
    question_text TEXT,
    answer_text TEXT,
    
    -- 메타데이터
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(course_code, item_key)
);

-- words 인덱스
CREATE INDEX IF NOT EXISTS idx_words_subject ON words(subject);
CREATE INDEX IF NOT EXISTS idx_words_course ON words(course_code);
CREATE INDEX IF NOT EXISTS idx_words_level ON words(level);
CREATE INDEX IF NOT EXISTS idx_words_content ON words USING GIN(content);

-- 2. courses 테이블: 과정/코스 정의
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    course_code TEXT UNIQUE NOT NULL,
    course_name TEXT NOT NULL,
    category TEXT,
    difficulty TEXT,
    total_items INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. user_course_progress 테이블: 사용자별 과정 진행 상태
CREATE TABLE IF NOT EXISTS user_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    
    -- 진행 상태
    status TEXT DEFAULT 'not_started',
    progress_percent NUMERIC(5,2) DEFAULT 0.00,
    
    -- 학습 통계
    total_attempts INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    
    -- 시간 기록
    started_at TIMESTAMPTZ,
    last_studied_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_study_time_seconds INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, course_id)
);

-- 4. learning_records 테이블: 세부 학습 기록
CREATE TABLE IF NOT EXISTS learning_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id UUID REFERENCES words(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    
    -- 학습 결과
    game_mode TEXT,
    is_correct BOOLEAN,
    user_answer TEXT,
    time_spent_ms INTEGER,
    
    -- 세션 정보
    session_id UUID,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- learning_records 인덱스
CREATE INDEX IF NOT EXISTS idx_learning_records_user ON learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_word ON learning_records(word_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_session ON learning_records(session_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_created ON learning_records(created_at);

-- 5. weak_words 테이블: 약점 단어
CREATE TABLE IF NOT EXISTS weak_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id UUID REFERENCES words(id) ON DELETE CASCADE,
    
    -- 통계
    wrong_count INTEGER DEFAULT 1,
    correct_count INTEGER DEFAULT 0,
    last_wrong_at TIMESTAMPTZ DEFAULT NOW(),
    last_correct_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, word_id)
);

-- 6. game_sessions 테이블: 게임 세션 기록
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    
    -- 세션 정보
    game_mode TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- 결과
    total_questions INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    accuracy NUMERIC(5,2),
    
    -- 메타데이터
    metadata JSONB
);

-- game_sessions 인덱스
CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_course ON game_sessions(course_id);

-- ============================================
-- Row Level Security (RLS) 정책
-- ============================================

-- words: 누구나 읽기 가능
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read words" ON words FOR SELECT USING (true);
CREATE POLICY "Service role can insert words" ON words FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update words" ON words FOR UPDATE USING (true);

-- courses: 누구나 읽기 가능
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read courses" ON courses FOR SELECT USING (true);

-- user_course_progress: 본인만 접근
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON user_course_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_course_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_course_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- learning_records: 본인만 접근
ALTER TABLE learning_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own records" ON learning_records
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records" ON learning_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- weak_words: 본인만 접근
ALTER TABLE weak_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own weak words" ON weak_words
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weak words" ON weak_words
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weak words" ON weak_words
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own weak words" ON weak_words
    FOR DELETE USING (auth.uid() = user_id);

-- game_sessions: 본인만 접근
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 트리거: updated_at 자동 업데이트
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_words_updated_at
    BEFORE UPDATE ON words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at
    BEFORE UPDATE ON user_course_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weak_words_updated_at
    BEFORE UPDATE ON weak_words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

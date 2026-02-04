-- ==============================================================================
-- Sync user_course_progress from game_sessions
-- 게임 세션(game_sessions) 테이블을 기준으로 과정별 진행률(user_course_progress)을 재집계합니다.
-- ==============================================================================

WITH session_stats AS (
    SELECT 
        user_id,
        course_id,
        COUNT(id) as calculated_attempts,
        SUM(correct_count) as calculated_correct,
        SUM(wrong_count) as calculated_wrong,
        MAX(score) as calculated_best_score,
        MAX(started_at) as calculated_last_studied
    FROM 
        game_sessions
    WHERE 
        ended_at IS NOT NULL -- 완료된 세션만 기준
    GROUP BY 
        user_id, course_id
)
INSERT INTO user_course_progress (
    user_id, 
    course_id, 
    total_attempts, 
    correct_count, 
    wrong_count, 
    best_score, 
    last_studied_at,
    status
)
SELECT 
    user_id,
    course_id,
    calculated_attempts,
    calculated_correct,
    calculated_wrong,
    calculated_best_score,
    calculated_last_studied,
    'in_progress' -- 기본 상태
FROM 
    session_stats
ON CONFLICT (user_id, course_id) 
DO UPDATE SET
    total_attempts = EXCLUDED.total_attempts,
    correct_count = EXCLUDED.correct_count,
    wrong_count = EXCLUDED.wrong_count,
    best_score = GREATEST(user_course_progress.best_score, EXCLUDED.best_score),
    last_studied_at = EXCLUDED.last_studied_at,
    updated_at = NOW();

-- 결과 확인
SELECT * FROM user_course_progress ORDER BY last_studied_at DESC;

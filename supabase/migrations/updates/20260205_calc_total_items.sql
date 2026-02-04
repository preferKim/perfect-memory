-- courses 테이블의 total_items를 words 테이블 기준으로 최신화
UPDATE courses c
SET total_items = (
    SELECT COUNT(*)
    FROM words w
    WHERE w.course_code = c.course_code
      AND w.is_active = true
);

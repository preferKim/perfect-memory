-- ============================================
-- Certificate (정보처리기사) Courses
-- ============================================

-- 정보처리기사 과목별 코스 등록
INSERT INTO courses (subject, course_code, course_name, category, difficulty, total_items, display_order) VALUES
-- 과목별 코스 (각 100문제)
('certificate', 'certificate_level_1', '💻 1과목: 소프트웨어 설계', 'level', 'hard', 100, 1),
('certificate', 'certificate_level_2', '💻 2과목: 소프트웨어 개발', 'level', 'hard', 100, 2),
('certificate', 'certificate_level_3', '💻 3과목: 데이터베이스 구축', 'level', 'hard', 100, 3),
('certificate', 'certificate_level_4', '💻 4과목: 프로그래밍 언어 활용', 'level', 'hard', 100, 4),
('certificate', 'certificate_level_5', '💻 5과목: 정보시스템 구축관리', 'level', 'hard', 100, 5),

-- 전체 모의고사 (500문제)
('certificate', 'certificate_all', '💻 정보처리기사 전체 모의고사', 'full_exam', 'hard', 500, 10)

ON CONFLICT (course_code) DO NOTHING;

-- 코스 등록 확인
SELECT course_code, course_name, total_items 
FROM courses 
WHERE subject = 'certificate' 
ORDER BY display_order;

-- AWS 과목별 코스 등록
INSERT INTO courses (subject, course_code, course_name, category, difficulty, total_items, display_order) VALUES
-- 과목별 코스 (각 50문제)
('certificate', 'certificate_AWS_1', 'CLF-C02', 'level', 'easy', 50, 1),
('certificate', 'certificate_AWS_2', 'SAA-C03', 'level', 'medium', 50, 2),
('certificate', 'certificate_AWS_3', 'DVA-C02','level', 'medium', 50, 3),
('certificate', 'certificate_AWS_4', 'SOA-C02', 'level', 'medium', 50, 4)
ON CONFLICT (course_code) DO NOTHING;
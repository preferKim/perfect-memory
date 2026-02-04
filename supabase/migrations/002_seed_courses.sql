-- ============================================
-- Courses 초기 데이터
-- ============================================

INSERT INTO courses (subject, course_code, course_name, category, difficulty, display_order) VALUES
-- 영어
('english', 'english_easy', '🐣 영어 병아리반', 'level', 'easy', 1),
('english', 'english_medium', '🐰 영어 토끼반', 'level', 'medium', 2),
('english', 'english_hard', '🐯 영어 호랑이반', 'level', 'hard', 3),

-- 국어
('korean', 'korean_chosung', '🔤 초성퀴즈', 'quiz', 'easy', 1),
('korean', 'korean_grammar', '📚 문법', 'grammar', 'medium', 2),
('korean', 'korean_literature', '📖 문학용어', 'vocabulary', 'medium', 3),
('korean', 'korean_spelling', '✏️ 맞춤법', 'quiz', 'easy', 4),
('korean', 'korean_spacing', '📝 띄어쓰기', 'quiz', 'easy', 5),

-- 수학 (정승제 50일)
('math', 'math_seungje_01', '01강 분모가 같은 분수의 덧셈과 뺄셈, 약수의 뜻', 'seungje', NULL, 1),
('math', 'math_seungje_02', '02강 약수의 개수와 약수의 총합, 배수의 뜻', 'seungje', NULL, 2),
('math', 'math_seungje_03', '03강 최대공약수와 최소공배수', 'seungje', NULL, 3),
('math', 'math_seungje_04', '04강 통분과 약분, 역수의 뜻', 'seungje', NULL, 4),
('math', 'math_seungje_05', '05강 소수의 덧셈, 뺄셈, 곱셈, 나눗셈(1)', 'seungje', NULL, 5),
('math', 'math_seungje_06', '06강 소수의 덧셈, 뺄셈, 곱셈, 나눗셈(2)', 'seungje', NULL, 6),
('math', 'math_seungje_07', '07강 최대공약수와 최소공배수', 'seungje', NULL, 7),
('math', 'math_seungje_08', '08강 양수와 음수', 'seungje', NULL, 8),

-- 수학 (단계별)
('math', 'math_level_1_elementary', '1. 수와 연산 [초등]', 'level', 'elementary', 10),
('math', 'math_level_1_middle', '1. 수와 연산 [중등]', 'level', 'middle', 11),
('math', 'math_level_1_high', '1. 수와 연산 [고등]', 'level', 'high', 12),
('math', 'math_level_2_elementary', '2. 문자와 식 [초등]', 'level', 'elementary', 13),
('math', 'math_level_2_middle', '2. 문자와 식 [중등]', 'level', 'middle', 14),
('math', 'math_level_2_high', '2. 문자와 식 [고등]', 'level', 'high', 15),

-- 사회
('social', 'social_easy', '🏛️ 사회 쉬움', 'level', 'easy', 1),
('social', 'social_medium', '🏛️ 사회 보통', 'level', 'medium', 2),
('social', 'social_hard', '🏛️ 사회 어려움', 'level', 'hard', 3),

-- 과학
('science', 'science_easy', '🔬 과학 쉬움', 'level', 'easy', 1),
('science', 'science_medium', '🔬 과학 보통', 'level', 'medium', 2),
('science', 'science_hard', '🔬 과학 어려움', 'level', 'hard', 3)

ON CONFLICT (course_code) DO NOTHING;

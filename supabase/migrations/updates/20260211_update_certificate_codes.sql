-- ============================================
-- Update Certificate Course Codes
-- certificate_level_X -> certificate_EIP_X
-- certificate_all -> certificate_EIP_all
-- ============================================

-- 1. Update courses table
UPDATE courses
SET course_code = REPLACE(course_code, 'certificate_level_', 'certificate_EIP_')
WHERE course_code LIKE 'certificate_level_%';

UPDATE courses
SET course_code = 'certificate_EIP_all'
WHERE course_code = 'certificate_all';

-- 2. Update words table (if data already exists with old codes)
UPDATE words
SET course_code = REPLACE(course_code, 'certificate_level_', 'certificate_EIP_')
WHERE course_code LIKE 'certificate_level_%';

-- 3. Verify changes
SELECT course_code, course_name 
FROM courses 
WHERE subject = 'certificate' 
ORDER BY display_order;

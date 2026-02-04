/**
 * JSON 데이터 → Supabase DB 마이그레이션 스크립트
 * 
 * 사용법:
 *   node scripts/migrate-words.mjs
 * 
 * 환경 변수 필요:
 *   VITE_SUPABASE_URL - Supabase 프로젝트 URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service Role Key (Supabase Dashboard에서 확인)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일 직접 파싱 (dotenv 없이)
function loadEnv() {
    const envPath = path.join(__dirname, '../.env');
    const envLocalPath = path.join(__dirname, '../.env.local');

    const env = {};

    [envPath, envLocalPath].forEach(filePath => {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            content.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const [key, ...valueParts] = trimmed.split('=');
                    if (key && valueParts.length > 0) {
                        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                    }
                }
            });
        }
    });

    return env;
}

const envVars = loadEnv();
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 환경 변수가 설정되지 않았습니다.');
    console.error('   VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 를 확인하세요.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 마이그레이션할 파일 목록
const MIGRATIONS = [
    // 영어
    {
        file: 'english_easy.json',
        courseCode: 'english_easy',
        subject: 'english',
        type: 'vocabulary',
        keyFn: (item, idx) => `word_${idx + 1}`,
        levelFn: (item) => item.level || 1,
        questionFn: (item) => item.english,
        answerFn: (item) => item.korean
    },
    {
        file: 'english_medium.json',
        courseCode: 'english_medium',
        subject: 'english',
        type: 'vocabulary',
        keyFn: (item, idx) => `word_${idx + 1}`,
        levelFn: (item) => item.level || 1,
        questionFn: (item) => item.english,
        answerFn: (item) => item.korean
    },
    {
        file: 'english_hard.json',
        courseCode: 'english_hard',
        subject: 'english',
        type: 'vocabulary',
        keyFn: (item, idx) => `word_${idx + 1}`,
        levelFn: (item) => item.level || 1,
        questionFn: (item) => item.english,
        answerFn: (item) => item.korean
    },

    // 수학 - 정승제 50일
    {
        file: 'math_jsj50day.json',
        courseCode: null, // stage에 따라 동적 생성
        subject: 'math',
        type: 'math_problem',
        keyFn: (item, idx) => `stage${item.stage}_level${item.level}_q${idx + 1}`,
        levelFn: (item) => item.level || 1,
        questionFn: (item) => item.problem,
        answerFn: (item) => item.answer,
        courseCodeFn: (item) => `math_seungje_${String(item.stage).padStart(2, '0')}`
    },

    // 국어 - 문법
    {
        file: 'korean_grammar_quiz.json',
        courseCode: 'korean_grammar',
        subject: 'korean',
        type: 'grammar',
        keyFn: (item, idx) => `grammar_${idx + 1}`,
        levelFn: (item) => item.level || 1,
        questionFn: (item) => item.question || item.sentence,
        answerFn: (item) => Array.isArray(item.answers) ? item.answers.join(', ') : item.answers
    },
];

async function migrateFile(config) {
    const { file, courseCode, subject, type, keyFn, levelFn, questionFn, answerFn, courseCodeFn } = config;
    const filePath = path.join(__dirname, '../public/words', file);

    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ 파일을 찾을 수 없음: ${file}`);
        return;
    }

    console.log(`📂 Loading ${file}...`);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawData);

    if (!Array.isArray(data)) {
        console.warn(`⚠️ ${file}은 배열이 아닙니다.`);
        return;
    }

    // 데이터 변환
    const words = data.map((item, index) => ({
        subject,
        course_code: courseCodeFn ? courseCodeFn(item) : courseCode,
        item_key: keyFn(item, index),
        item_type: type,
        level: levelFn(item),
        content: item,
        question_text: questionFn(item),
        answer_text: answerFn(item),
        display_order: index + 1,
        is_active: true
    }));

    console.log(`   📝 총 ${words.length}개 항목 변환 완료`);

    // Batch upsert (500개씩)
    const BATCH_SIZE = 500;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < words.length; i += BATCH_SIZE) {
        const batch = words.slice(i, i + BATCH_SIZE);

        const { data: result, error } = await supabase
            .from('words')
            .upsert(batch, {
                onConflict: 'course_code,item_key',
                ignoreDuplicates: false
            });

        if (error) {
            console.error(`   ❌ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 오류:`, error.message);
            errorCount += batch.length;
        } else {
            successCount += batch.length;
        }
    }

    console.log(`   ✅ ${file}: ${successCount}개 성공, ${errorCount}개 실패`);
}

async function updateCourseTotals() {
    console.log('\n📊 과정별 항목 수 업데이트 중...');

    // course_code별 카운트
    const { data: counts, error } = await supabase
        .from('words')
        .select('course_code')
        .then(async ({ data }) => {
            const countMap = {};
            data?.forEach(item => {
                countMap[item.course_code] = (countMap[item.course_code] || 0) + 1;
            });
            return { data: countMap, error: null };
        });

    if (error) {
        console.error('❌ 카운트 조회 실패:', error);
        return;
    }

    // courses 테이블 업데이트
    for (const [courseCode, total] of Object.entries(counts || {})) {
        await supabase
            .from('courses')
            .update({ total_items: total })
            .eq('course_code', courseCode);
    }

    console.log('✅ 과정별 항목 수 업데이트 완료');
}

async function main() {
    console.log('🚀 마이그레이션 시작\n');
    console.log(`   Supabase URL: ${supabaseUrl}`);
    console.log('');

    for (const config of MIGRATIONS) {
        await migrateFile(config);
    }

    await updateCourseTotals();

    console.log('\n🎉 마이그레이션 완료!');
}

main().catch(console.error);

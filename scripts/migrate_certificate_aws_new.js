/**
 * Certificate Quiz Data Migration Script (Append Mode)
 * 
 * certificate_AWS_SAA_new.json 파일의 새로운 문제들을
 * 기존 DB의 마지막 item_key에 이어서 words 테이블에 추가
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일 파싱
function loadEnv() {
    const env = {};
    const files = ['.env', '.env.local'];

    files.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fsSync.existsSync(filePath)) {
            const content = fsSync.readFileSync(filePath, 'utf-8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, '');
                    env[key] = value;
                }
            });
        }
    });
    return env;
}

const envVars = loadEnv();

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.VITE_SUPABASE_URL || envVars.VITE_SUPABASE_URL || 'https://myjbirqdjffezqhhtkkw.supabase.co';
const serviceKeyArg = process.argv.find(arg => arg.startsWith('--service-key='));
const serviceKey = serviceKeyArg
    ? serviceKeyArg.split('=')[1]
    : (process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY);

if (!serviceKey) {
    console.error('\n❌ Service role key가 필요합니다!');
    console.error('node scripts/migrate_certificate_aws_new.js --service-key=your_key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// 설정
const JSON_FILE_NAME = 'certificate_AWS_SAA_final.json';
const COURSE_CODE_MAP = {
    1: 'certificate_AWS_1',
    2: 'certificate_AWS_2', // SAA는 Level 2
    3: 'certificate_AWS_3',
    4: 'certificate_AWS_4'
};

async function loadQuestions() {
    try {
        const filePath = path.join(__dirname, `../public/words/${JSON_FILE_NAME}`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('❌ JSON 파일 로드 실패:', error.message);
        throw error;
    }
}

/**
 * DB에서 해당 코스의 마지막 item_key 번호를 조회
 */
async function getLastItemNumber(courseCode) {
    const { data, error } = await supabase
        .from('words')
        .select('item_key')
        .eq('course_code', courseCode)
        .order('item_key', { ascending: false })
        .limit(1);

    if (error) {
        console.error(`❌ 마지막 번호 조회 실패 (${courseCode}):`, error.message);
        throw error;
    }

    if (!data || data.length === 0) return 0;

    // item_key 형식: cert_2_050
    const lastKey = data[0].item_key;
    const parts = lastKey.split('_');
    const lastNum = parseInt(parts[2], 10);

    return isNaN(lastNum) ? 0 : lastNum;
}

async function migrate() {
    console.log('\n🚀 AWS New Questions Migration 시작\n');

    try {
        const questions = await loadQuestions();
        console.log(`✅ ${questions.length}개의 새로운 문제 로드됨`);

        // Level 별로 그룹화
        const questionsByLevel = {};
        questions.forEach(q => {
            if (!questionsByLevel[q.level]) questionsByLevel[q.level] = [];
            questionsByLevel[q.level].push(q);
        });

        let totalInserted = 0;

        for (const [level, levelQuestions] of Object.entries(questionsByLevel)) {
            const courseCode = COURSE_CODE_MAP[level];
            if (!courseCode) {
                console.warn(`⚠️ 알 수 없는 레벨: ${level}, 건너뜀`);
                continue;
            }

            console.log(`\n📌 Level ${level} (${courseCode}) 처리 중...`);

            // 현재 DB의 마지막 번호 조회
            const lastNum = await getLastItemNumber(courseCode);
            console.log(`   현재 DB 마지막 번호: ${lastNum}`);

            // 데이터 변환 및 삽입
            const batch = levelQuestions.map((q, idx) => {
                const nextNum = lastNum + idx + 1;
                const itemKey = `cert_${level}_${String(nextNum).padStart(3, '0')}`;

                return {
                    subject: 'certificate',
                    course_code: courseCode,
                    item_key: itemKey,
                    item_type: 'multiple_choice',
                    level: q.level,
                    content: {
                        problem: q.problem,
                        options: q.options,
                        answer: q.answer,
                        hint: q.hint,
                        explanation: q.explanation
                    },
                    question_text: q.problem,
                    answer_text: q.answer,
                    is_active: true
                };
            });

            console.log(`   👉 ${batch.length}개 문제 삽입 시도 (번호 ${lastNum + 1} ~ ${lastNum + batch.length})`);

            const { error } = await supabase.from('words').upsert(batch);

            if (error) {
                console.error(`❌ 삽입 실패 Level ${level}:`, error.message);
            } else {
                console.log(`   ✅ 성공!`);
                totalInserted += batch.length;
            }
        }

        console.log(`\n🎉 총 ${totalInserted}개 문제 추가 완료!\n`);

    } catch (error) {
        console.error('\n❌ 오류 발생:', error);
    }
}

migrate();

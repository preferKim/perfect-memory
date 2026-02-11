/**
 * Certificate Quiz Data Migration Script
 * 
 * certificate_EIP.json 파일의 500개 문제를 Supabase words 테이블에 마이그레이션
 * 
 * Usage:
 *   node scripts/migrate_certificate_data.js --dry-run  (테스트 실행)
 *   node scripts/migrate_certificate_data.js            (실제 마이그레이션)
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

// Service role key를 환경변수나 커맨드라인 인자로 받기
const serviceKeyArg = process.argv.find(arg => arg.startsWith('--service-key='));
const serviceKey = serviceKeyArg
    ? serviceKeyArg.split('=')[1]
    : (process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY);

if (!serviceKey) {
    console.error('\n❌ Service role key가 필요합니다!');
    console.error('RLS(Row Level Security) 정책으로 인해 데이터 삽입 시 Service Key가 필요합니다.');
    console.error('\n다음 중 하나의 방법으로 제공해주세요:');
    console.error('  1. .env 또는 .env.local 파일에 SUPABASE_SERVICE_ROLE_KEY 설정');
    console.error('  2. 커맨드라인: node scripts/migrate_certificate_data.js --service-key=your_key');
    console.error('\nService role key는 Supabase 프로젝트 설정 > API에서 확인할 수 있습니다.\n');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// 설정
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 50; // 한 번에 처리할 문제 수

// 과목별 코스 코드 매핑
const COURSE_CODE_MAP = {
    1: 'certificate_AWS_1',
    2: 'certificate_AWS_2',
    3: 'certificate_AWS_3',
    4: 'certificate_AWS_4'
};

/**
 * JSON 파일 읽기
 */
async function loadQuestions() {
    try {
        const filePath = path.join(__dirname, '../public/words/certificate_AWS.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const questions = JSON.parse(fileContent);

        console.log(`✅ JSON 파일 로드 완료: ${questions.length}개 문제`);
        return questions;
    } catch (error) {
        console.error('❌ JSON 파일 로드 실패:', error.message);
        throw error;
    }
}

/**
 * 문제 데이터를 words 테이블 형식으로 변환
 */
function transformQuestion(question, index) {
    const courseCode = COURSE_CODE_MAP[question.level];

    if (!courseCode) {
        console.warn(`⚠️  Unknown level: ${question.level} for question ${index}`);
        return null;
    }

    return {
        subject: 'certificate',
        course_code: courseCode,
        item_key: `cert_${question.level}_${String(index + 1).padStart(3, '0')}`,
        item_type: 'multiple_choice',
        level: question.level,
        content: {
            problem: question.problem,
            options: question.options,
            answer: question.answer,
            hint: question.hint,
            explanation: question.explanation
        },
        question_text: question.problem,
        answer_text: question.answer,
        is_active: true
    };
}

/**
 * 배치 단위로 데이터 삽입
 */
async function insertBatch(batch, batchNumber) {
    if (DRY_RUN) {
        console.log(`[DRY RUN] Batch ${batchNumber}: ${batch.length}개 문제 (실제 삽입 안 함)`);
        return { success: true, count: batch.length };
    }

    try {
        const { data, error } = await supabase
            .from('words')
            .upsert(batch, { onConflict: 'course_code,item_key' })
            .select('id');

        if (error) {
            console.error(`❌ Batch ${batchNumber} 삽입 실패:`, error.message);
            return { success: false, error };
        }

        console.log(`✅ Batch ${batchNumber}: ${data.length}개 문제 삽입 완료`);
        return { success: true, count: data.length };
    } catch (error) {
        console.error(`❌ Batch ${batchNumber} 예외 발생:`, error.message);
        return { success: false, error };
    }
}

/**
 * 코스별 통계 계산
 */
function calculateStats(questions) {
    const stats = {};

    questions.forEach(q => {
        const level = q.level;
        if (!stats[level]) {
            stats[level] = { count: 0, courseCode: COURSE_CODE_MAP[level] };
        }
        stats[level].count++;
    });

    return stats;
}

/**
 * 메인 마이그레이션 함수
 */
async function migrate() {
    console.log('\n🚀 Certificate Quiz Data Migration 시작\n');
    console.log(`모드: ${DRY_RUN ? 'DRY RUN (테스트)' : 'PRODUCTION (실제 삽입)'}\n`);

    try {
        // 1. JSON 파일 로드
        const questions = await loadQuestions();

        // 2. 통계 출력
        const stats = calculateStats(questions);
        console.log('\n📊 과목별 문제 수:');
        Object.entries(stats).forEach(([level, data]) => {
            console.log(`   Level ${level} (${data.courseCode}): ${data.count}문제`);
        });
        console.log(`   총합: ${questions.length}문제\n`);

        // 3. 데이터 변환
        console.log('🔄 데이터 변환 중...');
        const transformedQuestions = questions
            .map((q, idx) => transformQuestion(q, idx))
            .filter(q => q !== null);

        console.log(`✅ ${transformedQuestions.length}개 문제 변환 완료\n`);

        // 4. 배치 단위로 삽입
        console.log('💾 데이터베이스 삽입 시작...\n');

        let totalInserted = 0;
        let totalFailed = 0;

        for (let i = 0; i < transformedQuestions.length; i += BATCH_SIZE) {
            const batch = transformedQuestions.slice(i, i + BATCH_SIZE);
            const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

            const result = await insertBatch(batch, batchNumber);

            if (result.success) {
                totalInserted += result.count;
            } else {
                totalFailed += batch.length;
            }

            // 과부하 방지를 위한 딜레이
            if (!DRY_RUN && i + BATCH_SIZE < transformedQuestions.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // 5. 결과 요약
        console.log('\n' + '='.repeat(50));
        console.log('📈 마이그레이션 완료\n');
        console.log(`   총 문제 수: ${questions.length}`);
        console.log(`   성공: ${totalInserted}`);
        console.log(`   실패: ${totalFailed}`);
        console.log('='.repeat(50) + '\n');

        if (DRY_RUN) {
            console.log('ℹ️  DRY RUN 모드였습니다. 실제 데이터는 삽입되지 않았습니다.');
            console.log('   실제 마이그레이션을 실행하려면: node scripts/migrate_certificate_data_AWS.js\n');
        } else {
            console.log('✅ 실제 마이그레이션이 완료되었습니다!\n');
        }

    } catch (error) {
        console.error('\n❌ 마이그레이션 실패:', error.message);
        process.exit(1);
    }
}

// 스크립트 실행
migrate();

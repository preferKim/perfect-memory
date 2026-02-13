/**
 * AWS SAA Certificate Data Migration Script
 * 
 * Reads public/words/certificate_AWS_SAA.json
 * Appends questions to the 'words' table in Supabase.
 * Uses course_code: 'certificate_AWS_2' for SAA (Level 2).
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
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

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || envVars.VITE_SUPABASE_URL || 'https://myjbirqdjffezqhhtkkw.supabase.co';
const serviceKeyArg = process.argv.find(arg => arg.startsWith('--service-key='));
const serviceKey = serviceKeyArg
    ? serviceKeyArg.split('=')[1]
    : (process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY);

if (!serviceKey) {
    console.error('\n❌ Service role key is required!');
    console.error('Usage: node scripts/migrate_certificate_aws_saa.js --service-key=your_key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Configuration
const JSON_FILE_NAME = 'certificate_AWS_SAA.json';
const COURSE_CODE_MAP = {
    2: 'certificate_AWS_2', // SAA is Level 2
};

async function loadQuestions() {
    try {
        const filePath = path.join(__dirname, `../public/words/${JSON_FILE_NAME}`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('❌ Failed to load JSON file:', error.message);
        throw error;
    }
}

/**
 * Get the last item_key number for the course from DB
 */
async function getLastItemNumber(courseCode) {
    const { data, error } = await supabase
        .from('words')
        .select('item_key')
        .eq('course_code', courseCode)
        .order('item_key', { ascending: false })
        .limit(1);

    if (error) {
        console.error(`❌ Failed to fetch last number (${courseCode}):`, error.message);
        throw error;
    }

    if (!data || data.length === 0) return 0;

    // item_key format: cert_2_050
    // We expect the format cert_{level}_{number}
    const lastKey = data[0].item_key;
    const parts = lastKey.split('_');
    // Assuming format cert_2_XXX, the number is at index 2? 
    // Wait, reference script used `parts[2]`. 
    // If format is `cert_2_050`: parts[0]="cert", parts[1]="2", parts[2]="050". Correct.
    const lastNum = parseInt(parts[2], 10);

    return isNaN(lastNum) ? 0 : lastNum;
}

async function migrate() {
    console.log('\n🚀 AWS SAA Migration Started\n');

    try {
        const questions = await loadQuestions();
        console.log(`✅ Loaded ${questions.length} questions from ${JSON_FILE_NAME}`);

        // Group by Level (Should be all Level 2, but just in case)
        const questionsByLevel = {};
        questions.forEach(q => {
            const level = q.level || 2; // Default to 2 if missing
            if (!questionsByLevel[level]) questionsByLevel[level] = [];
            questionsByLevel[level].push(q);
        });

        let totalInserted = 0;

        for (const [level, levelQuestions] of Object.entries(questionsByLevel)) {
            const courseCode = COURSE_CODE_MAP[level];
            if (!courseCode) {
                console.warn(`⚠️ Unknown level: ${level}, skipping...`);
                continue;
            }

            console.log(`\n📌 Processing Level ${level} (${courseCode})...`);

            // Fetch last number from DB
            const lastNum = await getLastItemNumber(courseCode);
            console.log(`   Current last number in DB: ${lastNum}`);

            // Prepare batch
            const batch = levelQuestions.map((q, idx) => {
                const nextNum = lastNum + idx + 1;
                // Format: cert_2_001
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
                        hint: q.hint || "",
                        explanation: q.explanation || ""
                    },
                    question_text: q.problem,
                    answer_text: q.answer,
                    is_active: true
                };
            });

            console.log(`   👉 Inserting ${batch.length} questions (ID range: ${lastNum + 1} to ${lastNum + batch.length})`);

            // Insert in chunks if necessary, but 700 might be fine in one go? 
            // Better to split if large. Supabase/PostgREST usually handles 1000 rows fine.
            // Let's stick to one `upsert` for simplicity unless it fails.

            const { error } = await supabase.from('words').upsert(batch);

            if (error) {
                console.error(`❌ Insert failed for Level ${level}:`, error.message);
            } else {
                console.log(`   ✅ Success!`);
                totalInserted += batch.length;
            }
        }

        console.log(`\n🎉 Total ${totalInserted} questions added successfully!\n`);

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
    }
}

migrate();

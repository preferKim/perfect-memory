
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILES_TO_MERGE = [
    'certificate_AWS_SAA_new.json',   // Batch 1 (20)
    'certificate_AWS_SAA_batch2.json', // Batch 2 (40)
    'certificate_AWS_SAA_batch3.json'  // Batch 3 (40)
];

const OUTPUT_FILE = 'certificate_AWS_SAA_final.json';

function merge() {
    console.log('🚀 Merging Question Files...');

    let allQuestions = [];

    FILES_TO_MERGE.forEach(file => {
        try {
            const filePath = path.join(__dirname, '../public/words', file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const questions = JSON.parse(content);
                console.log(`   - ${file}: ${questions.length} questions`);
                allQuestions = allQuestions.concat(questions);
            } else {
                console.warn(`   ⚠️ File not found: ${file}`);
            }
        } catch (err) {
            console.error(`   ❌ Error reading ${file}:`, err.message);
        }
    });

    console.log(`\n✅ Total questions merged: ${allQuestions.length}`);

    const outputPath = path.join(__dirname, '../public/words', OUTPUT_FILE);
    fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 4), 'utf-8');
    console.log(`💾 Saved to: ${OUTPUT_FILE}\n`);
}

merge();

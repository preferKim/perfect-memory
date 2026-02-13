const fs = require('fs');
const path = require('path');

const RAW_FILE_PATH = path.join(__dirname, '../public/rawdata/AWS_SAA');
const STUDY_NOTE_FILE_PATH = path.join(__dirname, '../public/rawdata/SAA-C03_Study_Note.txt');
const OUTPUT_FILE_PATH = path.join(__dirname, '../public/words/certificate_AWS_SAA.json');

function cleanText(text) {
    return text ? text.replace(/\r\n/g, '\n').trim() : '';
}

function parseOriginalFile() {
    console.log(`Parsing ${RAW_FILE_PATH}...`);
    try {
        if (!fs.existsSync(RAW_FILE_PATH)) {
            console.warn(`File not found: ${RAW_FILE_PATH}`);
            return [];
        }
        const rawContent = fs.readFileSync(RAW_FILE_PATH, 'utf-8');
        const lines = rawContent.split(/\r?\n/);

        const questions = [];
        let currentQ = null;
        let currentSection = null; // 'problem', 'A', 'B', 'C', 'D', 'explanation'

        const saveCurrentQuestion = () => {
            if (currentQ) {
                if (currentQ.answerLetter) {
                    const letter = currentQ.answerLetter.trim().charAt(0).toUpperCase();
                    currentQ.answer = currentQ.options[letter] || currentQ.answerLetter;
                }

                const entry = {
                    level: 2,
                    problem: cleanText(currentQ.problem),
                    options: [
                        cleanText(currentQ.options.A),
                        cleanText(currentQ.options.B),
                        cleanText(currentQ.options.C),
                        cleanText(currentQ.options.D)
                    ].filter(opt => opt !== ''),
                    answer: cleanText(currentQ.answer),
                    hint: "",
                    explanation: cleanText(currentQ.explanation)
                };

                if (entry.problem && entry.options.length > 0) {
                    questions.push(entry);
                }
            }
        };

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            if (!line && currentSection !== 'problem' && currentSection !== 'explanation') continue;

            let isQuestion = false;
            // Original file question detection logic
            if (/^Q\s*\d+$/.test(line)) {
                isQuestion = true;
            } else if (line.trim() === 'Q' && i + 1 < lines.length && /^\d+$/.test(lines[i + 1].trim())) {
                line = "Q" + lines[i + 1].trim();
                i++;
                isQuestion = true;
            }

            if (isQuestion) {
                saveCurrentQuestion();
                currentQ = {
                    problem: '',
                    options: { A: '', B: '', C: '', D: '' },
                    answerLetter: '',
                    explanation: ''
                };
                currentSection = 'problem';
                continue;
            }

            if (!currentQ) continue;

            if ((line.startsWith('A.') || line === 'A') && currentSection !== 'answer') {
                currentSection = 'A';
                currentQ.options.A += line.replace(/^A\.?\s*/, '') + ' ';
                continue;
            }
            if ((line.startsWith('B.') || line === 'B') && currentSection !== 'answer') {
                currentSection = 'B';
                currentQ.options.B += line.replace(/^B\.?\s*/, '') + ' ';
                continue;
            }
            if ((line.startsWith('C.') || line === 'C') && currentSection !== 'answer') {
                currentSection = 'C';
                currentQ.options.C += line.replace(/^C\.?\s*/, '') + ' ';
                continue;
            }
            if ((line.startsWith('D.') || line === 'D') && currentSection !== 'answer') {
                currentSection = 'D';
                currentQ.options.D += line.replace(/^D\.?\s*/, '') + ' ';
                continue;
            }

            if (line.startsWith('Answer:')) {
                currentSection = 'answer';
                currentQ.answerLetter = line.replace('Answer:', '').trim();
                continue;
            }

            if (line.startsWith('설명')) {
                currentSection = 'explanation';
                continue;
            }

            if (line.startsWith('http')) {
                if (currentSection === 'explanation') {
                    currentQ.explanation += '\nReference: ' + line + ' ';
                }
                continue;
            }

            if (line.includes('exam aws certified') || line.includes('ions architect associate')) {
                continue;
            }

            if (currentSection === 'problem') {
                currentQ.problem += line + ' ';
            } else if (['A', 'B', 'C', 'D'].includes(currentSection)) {
                currentQ.options[currentSection] += line + ' ';
            } else if (currentSection === 'answer') {
                currentQ.answerLetter += line;
            } else if (currentSection === 'explanation') {
                currentQ.explanation += line + ' ';
            }
        }

        saveCurrentQuestion();
        console.log(`Parsed ${questions.length} questions from AWS_SAA`);
        return questions;

    } catch (err) {
        console.error('Error parsing AWS_SAA:', err);
        return [];
    }
}

function parseStudyNoteFile() {
    console.log(`Parsing ${STUDY_NOTE_FILE_PATH}...`);
    try {
        if (!fs.existsSync(STUDY_NOTE_FILE_PATH)) {
            console.warn(`File not found: ${STUDY_NOTE_FILE_PATH}`);
            return [];
        }
        const rawContent = fs.readFileSync(STUDY_NOTE_FILE_PATH, 'utf-8');
        // Split by delimiter "=================================================="
        const blocks = rawContent.split(/={10,}/);

        const questions = [];

        blocks.forEach(block => {
            if (!block.trim()) return;

            const lines = block.split(/\r?\n/);
            const currentQ = {
                problem: '',
                options: { A: '', B: '', C: '', D: '' },
                answerLetter: '',
                explanation: ''
            };
            let currentSection = null;
            let hasContent = false;

            lines.forEach(line => {
                line = line.trim();
                if (!line) return;

                if (line.startsWith('### Q')) {
                    hasContent = true;
                    return;
                }

                if (line.startsWith('[문제 지문]')) {
                    currentSection = 'problem';
                    return;
                }

                if (line.startsWith('[정답]:')) {
                    currentSection = 'answer';
                    currentQ.answerLetter = line.replace('[정답]:', '').trim();
                    return;
                }

                if (line.startsWith('[해설]')) {
                    currentSection = 'explanation';
                    return;
                }

                // Options detection for Study Note format
                // Allow detection even if in 'problem' section, but NOT if in 'explanation' or 'answer'
                if (currentSection !== 'explanation' && currentSection !== 'answer') {
                    if (line.startsWith('A.')) {
                        currentSection = 'A';
                        currentQ.options.A += line.replace(/^A\.\s*/, '') + ' ';
                        return;
                    }
                    if (line.startsWith('B.')) {
                        currentSection = 'B';
                        currentQ.options.B += line.replace(/^B\.\s*/, '') + ' ';
                        return;
                    }
                    if (line.startsWith('C.')) {
                        currentSection = 'C';
                        currentQ.options.C += line.replace(/^C\.\s*/, '') + ' ';
                        return;
                    }
                    if (line.startsWith('D.')) {
                        currentSection = 'D';
                        currentQ.options.D += line.replace(/^D\.\s*/, '') + ' ';
                        return;
                    }
                }

                // Append content
                if (currentSection === 'problem') {
                    currentQ.problem += line + ' ';
                } else if (['A', 'B', 'C', 'D'].includes(currentSection)) {
                    currentQ.options[currentSection] += line + ' ';
                } else if (currentSection === 'explanation') {
                    currentQ.explanation += line + ' ';
                }
            });

            if (!hasContent) return;

            // Map Answer Letter to Text
            if (currentQ.answerLetter) {
                const letter = currentQ.answerLetter.trim().charAt(0).toUpperCase();
                currentQ.answer = currentQ.options[letter] || currentQ.answerLetter;
            }

            const entry = {
                level: 2,
                problem: cleanText(currentQ.problem),
                options: [
                    cleanText(currentQ.options.A),
                    cleanText(currentQ.options.B),
                    cleanText(currentQ.options.C),
                    cleanText(currentQ.options.D)
                ].filter(opt => opt !== ''),
                answer: cleanText(currentQ.answer),
                hint: "",
                explanation: cleanText(currentQ.explanation)
            };

            if (entry.problem && entry.options.length > 0) {
                questions.push(entry);
            }
        });

        console.log(`Parsed ${questions.length} questions from SAA-C03_Study_Note.txt`);
        return questions;

    } catch (err) {
        console.error('Error parsing SAA-C03_Study_Note.txt:', err);
        return [];
    }
}

function main() {
    const q1 = parseOriginalFile();
    const q2 = parseStudyNoteFile();

    const allQuestions = [...q1, ...q2];

    fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(allQuestions, null, 4), 'utf-8');
    console.log(`Successfully wrote ${allQuestions.length} questions to ${OUTPUT_FILE_PATH}`);
}

main();

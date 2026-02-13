import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import QuizScreen from '../components/QuizScreen';

const MathQuizPage = () => {
    const location = useLocation();
    const { difficulty, topicLevel, range } = location.state || { difficulty: 'easy', topicLevel: 1 };

    // courseCode 결정
    let courseCode;
    let title = '수학 퀴즈';
    let customLoadQuestions = null;
    let questionsPerRound = 10;

    if (difficulty === 'jsj50day') {
        courseCode = `math_jsj50day_${topicLevel}`;
        title = `정승제 50일 수학 - ${topicLevel}강`;
    } else if (difficulty === 'jsj50day_mock') {
        courseCode = 'math_jsj50day_mock';
        title = `정승제 50일 수학 모의고사 (${range?.start || 1}강~${range?.end || 45}강)`;
        questionsPerRound = 20;

        customLoadQuestions = useCallback(async () => {
            try {
                const response = await fetch('/words/math_jsj50day.json');
                const data = await response.json();

                // Filter by range
                const start = range?.start || 1;
                const end = range?.end || 45;
                const filtered = data.filter(q => q.stage >= start && q.stage <= end);

                // Shuffle and pick 20
                const shuffled = filtered.sort(() => 0.5 - Math.random());
                return shuffled.slice(0, 20).map((q, idx) => ({
                    ...q,
                    id: q.id || `mock_${Date.now()}_${idx}`, // Ensure ID exists
                    _wordId: q.id || `mock_${Date.now()}_${idx}`,
                    _level: q.level
                }));
            } catch (e) {
                console.error("Mock exam load error", e);
                return [];
            }
        }, [range]);
    } else {
        // 난이도 매핑 (UI값 → DB값)
        const diffMap = { easy: 'elementary', medium: 'middle', hard: 'high' };
        const dbDiff = diffMap[difficulty] || difficulty;
        courseCode = `math_${dbDiff}_${topicLevel}`;
    }

    return (
        <QuizScreen config={{
            subject: 'math',
            title,
            courseCode,
            backPath: difficulty.startsWith('jsj50day') ? '/math/seungje' : -1,
            loadQuestions: customLoadQuestions,
            questionsPerRound,
            timerSeconds: 1800,
            scoreMultiplier: 10,
            optionColumns: 2,
        }} />
    );
};

export default MathQuizPage;

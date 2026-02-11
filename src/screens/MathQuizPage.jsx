import React from 'react';
import { useLocation } from 'react-router-dom';
import QuizScreen from '../components/QuizScreen';

const MathQuizPage = () => {
    const location = useLocation();
    const { difficulty, topicLevel } = location.state || { difficulty: 'easy', topicLevel: 1 };

    // courseCode 결정
    let courseCode;
    if (difficulty === 'jsj50day') {
        courseCode = `math_jsj50day_${topicLevel}`;
    } else {
        // 난이도 매핑 (UI값 → DB값)
        const diffMap = { easy: 'elementary', medium: 'middle', hard: 'high' };
        const dbDiff = diffMap[difficulty] || difficulty;
        courseCode = `math_${dbDiff}_${topicLevel}`;
    }

    return (
        <QuizScreen config={{
            subject: 'math',
            title: '수학 퀴즈',
            courseCode,
            backPath: difficulty === 'jsj50day' ? '/math/seungje' : -1,
            questionsPerRound: 10,
            timerSeconds: 1800,
            scoreMultiplier: 10,
            optionColumns: 2,
        }} />
    );
};

export default MathQuizPage;

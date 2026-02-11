import React from 'react';
import { useParams } from 'react-router-dom';
import QuizScreen from '../components/QuizScreen';

const SocialQuizPage = () => {
    const { difficulty } = useParams();
    const difficultyMap = { easy: '초등', medium: '중등', hard: '고등' };

    return (
        <QuizScreen config={{
            subject: 'social',
            title: `사회 퀴즈 (${difficultyMap[difficulty] || '알 수 없음'})`,
            courseCode: `social_${difficulty}`,
            backPath: '/social',
            questionsPerRound: 10,
            timerSeconds: 1800,
            scoreMultiplier: 10,
            optionColumns: 2,
        }} />
    );
};

export default SocialQuizPage;

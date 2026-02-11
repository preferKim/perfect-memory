import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import QuizScreen from '../components/QuizScreen';
import { supabase } from '../supabaseClient';

// AWS Course Mapping
const awsCourseMap = {
    'AWS_CLF-C02': 'certificate_AWS_1',
    'AWS_SAA-C03': 'certificate_AWS_2',
    'AWS_DVA-C02': 'certificate_AWS_3',
    'AWS_SOA-C02': 'certificate_AWS_4',
};

const CertificateQuizPage = () => {
    const location = useLocation();
    const { subjectId } = location.state || { subjectId: 1 };

    const config = useMemo(() => {
        // 1. AWS Subjects
        if (typeof subjectId === 'string' && subjectId.startsWith('AWS_')) {
            const courseCode = awsCourseMap[subjectId];

            return {
                subject: 'certificate',
                title: 'AWS 자격증',
                courseCode: courseCode || `certificate_AWS_1`,
                backPath: '/certificate/aws',
                questionsPerRound: 20,
                timerSeconds: 3600,       // 1시간
                scoreMultiplier: 5,
                optionColumns: 1,
                showPassFail: true,
                passThreshold: 0.6,
                loadQuestions: async () => {
                    if (!courseCode) {
                        console.error('Unknown AWS subject ID:', subjectId);
                        return [];
                    }
                    const { data, error } = await supabase
                        .from('words')
                        .select('*')
                        .eq('course_code', courseCode)
                        .eq('is_active', true);

                    if (error) throw error;

                    const shuffled = [...(data || [])].sort(() => 0.5 - Math.random());
                    return shuffled.slice(0, 20).map(q => ({
                        id: q.id,
                        _wordId: q.id,
                        problem: q.content.problem,
                        options: q.content.options,
                        answer: q.content.answer,
                        hint: q.content.hint,
                        explanation: q.content.explanation,
                        level: q.level,
                    }));
                },
            };
        }

        // 2. Full Exam (Info Proc Engineer - 전과목)
        if (subjectId === 'all') {
            return {
                subject: 'certificate',
                title: '정보처리기사 모의고사',
                courseCode: 'certificate_EIP_all',
                backPath: '/certificate',
                questionsPerRound: 100,
                timerSeconds: 150 * 60,   // 2.5시간
                scoreMultiplier: 5,
                optionColumns: 1,
                showPassFail: true,
                passThreshold: 0.6,
                loadQuestions: async () => {
                    const levels = [1, 2, 3, 4, 5];
                    let allQuestions = [];

                    for (const level of levels) {
                        const courseCode = `certificate_EIP_${level}`;
                        const { data, error } = await supabase
                            .from('words')
                            .select('*')
                            .eq('course_code', courseCode)
                            .eq('is_active', true);

                        if (error) {
                            console.error(`Error fetching level ${level}:`, error);
                            continue;
                        }

                        const shuffled = [...(data || [])].sort(() => 0.5 - Math.random());
                        const selected = shuffled.slice(0, 20).map(q => ({
                            id: q.id,
                            _wordId: q.id,
                            problem: q.content.problem,
                            options: q.content.options,
                            answer: q.content.answer,
                            hint: q.content.hint,
                            explanation: q.content.explanation,
                            level: `${level}과목`,
                        }));
                        allQuestions = [...allQuestions, ...selected];
                    }

                    return allQuestions;
                },
            };
        }

        // 3. Single Subject (Info Proc Engineer)
        const courseCode = `certificate_EIP_${subjectId}`;
        return {
            subject: 'certificate',
            title: `정보처리기사 ${subjectId}과목`,
            courseCode,
            backPath: '/certificate',
            questionsPerRound: 20,
            timerSeconds: 30 * 60,      // 30분
            scoreMultiplier: 5,
            optionColumns: 1,
            showPassFail: true,
            passThreshold: 0.6,
            loadQuestions: async () => {
                const { data, error } = await supabase
                    .from('words')
                    .select('*')
                    .eq('course_code', courseCode)
                    .eq('is_active', true);

                if (error) throw error;

                const shuffled = [...(data || [])].sort(() => 0.5 - Math.random());
                return shuffled.slice(0, 20).map(q => ({
                    id: q.id,
                    _wordId: q.id,
                    problem: q.content.problem,
                    options: q.content.options,
                    answer: q.content.answer,
                    hint: q.content.hint,
                    explanation: q.content.explanation,
                    level: q.level,
                }));
            },
        };
    }, [subjectId]);

    return <QuizScreen config={config} />;
};

export default CertificateQuizPage;

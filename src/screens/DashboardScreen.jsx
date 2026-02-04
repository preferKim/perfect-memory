import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Trash2, Play, BookOpen, Calculator, Globe, FlaskConical, Target, Award, Calendar } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import PageTransition from '../components/PageTransition';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';

// 과목별 아이콘 & 색상 맵핑
const SUBJECT_CONFIG = {
    english: { icon: Globe, color: 'primary', name: '영어', emoji: '🌍' },
    korean: { icon: BookOpen, color: 'success', name: '국어', emoji: '📚' },
    math: { icon: Calculator, color: 'speed', name: '수학', emoji: '🔢' },
    science: { icon: FlaskConical, color: 'warning', name: '과학', emoji: '🔬' },
    social: { icon: Globe, color: 'info', name: '사회', emoji: '🌏' },
    certificate: { icon: Award, color: 'primary', name: '자격증', emoji: '💻' },
};

const DashboardScreen = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getWeakWords, removeWeakWord, progress, fetchProgress, fetchGameSessions } = useLearningProgress(user?.id);

    const [weakWordsList, setWeakWordsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [sessions, setSessions] = useState([]);
    const [graphMode, setGraphMode] = useState('daily'); // 'daily' or 'weekly'

    // 초기 데이터 로딩
    useEffect(() => {
        const loadData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            await fetchProgress();
            const sessionData = await fetchGameSessions(100);
            setSessions(sessionData || []);

            const words = await getWeakWords(50);
            setWeakWordsList(words || []);
            setLoading(false);
        };
        loadData();
    }, [user?.id, getWeakWords, fetchProgress, fetchGameSessions]);

    // 과목별 통계 계산
    const subjectStats = useMemo(() => {
        const stats = {
            korean: { total: 0, correct: 0, wrong: 0, totalItems: 0, mastered: 0 },
            english: { total: 0, correct: 0, wrong: 0, totalItems: 0, mastered: 0 },
            math: { total: 0, correct: 0, wrong: 0, totalItems: 0, mastered: 0 },
            social: { total: 0, correct: 0, wrong: 0, totalItems: 0, mastered: 0 },
            science: { total: 0, correct: 0, wrong: 0, totalItems: 0, mastered: 0 },
            certificate: { total: 0, correct: 0, wrong: 0, totalItems: 0, mastered: 0 },
            total: { total: 0, correct: 0, wrong: 0 }
        };

        Object.values(progress || {}).forEach(item => {
            const code = item.course_code || '';
            const subject = Object.keys(SUBJECT_CONFIG).find(s => code.startsWith(s));

            if (subject) {
                stats[subject].total += (item.correct_count + item.wrong_count);
                stats[subject].correct += item.correct_count;
                stats[subject].wrong += item.wrong_count;

                // 진도율 계산을 위한 데이터 집계
                // progress_percent: 해당 코스의 진도율 (0 ~ 100)
                // totalItems: 해당 코스의 전체 문제 수
                const courseTotalItems = item.totalItems || 0;
                const courseProgressPercent = item.progress_percent || 0;

                stats[subject].totalItems += courseTotalItems;
                // 마스터한 문항 수 역산 (약식)
                if (courseTotalItems > 0) {
                    stats[subject].mastered += (courseProgressPercent / 100) * courseTotalItems;
                }

                stats.total.total += (item.correct_count + item.wrong_count);
                stats.total.correct += item.correct_count;
                stats.total.wrong += item.wrong_count;
            }
        });

        return stats;
    }, [progress]);

    // 그래프 데이터 가공
    const graphData = useMemo(() => {
        if (!sessions.length) return [];

        const grouped = {};

        sessions.forEach(session => {
            const date = new Date(session.started_at);
            let key;

            if (graphMode === 'daily') {
                key = `${date.getMonth() + 1}/${date.getDate()}`;
            } else {
                // Weekly logic (simplified)
                const startOfYear = new Date(date.getFullYear(), 0, 1);
                const pastDays = (date - startOfYear) / 86400000;
                const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
                key = `${weekNum}주차`;
            }

            if (!grouped[key]) {
                grouped[key] = { name: key, questions: 0, correct: 0, count: 0 };
            }

            grouped[key].questions += (session.total_questions || 0);
            grouped[key].correct += (session.correct_count || 0);
            grouped[key].count += 1;
        });

        return Object.values(grouped)
            .reverse() // 오래된 순으로 정렬
            .map(item => ({
                ...item,
                accuracy: item.questions > 0 ? Math.round((item.correct / item.questions) * 100) : 0
            }));
    }, [sessions, graphMode]);

    // 오답노트 필터링 로직
    const filteredWords = selectedSubject === 'all'
        ? weakWordsList
        : weakWordsList.filter(w => {
            const courseCode = w._courseCode || '';
            return courseCode.startsWith(selectedSubject);
        });

    const getDisplayText = (word) => {
        // 영어 단어
        if (word.english) return { main: word.english, sub: word.korean, extra: word.pronunciation };
        // 초성퀴즈
        if (word.chosung) return { main: word.chosung, sub: word.answer, extra: word.category };
        // 맞춤법/띄어쓰기
        if (word.question) return { main: word.question?.slice(0, 30) + (word.question?.length > 30 ? '...' : ''), sub: word.answer, extra: null };
        // 수학 문제
        if (word.problem) return { main: word.problem?.slice(0, 30) + (word.problem?.length > 30 ? '...' : ''), sub: word.answer, extra: word.stage ? `${word.stage}강` : null };
        // 과학/사회 퀴즈
        if (word.questionNumber !== undefined) {
            const correctOption = word.answerOptions?.find(opt => opt.isCorrect);
            return { main: word.question?.slice(0, 30) + (word.question?.length > 30 ? '...' : ''), sub: correctOption?.text || '', extra: null };
        }
        // 문학용어
        if (word.term) return { main: word.term, sub: word.description?.slice(0, 40) + '...', extra: null };

        return { main: JSON.stringify(word).slice(0, 30) + '...', sub: '', extra: null };
    };

    const handleRemoveWord = async (wordId) => {
        await removeWeakWord(wordId);
        setWeakWordsList(prev => prev.filter(w => w._wordId !== wordId));
    };

    const handleClearAll = async () => {
        if (!confirm('모든 약점 문제를 삭제하시겠습니까?')) return;
        for (const word of weakWordsList) {
            await removeWeakWord(word._wordId);
        }
        setWeakWordsList([]);
    };

    const SubjectCard = ({ subjectKey, stats }) => {
        const config = SUBJECT_CONFIG[subjectKey];
        const Icon = config.icon;

        // 정답률 (Accuracy)
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

        // 진도율 (Progress)
        // 전체 아이템 수가 0이면 진도율 0
        const progressPercent = stats.totalItems > 0
            ? Math.round((stats.mastered / stats.totalItems) * 100)
            : 0;

        return (
            <div className={`glass-card p-4 flex flex-col items-center justify-between border-b-4 border-${config.color}`}>
                <div className="flex items-center gap-2 mb-2 w-full">
                    <div className={`p-2 rounded-lg bg-${config.color}/20 text-${config.color}-light`}>
                        <Icon size={20} />
                    </div>
                    <span className="font-bold text-white">{config.name}</span>
                </div>
                <div className="flex flex-col items-center mb-1">
                    <div className="text-3xl font-bold text-white">{progressPercent}%</div>
                    <span className="text-[10px] text-gray-400">진도율</span>
                </div>
                <div className="w-full flex justify-between text-[10px] text-gray-400 mt-2 px-1 border-t border-white/10 pt-2">
                    <span>정답률 {accuracy}%</span>
                    <span>총 {stats.total}문제</span>
                </div>
            </div>
        );
    };

    return (
        <PageTransition className="min-h-screen p-4 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all flex items-center"
                    >
                        <ArrowLeft size={16} className="mr-1" /> 홈으로
                    </button>
                    <h1 className="text-2xl font-bold text-white">학습현황</h1>
                    <div className="w-20"></div>
                </div>

                {/* Overall Summary */}
                <div className="glass-card p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Target size={20} className="text-primary-light" />
                            전체 학습 현황
                        </h2>
                        <span className="text-sm text-gray-400">
                            총 {subjectStats.total.total}문제 풀이
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {Object.keys(SUBJECT_CONFIG).map(key => (
                            <SubjectCard key={key} subjectKey={key} stats={subjectStats[key]} />
                        ))}
                    </div>
                </div>

                {/* Learning Curve Graph */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 mb-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Calendar size={20} className="text-success-light" />
                            학습 곡선
                        </h2>
                        <div className="flex bg-black/30 rounded-lg p-1">
                            <button
                                onClick={() => setGraphMode('daily')}
                                className={`px-3 py-1 text-xs rounded-md transition ${graphMode === 'daily' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                            >
                                일간
                            </button>
                            <button
                                onClick={() => setGraphMode('weekly')}
                                className={`px-3 py-1 text-xs rounded-md transition ${graphMode === 'weekly' ? 'bg-white/20 text-white' : 'text-gray-400'}`}
                            >
                                주간
                            </button>
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        {graphData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={graphData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                                    <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickLine={false} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tickLine={false} unit="%" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="questions" name="학습량(문제)" fill="#60a5fa" barSize={20} radius={[4, 4, 0, 0]} />
                                    <Line yAxisId="right" type="monotone" dataKey="accuracy" name="정답률(%)" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                아직 학습 데이터가 충분하지 않습니다.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Weak Words Section (Keep existing logic mostly) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Brain size={20} className="text-danger-light" />
                            오답노트 ({weakWordsList.length})
                        </h2>
                        {weakWordsList.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs text-gray-400 hover:text-danger-light transition flex items-center gap-1"
                            >
                                <Trash2 size={14} />
                                전체 삭제
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setSelectedSubject('all')}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${selectedSubject === 'all' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}
                        >
                            전체
                        </button>
                        {Object.entries(SUBJECT_CONFIG).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedSubject(key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${selectedSubject === key ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}
                            >
                                {config.name}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-400">로딩 중...</div>
                    ) : filteredWords.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            오답 노트가 비어있습니다.
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                                {filteredWords.slice(0, 10).map((word, index) => {
                                    const display = getDisplayText(word);
                                    let courseCode = word._courseCode || '';
                                    let subjectKey = Object.keys(SUBJECT_CONFIG).find(s => courseCode.startsWith(s)) || 'english';
                                    const config = SUBJECT_CONFIG[subjectKey] || SUBJECT_CONFIG.english;

                                    return (
                                        <div
                                            key={word._wordId || index}
                                            className="bg-white/5 rounded-lg p-3 flex items-center justify-between hover:bg-white/10 transition cursor-pointer"
                                            onClick={() => navigate('/wrong-answer', { state: { customWords: [word], subject: subjectKey } })}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`p-1.5 rounded bg-${config.color}/10 text-${config.color}-light shrink-0`}>
                                                    {config.emoji}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-white truncate">{display.main}</div>
                                                    <div className="text-xs text-gray-400 truncate">{display.sub}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs bg-danger/20 text-danger-light px-2 py-0.5 rounded-full">
                                                    {word._wrongCount}회 오답
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveWord(word._wordId);
                                                    }}
                                                    className="text-gray-500 hover:text-danger-light p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Button
                                onClick={() => navigate('/wrong-answer', { state: { customWords: filteredWords, subject: selectedSubject === 'all' ? 'mixed' : selectedSubject } })}
                                variant="threedee"
                                color="danger"
                                className="w-full text-sm py-2"
                            >
                                <Play size={16} className="mr-2 inline" />
                                오답 학습 시작 ({filteredWords.length})
                            </Button>
                        </>
                    )}
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default DashboardScreen;

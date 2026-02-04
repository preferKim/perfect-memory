import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Target, Award, Brain, Trash2, Play, BookOpen, Calculator, Globe, FlaskConical } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import PageTransition from '../components/PageTransition';

// 과목별 아이콘 & 색상 맵핑
const SUBJECT_CONFIG = {
    english: { icon: Globe, color: 'primary', name: '영어', emoji: '🌍' },
    korean: { icon: BookOpen, color: 'success', name: '국어', emoji: '📚' },
    math: { icon: Calculator, color: 'speed', name: '수학', emoji: '🔢' },
    science: { icon: FlaskConical, color: 'warning', name: '과학', emoji: '🔬' },
    social: { icon: Globe, color: 'info', name: '사회', emoji: '🌏' },
};

const DashboardScreen = () => {
    const navigate = useNavigate();
    const { level, xp, xpGainedInCurrentLevel, xpRequiredForCurrentLevel } = usePlayer();
    const { user } = useAuth();
    const { getWeakWords, removeWeakWord } = useLearningProgress(user?.id);

    const [weakWordsList, setWeakWordsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState('all');

    // 약점 단어 로딩
    useEffect(() => {
        const loadWeakWords = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            const words = await getWeakWords(50); // 최대 50개 가져오기
            setWeakWordsList(words || []);
            setLoading(false);
        };
        loadWeakWords();
    }, [user?.id, getWeakWords]);

    // 과목별 필터링
    const filteredWords = selectedSubject === 'all'
        ? weakWordsList
        : weakWordsList.filter(w => {
            const courseCode = w._courseCode || '';
            return courseCode.startsWith(selectedSubject);
        });

    // 과목별 개수 계산
    const countBySubject = weakWordsList.reduce((acc, word) => {
        const courseCode = word._courseCode || '';
        const subject = Object.keys(SUBJECT_CONFIG).find(s => courseCode.startsWith(s)) || 'other';
        acc[subject] = (acc[subject] || 0) + 1;
        acc.all = (acc.all || 0) + 1;
        return acc;
    }, { all: 0 });

    // 약점 문제에서 표시할 텍스트 추출
    const getDisplayText = (word) => {
        // 영어 단어
        if (word.english) {
            return {
                main: word.english,
                sub: word.korean,
                extra: word.pronunciation
            };
        }
        // 초성퀴즈
        if (word.chosung) {
            return {
                main: word.chosung,
                sub: word.answer,
                extra: word.category
            };
        }
        // 맞춤법/띄어쓰기
        if (word.question) {
            return {
                main: word.question?.slice(0, 30) + (word.question?.length > 30 ? '...' : ''),
                sub: word.answer,
                extra: null
            };
        }
        // 수학 문제
        if (word.problem) {
            return {
                main: word.problem?.slice(0, 30) + (word.problem?.length > 30 ? '...' : ''),
                sub: word.answer,
                extra: word.stage ? `${word.stage}강` : null
            };
        }
        // 과학/사회 퀴즈
        if (word.questionNumber !== undefined) {
            const correctOption = word.answerOptions?.find(opt => opt.isCorrect);
            return {
                main: word.question?.slice(0, 30) + (word.question?.length > 30 ? '...' : ''),
                sub: correctOption?.text || '',
                extra: null
            };
        }
        // 문학용어
        if (word.term) {
            return {
                main: word.term,
                sub: word.description?.slice(0, 40) + '...',
                extra: null
            };
        }
        // 기본값
        return {
            main: JSON.stringify(word).slice(0, 30) + '...',
            sub: '',
            extra: null
        };
    };

    const getSubjectFromWord = (word) => {
        const courseCode = word._courseCode || '';
        return Object.keys(SUBJECT_CONFIG).find(s => courseCode.startsWith(s)) || 'other';
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

    const handleStartWrongAnswerStudy = () => {
        if (filteredWords.length === 0) {
            alert('학습할 약점 문제가 없습니다!');
            return;
        }

        // 오답노트 학습 모드로 이동
        navigate('/game', {
            state: {
                name: selectedSubject === 'all' ? '오답노트 전체 학습' : `${SUBJECT_CONFIG[selectedSubject]?.name || selectedSubject} 오답노트`,
                level: 'custom',
                mode: 'normal',
                gameType: 'wrong_answers',
                customWords: filteredWords.map(w => ({
                    ...w,
                    wordId: w._wordId
                })),
                subject: selectedSubject === 'all' ? 'mixed' : selectedSubject
            }
        });
    };

    const StatCard = ({ icon: Icon, title, value, color = 'primary' }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 text-center"
        >
            <div className={`flex justify-center mb-3`}>
                <Icon size={32} className={`text-${color}-light`} />
            </div>
            <div className={`text-4xl font-bold text-${color}-light mb-2`}>
                {value}
            </div>
            <div className="text-sm text-gray-300">{title}</div>
        </motion.div>
    );

    return (
        <PageTransition className="min-h-screen p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all flex items-center"
                    >
                        <ArrowLeft size={16} className="mr-1" /> 홈으로
                    </button>
                    <h1 className="text-3xl font-bold text-white">학습 대시보드</h1>
                    <div className="w-20"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard icon={Award} title="현재 레벨" value={level} color="primary" />
                    <StatCard icon={TrendingUp} title="총 경험치" value={xp} color="success" />
                    <StatCard icon={Target} title="정답률" value="-%" color="speed" />
                    <StatCard icon={Brain} title="약점 문제" value={weakWordsList.length} color="danger" />
                </div>

                {/* Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 mb-6"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-white">레벨 진행도</h2>
                        <span className="text-gray-300">
                            {xpGainedInCurrentLevel} / {xpRequiredForCurrentLevel} XP
                        </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(xpGainedInCurrentLevel / xpRequiredForCurrentLevel) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Weak Words Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Brain size={24} className="text-danger-light" />
                            오답노트 (약점 문제)
                        </h2>
                        {weakWordsList.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-sm text-gray-400 hover:text-danger-light transition flex items-center gap-1"
                            >
                                <Trash2 size={16} />
                                전체 삭제
                            </button>
                        )}
                    </div>

                    {/* Subject Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setSelectedSubject('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedSubject === 'all'
                                ? 'bg-white/20 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            전체 ({countBySubject.all || 0})
                        </button>
                        {Object.entries(SUBJECT_CONFIG).map(([key, config]) => (
                            (countBySubject[key] > 0) && (
                                <button
                                    key={key}
                                    onClick={() => setSelectedSubject(key)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${selectedSubject === key
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <span>{config.emoji}</span>
                                    {config.name} ({countBySubject[key] || 0})
                                </button>
                            )
                        ))}
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">로딩 중...</div>
                    ) : filteredWords.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🎉</div>
                            <p className="text-xl text-gray-300 mb-2">
                                {selectedSubject === 'all' ? '약점 문제가 없습니다!' : `${SUBJECT_CONFIG[selectedSubject]?.name || selectedSubject} 약점 문제가 없습니다!`}
                            </p>
                            <p className="text-sm text-gray-400">완벽해요! 계속 학습을 이어가세요.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                                {filteredWords.slice(0, 20).map((word, index) => {
                                    const display = getDisplayText(word);
                                    const subject = getSubjectFromWord(word);
                                    const config = SUBJECT_CONFIG[subject] || { emoji: '📝', name: '기타' };

                                    return (
                                        <motion.div
                                            key={word._wordId || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="bg-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                    <span className="text-lg" title={config.name}>{config.emoji}</span>
                                                    <span className="text-lg font-bold text-white truncate">
                                                        {display.main}
                                                    </span>
                                                    <span className="text-sm bg-danger/20 text-danger-light px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        {word._wrongCount}회 오답
                                                    </span>
                                                    {word._correctCount > 0 && (
                                                        <span className="text-sm bg-success/20 text-success-light px-2 py-0.5 rounded-full whitespace-nowrap">
                                                            {word._correctCount}회 정답
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-base text-gray-300 truncate">{display.sub}</div>
                                                {display.extra && (
                                                    <div className="text-sm text-primary-light font-mono">{display.extra}</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveWord(word._wordId)}
                                                className="text-gray-400 hover:text-danger-light transition p-2 flex-shrink-0"
                                                aria-label="삭제"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <Button
                                onClick={handleStartWrongAnswerStudy}
                                variant="threedee"
                                color="danger"
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <Play size={20} />
                                {selectedSubject === 'all'
                                    ? `오답노트 전체 학습 (${filteredWords.length}문제)`
                                    : `${SUBJECT_CONFIG[selectedSubject]?.name} 오답 학습 (${filteredWords.length}문제)`
                                }
                            </Button>
                        </>
                    )}
                </motion.div>
            </div>
        </PageTransition>
    );
};

export default DashboardScreen;

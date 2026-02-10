import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Button from '../components/Button';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../hooks/useAuth';
import { useLearningProgress } from '../hooks/useLearningProgress';

const LiteraryTermsQuiz = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addXp } = usePlayer();
    const { recordAnswer, startSession, endSession } = useLearningProgress(user?.id);
    const sessionRef = useRef(null);
    const nextButtonRef = useRef(null);
    const [allTerms, setAllTerms] = useState([]);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [userAnswer, setUserAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [explanationTerm, setExplanationTerm] = useState(null);

    const generateQuestions = useCallback((terms) => {
        if (terms.length < 4) return [];

        const shuffledTerms = [...terms].sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffledTerms.slice(0, 10);

        const generated = selectedQuestions.map(correctTerm => {
            const questionType = Math.random() > 0.5 ? 'definition' : 'example';
            const distractors = terms
                .filter(t => t.term !== correctTerm.term)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(t => t.term);

            const options = [...distractors, correctTerm.term].sort(() => 0.5 - Math.random());

            let questionText = '';
            if (questionType === 'definition' || !correctTerm.examples || correctTerm.examples.length === 0) {
                questionText = correctTerm.description;
            } else {
                const randomExample = correctTerm.examples[Math.floor(Math.random() * correctTerm.examples.length)];
                questionText = `다음 문장에 사용된 표현 기법은?\n\n"${randomExample.quote}"`;
            }

            return {
                question: questionText,
                options: options,
                answer: correctTerm.term,
            };
        });
        setQuizQuestions(generated);
    }, []);

    useEffect(() => {
        fetch('/words/korean_literary_terms.json')
            .then(res => res.json())
            .then(data => {
                setAllTerms(data);
                generateQuestions(data);
            })
            .catch(error => console.error("Failed to load literary terms:", error));
    }, [generateQuestions]);

    // 세션 시작
    useEffect(() => {
        const initSession = async () => {
            if (user?.id && quizQuestions.length > 0 && !sessionRef.current) {
                console.log('Starting session for: korean_literary_terms');
                sessionRef.current = await startSession('korean_literary_terms', 'quiz');
            }
        };
        initSession();
    }, [user?.id, quizQuestions.length, startSession]);

    // Scroll to the next question button when it appears
    useEffect(() => {
        if (isAnswered && nextButtonRef.current) {
            nextButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [isAnswered]);

    const handleAnswerSelect = async (option) => {
        if (isAnswered) return;

        setUserAnswer(option);
        setIsAnswered(true);

        const currentQuestion = quizQuestions[currentQuestionIndex];
        const correctTermAnswer = currentQuestion.answer;
        const correctTermDetails = allTerms.find(t => t.term === correctTermAnswer);
        setExplanationTerm(correctTermDetails);

        const isCorrect = option === correctTermAnswer;

        if (isCorrect) {
            setScore(prev => prev + 10);
            setFeedbackText('정답입니다! 🎉');
            addXp('korean', 1);
        } else {
            setFeedbackText('오답입니다 😥');
        }

        // DB에 답안 기록 (오답 시 약점 문제로 저장)
        if (user?.id && currentQuestion._wordId) {
            try {
                await recordAnswer(currentQuestion._wordId, isCorrect, option);
            } catch (err) {
                console.error('Failed to record answer:', err);
            }
        }
    };

    const handleNextQuestion = () => {
        setIsAnswered(false);
        setUserAnswer(null);
        setFeedbackText('');
        setExplanationTerm(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const handleRestart = () => {
        generateQuestions(allTerms);
        setCurrentQuestionIndex(0);
        setScore(0);
        setUserAnswer(null);
        setIsAnswered(false);
        setFeedbackText('');
        setExplanationTerm(null);
    };

    if (quizQuestions.length === 0) {
        return <div className="glass-card p-6 text-center text-white text-xl">퀴즈를 생성하는 중...</div>;
    }

    const isGameOver = currentQuestionIndex >= quizQuestions.length;

    if (isGameOver) {
        if (user?.id && sessionRef.current) {
            endSession({
                totalQuestions: quizQuestions.length,
                correctCount: score / 10,
                wrongCount: quizQuestions.length - (score / 10),
                score: score
            });
            sessionRef.current = null;
        }

        return (
            <div className="glass-card p-8 text-center flex flex-col items-center gap-6">
                <h3 className="text-4xl font-bold text-white">게임 종료!</h3>
                <p className="text-2xl text-primary-light">최종 점수: <span className="font-bold text-white">{score}</span>점</p>
                <Button onClick={handleRestart} variant="threedee" color="secondary" className="mt-4">
                    다시하기
                </Button>
                <Button onClick={() => navigate(-1)} variant="threedee" color="gray" className="mt-2">
                    나가기
                </Button>
            </div>
        );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
        <div className="glass-card p-4 sm:p-8 text-center relative flex flex-col items-center max-w-2xl mx-auto">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-4">
                <div className="w-1/3 text-left">
                    <button onClick={() => navigate(-1)} className="text-gray-200 hover:text-white transition p-2" title="뒤로가기">
                        <ArrowLeft size={24} />
                    </button>
                </div>
                <div className="w-1/3 text-center">
                    <p className="text-2xl text-white font-bold">문학 개념어 퀴즈</p>
                </div>
                <div className="w-1/3 text-right">
                    <p className="text-xl text-primary-light font-semibold">점수: {score}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
            </div>
            <p className="text-sm text-gray-300 mb-4">{currentQuestionIndex + 1} / {quizQuestions.length}</p>

            {/* Question */}
            <div className="bg-black/20 p-8 rounded-2xl mb-6 min-h-[150px] flex items-center justify-center w-full">
                <p className="text-xl sm:text-2xl text-white font-medium leading-relaxed whitespace-pre-line">{currentQuestion.question}</p>
            </div>

            {/* Options */}
            <div className={`grid grid-cols-2 gap-4 w-full mb-4 ${isAnswered ? 'pointer-events-none' : ''}`}>
                {currentQuestion.options.map(option => {
                    let buttonColor = 'primary';
                    if (isAnswered) {
                        if (option === currentQuestion.answer) {
                            buttonColor = 'success';
                        } else if (option === userAnswer) {
                            buttonColor = 'danger';
                        } else {
                            buttonColor = 'gray';
                        }
                    }
                    return (
                        <Button
                            key={option}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={isAnswered}
                            variant="threedee"
                            color={buttonColor}
                            className="w-full h-24 text-lg sm:text-xl flex items-center justify-center"
                        >
                            {option.split(' ')[0]}
                        </Button>
                    );
                })}
            </div>

            {isAnswered && (
                <div className="w-full mt-4">
                    <p className={`text-2xl font-bold mb-4 ${feedbackText.includes('정답') ? 'text-green-400' : 'text-red-400'}`}>
                        {feedbackText}
                    </p>

                    {explanationTerm && (
                        <div className="glass-card p-6 rounded-lg mb-6 w-full text-left animate-card-appear">
                            <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
                                <BookOpen size={20} className="mr-2 text-yellow-400" /> 정답 해설
                            </h4>
                            <h3 className="text-2xl font-bold text-primary-light mb-4">{explanationTerm.term}</h3>
                            <p className="text-lg text-gray-200 mb-6 leading-relaxed">{explanationTerm.description}</p>

                            {explanationTerm.examples && explanationTerm.examples.length > 0 && (
                                <div className="border-t border-white/20 pt-4 mt-4">
                                    <h4 className="text-lg font-semibold text-white mb-3">예시</h4>
                                    {explanationTerm.examples.map((example, index) => (
                                        <div key={index} className="mb-4 last:mb-0 p-3 bg-black/10 rounded-md">
                                            <p className="text-md text-gray-100 italic">"{example.quote}"</p>
                                            {example.source && <p className="text-sm text-gray-400">- {example.source}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <Button
                        ref={nextButtonRef} // Attach ref to the button
                        onClick={handleNextQuestion}
                        variant="threedee"
                        color="secondary"
                        className="w-full"
                    >
                        다음 문제
                    </Button>
                </div>
            )}
        </div>
    );
};

export default LiteraryTermsQuiz;

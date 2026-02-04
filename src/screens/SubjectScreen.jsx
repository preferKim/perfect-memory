import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Gamepad2, Target, Keyboard, Hash, Puzzle, Award } from 'lucide-react';
import Button from '../components/Button';
import HeaderSection from '../components/HeaderSection';
import OnboardingModal from '../components/OnboardingModal';

const SubjectScreen = ({ onSignUp, onLogin, onLogout, user }) => {
    const navigate = useNavigate();
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial) {
            setShowOnboarding(true);
        }
    }, []);

    const handleSubjectClick = (subject) => {
        if (subject.startsWith('playground-')) {
            const game = subject.split('-')[1];
            navigate(`/playground/${game}`);
        } else if (subject === 'english' || subject === 'math' || subject === 'korean' || subject === 'social' || subject === 'science' || subject === 'certificate') {
            navigate(`/${subject}`);
        } else {
            alert('아직 준비되지 않은 과목입니다.');
        }
    };

    return (
        <>
            {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
            <div className="glass-card p-6 sm:p-8 text-center relative max-w-4xl mx-auto">
                <HeaderSection
                    onSignUp={onSignUp}
                    onLogin={onLogin}
                    onLogout={onLogout}
                    user={user}
                />

                <div className="space-y-5">

                    {/* 공부방 Section */}
                    <div className="bg-black/10 rounded-2xl p-6">
                        <div className="flex items-center justify-center mb-5">
                            <BookOpen className="text-blue-300 mr-3" size={28} />
                            <h2 className="text-2xl font-bold text-white">공부방</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                            <Button onClick={() => handleSubjectClick('korean')} variant="threedee" color="secondary" className="w-full h-28 flex flex-col items-center justify-center">
                                <span className="text-2xl">📖</span><br />국어
                            </Button>
                            <Button onClick={() => handleSubjectClick('english')} variant="threedee" color="primary" className="w-full h-28 flex flex-col items-center justify-center">
                                <span className="text-2xl">🔤</span><br />영어
                            </Button>
                            <Button onClick={() => handleSubjectClick('math')} variant="threedee" color="danger" className="w-full h-28 flex flex-col items-center justify-center">
                                <span className="text-2xl">➕</span><br />수학
                            </Button>
                            <Button onClick={() => handleSubjectClick('social')} variant="threedee" color="success" className="w-full h-28 flex flex-col items-center justify-center">
                                <span className="text-2xl">🏛️</span><br />사회
                            </Button>
                            <Button onClick={() => handleSubjectClick('science')} variant="threedee" color="speed" className="w-full h-28 flex flex-col items-center justify-center">
                                <span className="text-2xl">🔬</span><br />과학
                            </Button>
                        </div>
                    </div>

                    {/* 자격증 Section */}
                    <div className="bg-black/10 rounded-2xl p-6">
                        <div className="flex items-center justify-center mb-5">
                            <Award className="text-purple-300 mr-3" size={28} />
                            <h2 className="text-2xl font-bold text-white">자격증</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
                            <Button onClick={() => handleSubjectClick('certificate')} variant="threedee" color="primary" className="w-full h-24 flex items-center justify-center gap-4">
                                <span className="text-3xl">💻</span>
                                <div className="text-left">
                                    <div className="text-xl font-bold">정보처리기사</div>
                                    <div className="text-sm opacity-80">기출문제 풀이</div>
                                </div>
                            </Button>
                        </div>
                    </div>

                    {/* 놀이터 Section */}
                    <div className="bg-black/10 rounded-2xl p-6">
                        <div className="flex items-center justify-center mb-5">
                            <Gamepad2 className="text-green-300 mr-3" size={28} />
                            <h2 className="text-2xl font-bold text-white">놀이터</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                            <Button onClick={() => handleSubjectClick('playground-clicker')} variant="threedee" color="secondary" className="w-full h-28 flex flex-col items-center justify-center">
                                <Target size={28} className="text-white mb-1" /><br />클릭<br />게임
                            </Button>
                            <Button onClick={() => handleSubjectClick('playground-typing')} variant="threedee" color="primary" className="w-full h-28 flex flex-col items-center justify-center">
                                <Keyboard size={28} className="text-white mb-1" /><br />타이핑<br />게임
                            </Button>
                            <Button onClick={() => handleSubjectClick('playground-guessing')} variant="threedee" color="danger" className="w-full h-28 flex flex-col items-center justify-center">
                                <Hash size={28} className="text-white mb-1" /><br />맞추기<br />게임
                            </Button>
                            <Button onClick={() => handleSubjectClick('playground-puzzle')} variant="threedee" color="warning" className="w-full h-28 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500">
                                <Puzzle size={28} className="text-white mb-1" /><br />퍼즐<br />게임
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default SubjectScreen;

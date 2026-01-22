import React from 'react';
import { BookOpen, Gamepad2 } from 'lucide-react';
import Button from '../components/Button';
import HeaderSection from '../components/HeaderSection';

const SubjectScreen = ({ onSubjectSelect, onSignUp, onLogin, onLogout, user, onNavigate }) => {
    const handleSubjectClick = (subject) => {
        if (subject.startsWith('playground-')) {
            onSubjectSelect(subject);
        } else if (subject === 'english' || subject === 'math') {
            onSubjectSelect(subject);
        } else {
            alert('아직 준비되지 않은 과목입니다.');
        }
    };

    return (
        <div className="glass-card p-6 sm:p-8 text-center relative max-w-4xl mx-auto">
            <HeaderSection
                onSignUp={onSignUp}
                onLogin={onLogin}
                onLogout={onLogout}
                user={user}
                onNavigate={onNavigate}
            />

            <div className="space-y-5">
                {/* 공부방 Section */}
                <div className="bg-black/10 rounded-2xl p-6">
                    <div className="flex items-center justify-center mb-5">
                        <BookOpen className="text-blue-300 mr-3" size={28} />
                        <h2 className="text-2xl font-bold text-white">공부방</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                        <Button onClick={() => handleSubjectClick('korean')} variant="threedee" color="secondary" className="w-full h-28 flex flex-col items-center justify-center" disabled={true}>
                            <span className="text-2xl">📖</span><br/>국어<br/><span className="text-sm font-light opacity-70">준비중</span>
                        </Button>
                        <Button onClick={() => handleSubjectClick('english')} variant="threedee" color="primary" className="w-full h-28 flex flex-col items-center justify-center">
                            <span className="text-2xl">🔤</span><br/>영어
                        </Button>
                        <Button onClick={() => handleSubjectClick('math')} variant="threedee" color="danger" className="w-full h-28 flex flex-col items-center justify-center">
                            <span className="text-2xl">➕</span><br/>수학
                        </Button>
                        <Button onClick={() => handleSubjectClick('social')} variant="threedee" color="success" className="w-full h-28 flex flex-col items-center justify-center" disabled={true}>
                            <span className="text-2xl">🏛️</span><br/>사회<br/><span className="text-sm font-light opacity-70">준비중</span>
                        </Button>
                        <Button onClick={() => handleSubjectClick('science')} variant="threedee" color="speed" className="w-full h-28 flex flex-col items-center justify-center" disabled={true}>
                            <span className="text-2xl">🔬</span><br/>과학<br/><span className="text-sm font-light opacity-70">준비중</span>
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
                            <span className="text-2xl">🖱️</span><br/>클릭 게임
                        </Button>
                        <Button onClick={() => handleSubjectClick('playground-typing')} variant="threedee" color="primary" className="w-full h-28 flex flex-col items-center justify-center">
                            <span className="text-2xl">⌨️</span><br/>타이핑 게임
                        </Button>
                        <Button onClick={() => handleSubjectClick('playground-guessing')} variant="threedee" color="danger" className="w-full h-28 flex flex-col items-center justify-center">
                            <span className="text-2xl">🤔</span><br/>숫자 맞추기
                        </Button>
                        <Button onClick={() => handleSubjectClick('playground-puzzle')} variant="threedee" color="warning" className="w-full h-28 flex flex-col items-center justify-center">
                            <span className="text-2xl">🧩</span><br/>퍼즐 게임
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SubjectScreen;

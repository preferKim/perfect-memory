import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import HeaderSection from '../components/HeaderSection';

const SubjectScreen = ({ onSubjectSelect, onSignUp, onLogin, onLogout, user, onNavigate }) => {
    const handleSubjectClick = (subject) => {
        if (subject === 'english' || subject === 'math') {
            onSubjectSelect(subject);
        } else {
            alert('아직 준비되지 않은 과목입니다.');
        }
    };

    return (
        <div className="glass-card p-6 sm:p-12 text-center relative">
            <HeaderSection
                onSignUp={onSignUp}
                onLogin={onLogin}
                onLogout={onLogout}
                user={user}
                onNavigate={onNavigate}
            />

            <div className="mb-6">
                <p className="text-xl font-bold text-white mb-4">학습할 과목을 선택하세요!</p>
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
        </div>
    );
};
export default SubjectScreen;

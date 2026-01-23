import React from 'react';
import HeaderSection from '../components/HeaderSection';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
const KoreanSelectionScreen = ({ user, onNavigate, onSelectGame, onBackToSubjects }) => {

    const handleGameStart = (gameType) => {
        if (gameType === 'spelling') {
            onSelectGame('spelling');
        } else if (gameType === 'spacing') {
            onSelectGame('spacing');
        }
    };

    return (
        <div className="glass-card p-6 sm:p-12 text-center relative">
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={onBackToSubjects}
                    className="text-sm font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all flex items-center"
                >
                    <ArrowLeft size={16} className="mr-1" /> 과목선택
                </button>
            </div>
            
            <HeaderSection
                user={user}
                onNavigate={onNavigate}
            />

            <div className="mb-6 mt-8">
                <p className="text-xl font-bold text-white mb-4">
                    <span className="inline-block border-b-2 border-primary-light pb-1">도전할 게임을 골라보세요!</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Button
                        onClick={() => handleGameStart('spelling')}
                        variant="threedee"
                        color="primary"
                        className="w-full h-32 text-2xl"
                    >
                        📝<br/>맞춤법
                    </Button>
                    <Button
                        onClick={() => handleGameStart('spacing')}
                        variant="threedee"
                        color="secondary"
                        className="w-full h-32 text-2xl"
                    >
                        ✍️<br/>띄어쓰기
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default KoreanSelectionScreen;

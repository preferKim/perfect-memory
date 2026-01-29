import React from 'react';
import HeaderSection from '../components/HeaderSection';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
const KoreanSelectionScreen = ({ user, onNavigate, onSelectGame, onBackToSubjects }) => {

    const handleGameStart = (gameType) => {
        if (gameType === 'spelling' || gameType === 'spacing' || gameType === 'chosung') {
            onSelectGame(gameType);
        } else {
            console.log(`Attempted to start game: ${gameType}, but it's not implemented yet.`);
        }
    };

    const handleComingSoon = (featureName) => {
        alert(`${featureName} (준비중)`);
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
                {/* 초등: 재미와 어휘 */}
                <p className="text-xl font-bold text-white mb-4">
                    <span className="inline-block border-b-2 border-primary-light pb-1">초등 (재미와 어휘)</span>
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
                    <Button
                        onClick={() => handleGameStart('spelling')}
                        variant="threedee"
                        color="primary"
                        className="w-full h-32 text-xl flex flex-col justify-center items-center"
                    >
                        📝 맞춤법
                    </Button>
                    <Button
                        onClick={() => handleGameStart('spacing')}
                        variant="threedee"
                        color="secondary"
                        className="w-full h-32 text-xl flex flex-col justify-center items-center"
                    >
                        ✍️ 띄어쓰기
                    </Button>
                    <Button
                        onClick={() => handleGameStart('chosung')}
                        variant="threedee"
                        color="success" // Changed from 'green' to 'success'
                        className="w-full h-32 text-xl flex flex-col justify-center items-center"
                    >
                        🧐 초성 퀴즈
                    </Button>
                    <Button
                        onClick={() => handleComingSoon('문장 따라쓰기')}
                        variant="threedee"
                        color="gray"
                        className="w-full h-32 text-2xl"
                    >
                        🖋️<br/>문장 따라쓰기<br/><span className="text-sm">(준비중)</span>
                    </Button>
                </div>

                {/* 중등: 개념과 독해 */}
                <p className="text-xl font-bold text-white mb-4">
                    <span className="inline-block border-b-2 border-primary-light pb-1">중등 (개념과 독해)</span>
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
                    <Button
                        onClick={() => handleComingSoon('문학 개념어')}
                        variant="threedee"
                        color="gray"
                        className="w-full h-32 text-2xl"
                    >
                        📚<br/>문학 개념어<br/><span className="text-sm">(준비중)</span>
                    </Button>
                    <Button
                        onClick={() => handleComingSoon('비문학 요약 훈련')}
                        variant="threedee"
                        color="gray"
                        className="w-full h-32 text-2xl"
                    >
                        📰<br/>비문학 요약 훈련<br/><span className="text-sm">(준비중)</span>
                    </Button>
                    <Button
                        onClick={() => handleComingSoon('한자어 뿌리 찾기')}
                        variant="threedee"
                        color="gray"
                        className="w-full h-32 text-2xl"
                    >
                        🗄️<br/>한자어 뿌리 찾기<br/><span className="text-sm">(준비중)</span>
                    </Button>
                </div>

                {/* 고등: 실전과 분석 */}
                <p className="text-xl font-bold text-white mb-4">
                    <span className="inline-block border-b-2 border-primary-light pb-1">고등 (실전과 분석)</span>
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
                    <Button
                        onClick={() => handleComingSoon('자동 오답노트')}
                        variant="threedee"
                        color="gray"
                        className="w-full h-32 text-2xl"
                    >
                        📋<br/>자동 오답노트<br/><span className="text-sm">(준비중)</span>
                    </Button>
                    <Button
                        onClick={() => handleComingSoon('지문 끊어읽기')}
                        variant="threedee"
                        color="gray"
                        className="w-full h-32 text-2xl"
                    >
                        ✂️<br/>지문 끊어읽기<br/><span className="text-sm">(준비중)</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};


export default KoreanSelectionScreen;

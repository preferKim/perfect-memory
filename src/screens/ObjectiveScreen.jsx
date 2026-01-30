import React from 'react';
import { ArrowLeft, X as XIcon } from 'lucide-react';
import MathRenderer from '../components/MathRenderer';

const ObjectiveScreen = ({ lecture, objective, isStageAvailable, onStart, onBack }) => {
    return (
        <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-screen">
            <div className="glass-card max-w-lg w-full rounded-2xl p-6 sm:p-8 border border-white/20 relative">
                <button 
                    onClick={onBack} 
                    className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Back"
                >
                    <XIcon size={20} className="text-gray-400" />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 pr-8">
                    <span className="text-primary-light">✔️</span> {lecture.title}
                </h2>
                
                <div className="min-h-[100px]">
                    {isStageAvailable ? (
                        <>
                            <h3 className="font-semibold text-primary-light mb-2">📚 학습 목표</h3>
                            <p className="text-gray-300 mb-6 text-base sm:text-lg">
                                {objective ? (
                                    <MathRenderer text={objective} />
                                ) : (
                                    '학습 목표를 불러오는 중...'
                                )}
                            </p>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-300 text-lg">문제 준비중입니다.</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                     {isStageAvailable && (
                        <button 
                            onClick={onStart} 
                            className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            학습 시작
                        </button>
                     )}
                    <button 
                        onClick={onBack} 
                        className="flex-1 bg-white/10 hover:bg-white/20 text-gray-200 font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ObjectiveScreen;

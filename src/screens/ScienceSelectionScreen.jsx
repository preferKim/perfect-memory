import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderSection from '../components/HeaderSection';
import { ArrowLeft, Beaker, BrainCircuit, Rocket } from 'lucide-react';
import Button from '../components/Button';

const ScienceSelectionScreen = ({ user }) => {
    const navigate = useNavigate();

    const handleLevelSelect = (difficulty) => {
        navigate(`/science/${difficulty}`);
    };

    return (
        <div className="glass-card p-6 sm:p-12 text-center relative">
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => navigate('/')}
                    className="text-sm font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all flex items-center"
                >
                    <ArrowLeft size={16} className="mr-1" /> 과목선택
                </button>
            </div>
            
            <HeaderSection
                user={user}
                onNavigate={(screen) => navigate(`/${screen}`)}
            />

            <div className="mb-6 mt-8">
                <p className="text-2xl font-bold text-white mb-6">
                    <span className="inline-block border-b-2 border-primary-light pb-1">과학 (Science)</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
                    <Button
                        onClick={() => handleLevelSelect('easy')}
                        variant="threedee"
                        color="primary"
                        className="w-full h-40 text-xl flex flex-col justify-center items-center"
                    >
                        <Beaker size={32} className="mb-2" />
                        초등<br/>(호기심 탐구)
                    </Button>
                    <Button
                        onClick={() => handleLevelSelect('medium')}
                        variant="threedee"
                        color="secondary"
                        className="w-full h-40 text-xl flex flex-col justify-center items-center"
                    >
                        <BrainCircuit size={32} className="mb-2" />
                        중등<br/>(개념 완성)
                    </Button>
                    <Button
                        onClick={() => handleLevelSelect('hard')}
                        variant="threedee"
                        color="danger"
                        className="w-full h-40 text-xl flex flex-col justify-center items-center"
                    >
                        <Rocket size={32} className="mb-2" />
                        고등<br/>(심화 응용)
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ScienceSelectionScreen;

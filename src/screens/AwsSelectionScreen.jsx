import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cloud, Shield, Server, Codepen } from 'lucide-react';
import HeaderSection from '../components/HeaderSection';
import PageTransition from '../components/PageTransition';

const awsExams = [
    {
        id: 'AWS_CLF-C02',
        title: 'Cloud Practitioner',
        code: 'CLF-C02',
        level: 'Foundational',
        icon: <Cloud size={24} />,
        description: 'AWS 클라우드, 보안, 결제 등 기초 지식',
        color: 'text-gray-400',
        borderColor: 'border-gray-500/50',
        bgColor: 'bg-gray-500/10'
    },
    {
        id: 'AWS_SAA-C03',
        title: 'Solutions Architect',
        code: 'SAA-C03',
        level: 'Associate',
        icon: <Server size={24} />,
        description: '안전하고 견고한 애플리케이션 설계 능력',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/50',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 'AWS_DVA-C02',
        title: 'Developer',
        code: 'DVA-C02',
        level: 'Associate',
        icon: <Codepen size={24} />,
        description: 'AWS 기반 애플리케이션 개발 및 유지 관리',
        color: 'text-yellow-400',
        borderColor: 'border-yellow-500/50',
        bgColor: 'bg-yellow-500/10'
    },
    {
        id: 'AWS_SOA-C02',
        title: 'SysOps Administrator',
        code: 'SOA-C02',
        level: 'Associate',
        icon: <Shield size={24} />,
        description: 'AWS 환경의 배포, 관리, 운영 능력',
        color: 'text-purple-400',
        borderColor: 'border-purple-500/50',
        bgColor: 'bg-purple-500/10'
    }
];

const AwsSelectionScreen = ({ user, onSignUp, onLogin, onLogout }) => {
    const navigate = useNavigate();

    const handleExamSelect = (examId) => {
        navigate('/certificate/quiz', { state: { subjectId: examId } });
    };

    return (
        <PageTransition>
            <div className="glass-card p-6 sm:p-8 text-center relative max-w-4xl w-full mx-auto min-h-[80vh]">
                <div className="absolute top-4 left-4 z-10">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all flex items-center"
                    >
                        <ArrowLeft size={16} className="mr-1" /> 홈으로
                    </button>
                </div>

                <HeaderSection
                    onSignUp={onSignUp}
                    onLogin={onLogin}
                    onLogout={onLogout}
                    user={user}
                />

                <div className="mt-12 mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">AWS 전문가</h1>
                    <p className="text-gray-300">응시할 자격증 시험을 선택하세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {awsExams.map((exam) => (
                        <button
                            key={exam.id}
                            onClick={() => handleExamSelect(exam.id)}
                            className={`group relative overflow-hidden rounded-xl p-6 text-left transition-all hover:scale-[1.02] border border-white/10 hover:border-white/30 bg-black/20 hover:bg-white/5`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${exam.bgColor} ${exam.color}`}>
                                    {exam.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${exam.borderColor} ${exam.color} bg-black/30`}>
                                            {exam.level}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-primary-light transition-colors">
                                        {exam.title}
                                    </h3>
                                    <div className="text-sm text-gray-400 font-mono mb-2">{exam.code}</div>
                                    <p className="text-sm text-gray-500">{exam.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </PageTransition>
    );
};

export default AwsSelectionScreen;

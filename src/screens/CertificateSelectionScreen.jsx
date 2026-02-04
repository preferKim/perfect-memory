import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Database, Layout, Code2, Server, Layers, Info, X } from 'lucide-react';
import HeaderSection from '../components/HeaderSection';
import PageTransition from '../components/PageTransition';

const subjects = [
    {
        id: 1,
        title: '1과목: 소프트웨어 설계',
        icon: <Layout size={24} />,
        description: '요구사항 확인, 화면 설계, 애플리케이션 설계',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/50',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 2,
        title: '2과목: 소프트웨어 개발',
        icon: <Code2 size={24} />,
        description: '데이터 입출력, 인터페이스, 테스트 관리',
        color: 'text-green-400',
        borderColor: 'border-green-500/50',
        bgColor: 'bg-green-500/10'
    },
    {
        id: 3,
        title: '3과목: 데이터베이스 구축',
        icon: <Database size={24} />,
        description: 'SQL 응용, 설계, 데이터 전환',
        color: 'text-yellow-400',
        borderColor: 'border-yellow-500/50',
        bgColor: 'bg-yellow-500/10'
    },
    {
        id: 4,
        title: '4과목: 프로그래밍 언어 활용',
        icon: <Server size={24} />,
        description: '서버 프로그램, 언어 특성, 운영체제',
        color: 'text-red-400',
        borderColor: 'border-red-500/50',
        bgColor: 'bg-red-500/10'
    },
    {
        id: 5,
        title: '5과목: 정보시스템 구축 관리',
        icon: <Layers size={24} />,
        description: '프로젝트 관리, 보안, 시스템 인프라',
        color: 'text-purple-400',
        borderColor: 'border-purple-500/50',
        bgColor: 'bg-purple-500/10'
    }
];

const CertificateSelectionScreen = ({ user, onSignUp, onLogin, onLogout }) => {
    const navigate = useNavigate();
    const [showGuide, setShowGuide] = React.useState(false);

    const handleSubjectSelect = (subjectId) => {
        navigate('/certificate/quiz', { state: { subjectId } });
    };

    const handleFullExam = () => {
        navigate('/certificate/quiz', { state: { subjectId: 'all' } });
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
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setShowGuide(true)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium border border-white/10"
                        >
                            <Info size={16} />
                            시험 안내
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">정보처리기사 필기</h1>
                    <p className="text-gray-300">과목별 학습 또는 모의고사를 선택하세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {subjects.map((subject) => (
                        <button
                            key={subject.id}
                            onClick={() => handleSubjectSelect(subject.id)}
                            className={`group relative overflow-hidden rounded-xl p-6 text-left transition-all hover:scale-[1.02] border border-white/10 hover:border-white/30 bg-black/20 hover:bg-white/5`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${subject.bgColor} ${subject.color}`}>
                                    {subject.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary-light transition-colors">
                                        {subject.title}
                                    </h3>
                                    <p className="text-sm text-gray-400">{subject.description}</p>
                                    <div className="mt-3 flex items-center text-xs text-gray-500">
                                        <span>20문제</span>
                                        <span className="mx-2">•</span>
                                        <span>30분</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}

                    {/* 전체 모의고사 버튼 (마지막에 추가) */}
                    <button
                        onClick={handleFullExam}
                        className="md:col-span-1 group relative overflow-hidden rounded-xl p-6 text-left transition-all hover:scale-[1.02] border-2 border-primary/50 hover:border-primary bg-primary/10 hover:bg-primary/20"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/20 text-primary-light">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">
                                    전체 모의고사
                                </h3>
                                <p className="text-sm text-gray-300">실전처럼 5과목 전체 응시</p>
                                <div className="mt-3 flex items-center text-xs text-gray-300">
                                    <span>100문제</span>
                                    <span className="mx-2">•</span>
                                    <span>2시간 30분</span>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Exam Guide Modal */}
            {
                showGuide && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowGuide(false)}>
                        <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Info size={20} className="text-primary" />
                                    시험 안내
                                </h2>
                                <button onClick={() => setShowGuide(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 text-gray-300 space-y-6">
                                <section>
                                    <h3 className="text-lg font-bold text-white mb-3 border-l-4 border-primary pl-3">1. 시험 과목 및 구성</h3>
                                    <p className="mb-4 text-sm leading-relaxed">
                                        2020년 개편 이후 NCS(국가직무능력표준) 기반으로 실무 중심의 문제가 출제되고 있습니다.
                                    </p>
                                    <div className="overflow-hidden rounded-lg border border-white/10 mb-4 text-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-white/5 text-white">
                                                <tr>
                                                    <th className="p-3">과목</th>
                                                    <th className="p-3">과목명</th>
                                                    <th className="p-3">주요 내용</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10">
                                                <tr>
                                                    <td className="p-3">1과목</td>
                                                    <td className="p-3 font-medium text-white">소프트웨어 설계</td>
                                                    <td className="p-3 text-gray-400">요구사항 확인, 인터페이스 설계, 화면 설계</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3">2과목</td>
                                                    <td className="p-3 font-medium text-white">소프트웨어 개발</td>
                                                    <td className="p-3 text-gray-400">데이터 입출력 구현, 인터페이스 구현, 패키징</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3">3과목</td>
                                                    <td className="p-3 font-medium text-white">데이터베이스 구축</td>
                                                    <td className="p-3 text-gray-400">SQL, 논리/물리 데이터베이스 설계, 데이터 전환</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3">4과목</td>
                                                    <td className="p-3 font-medium text-white">프로그래밍 언어 활용</td>
                                                    <td className="p-3 text-gray-400">C, Java, Python 기초 및 활용, 운영체제 기초</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3">5과목</td>
                                                    <td className="p-3 font-medium text-white">정보시스템 구축 관리</td>
                                                    <td className="p-3 text-gray-400">소프트웨어 개발 방법론, IT 프로젝트 관리, 보안</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-400 bg-white/5 p-4 rounded-lg">
                                        <li><strong className="text-white">검정 방법:</strong> 객관식 4지 택일형</li>
                                        <li><strong className="text-white">문항 수:</strong> 과목당 20문항 (총 100문항)</li>
                                        <li><strong className="text-white">시험 시간:</strong> 과목당 30분 (총 2시간 30분)</li>
                                        <li><strong className="text-white">시행 방식:</strong> CBT (Computer Based Test) <br /><span className="pl-5 text-xs">컴퓨터로 시험을 보며, 제출 즉시 점수와 합격 여부를 확인할 수 있습니다.</span></li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-white mb-3 border-l-4 border-green-500 pl-3">2. 합격 기준</h3>
                                    <p className="mb-4 text-sm">필기시험에 합격하기 위해서는 다음 두 가지 조건을 <strong className="text-green-400">모두 만족</strong>해야 합니다.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-white/5 p-4 rounded-lg text-center border border-white/10">
                                            <div className="text-gray-400 text-sm mb-1">조건 1</div>
                                            <div className="text-white font-bold text-lg">평균 60점 이상</div>
                                            <div className="text-xs text-gray-500 mt-1">전 과목 평균</div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-lg text-center border border-white/10">
                                            <div className="text-gray-400 text-sm mb-1">조건 2</div>
                                            <div className="text-white font-bold text-lg">과목당 40점 이상</div>
                                            <div className="text-xs text-gray-500 mt-1">과락(40점 미만) 없을 것</div>
                                        </div>
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex gap-3 text-sm text-red-200">
                                        <Info className="shrink-0 text-red-400" size={18} />
                                        <p>
                                            <strong>주의:</strong> 평균이 90점이라도, 한 과목이라도 40점 미만(35점 이하)을 받으면 <span className="underline decoration-red-400 underline-offset-2 font-bold">불합격 처리됩니다.</span>
                                        </p>
                                    </div>
                                </section>
                            </div>
                            <div className="p-4 border-t border-white/10 bg-gray-900 sticky bottom-0 text-right">
                                <button
                                    onClick={() => setShowGuide(false)}
                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </PageTransition >
    );
};

export default CertificateSelectionScreen;

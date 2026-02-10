import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cloud, Shield, Server, Codepen, Info, X } from 'lucide-react';
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
    const [showGuide, setShowGuide] = React.useState(false);

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
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setShowGuide(true)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors text-sm font-medium border border-white/10"
                        >
                            <Info size={16} />
                            시험 안내
                        </button>
                    </div>
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

            {/* Exam Guide Modal */}
            {
                showGuide && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowGuide(false)}>
                        <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Info size={20} className="text-primary" />
                                    AWS 자격증 요약 가이드
                                </h2>
                                <button onClick={() => setShowGuide(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 text-gray-300 space-y-8">
                                {/* Section 1 */}
                                <section>
                                    <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-primary pl-3">1. 자격증 단계별 종류</h3>
                                    <div className="space-y-4">
                                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-green-400 font-bold">🌱 기초 (Foundational)</span>
                                                <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded">클라우드 입문자 / 비전공자 추천</span>
                                            </div>
                                            <ul className="list-disc list-inside text-sm text-gray-300 ml-1">
                                                <li><strong>Cloud Practitioner (CLF):</strong> 클라우드 기본 개념 및 용어</li>
                                            </ul>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-blue-400 font-bold">🛠️ 어소시에이트 (Associate)</span>
                                                <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">🔥 인기</span>
                                                <span className="text-xs text-gray-400">실무 1년차 수준</span>
                                            </div>
                                            <ul className="list-disc list-inside text-sm text-gray-300 ml-1 space-y-1">
                                                <li><strong>Solutions Architect (SAA):</strong> 아키텍처 설계 (가장 범용적)</li>
                                                <li><strong>Developer (DVA):</strong> 앱 개발 및 배포</li>
                                                <li><strong>SysOps (SOA):</strong> 시스템 운영 및 모니터링</li>
                                            </ul>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                                <div className="text-purple-400 font-bold mb-2">🏆 프로페셔널 (Professional)</div>
                                                <div className="text-xs text-gray-400 mb-2">전문가 수준 / 설계 및 운영 심화</div>
                                                <ul className="text-sm text-gray-300 space-y-1">
                                                    <li>• Solutions Architect (SAP)</li>
                                                    <li>• DevOps Engineer (DOP)</li>
                                                </ul>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                                <div className="text-pink-400 font-bold mb-2">🔬 전문 분야 (Specialty)</div>
                                                <div className="text-xs text-gray-400 mb-2">Security, Machine Learning 등</div>
                                                <ul className="text-sm text-gray-300 space-y-1">
                                                    <li>• Security, Data Analytics</li>
                                                    <li>• Machine Learning</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2 */}
                                <section>
                                    <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">2. 시험 정보 한눈에 보기</h3>
                                    <div className="overflow-hidden rounded-lg border border-white/10 mb-4 text-sm">
                                        <table className="w-full text-center">
                                            <thead className="bg-white/10 text-white">
                                                <tr>
                                                    <th className="p-3 font-medium">등급</th>
                                                    <th className="p-3 font-medium">비용</th>
                                                    <th className="p-3 font-medium">시간</th>
                                                    <th className="p-3 font-medium">문항</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/10 bg-white/5">
                                                <tr>
                                                    <td className="p-3 text-green-400">기초</td>
                                                    <td className="p-3 text-gray-300">$100</td>
                                                    <td className="p-3 text-gray-300">90분</td>
                                                    <td className="p-3 text-gray-300">65</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 text-blue-400">어소시에이트</td>
                                                    <td className="p-3 text-gray-300">$150</td>
                                                    <td className="p-3 text-gray-300">130분</td>
                                                    <td className="p-3 text-gray-300">65</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 text-purple-400">프로/전문</td>
                                                    <td className="p-3 text-gray-300">$300</td>
                                                    <td className="p-3 text-gray-300">180분</td>
                                                    <td className="p-3 text-gray-300">75</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400 bg-white/5 p-4 rounded-lg">
                                        <li className="flex items-center gap-2"><span className="text-white">🇰🇷 언어:</span> 한국어 지원</li>
                                        <li className="flex items-center gap-2"><span className="text-white">📅 유효기간:</span> 3년 (상위 자격증 취득 시 갱신)</li>
                                        <li className="flex items-center gap-2"><span className="text-white">📍 장소:</span> 온라인(자택) 또는 오프라인 센터</li>
                                        <li className="flex items-center gap-2"><span className="text-white">✅ 합격선:</span> 1000점 만점에 700~750점 이상</li>
                                    </ul>
                                </section>

                                {/* Section 3 */}
                                <section>
                                    <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-red-500 pl-3">3. 추천 로드맵 🚀</h3>
                                    <div className="space-y-3">
                                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center bg-white/5 p-3 rounded-lg border border-white/10">
                                            <span className="text-white font-bold w-20 shrink-0">비전공자</span>
                                            <div className="flex items-center gap-2 text-sm text-gray-300 flex-wrap">
                                                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">CLF (기초)</span>
                                                <span className="text-gray-500">👉</span>
                                                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">SAA (설계)</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center bg-white/5 p-3 rounded-lg border border-white/10">
                                            <span className="text-white font-bold w-20 shrink-0">개발자</span>
                                            <div className="flex items-center gap-2 text-sm text-gray-300 flex-wrap">
                                                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">SAA (설계)</span>
                                                <span className="text-gray-500">👉</span>
                                                <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">DVA (개발)</span>
                                                <span className="text-gray-500">👉</span>
                                                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">DOP (DevOps)</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center bg-white/5 p-3 rounded-lg border border-white/10">
                                            <span className="text-white font-bold w-20 shrink-0">엔지니어</span>
                                            <div className="flex items-center gap-2 text-sm text-gray-300 flex-wrap">
                                                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">SAA (설계)</span>
                                                <span className="text-gray-500">👉</span>
                                                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">SOA (운영)</span>
                                                <span className="text-gray-500">👉</span>
                                                <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">SAP (아키텍처)</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Tips */}
                                <section>
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        💡 꿀팁
                                    </h3>
                                    <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg space-y-2 text-sm text-primary-light">
                                        <p>• <strong>재응시:</strong> 불합격 시 14일 후 재응시 가능</p>
                                        <p>• <strong>혜택:</strong> 합격 시 다음 시험 50% 할인 쿠폰 제공</p>
                                        <p>• <strong>준비물:</strong> 신분증(여권/영문운전면허증), 본인 명의 신용카드</p>
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

export default AwsSelectionScreen;

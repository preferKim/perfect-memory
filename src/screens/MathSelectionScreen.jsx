import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Sigma, TrendingUp, Triangle, BarChart3, BookOpen, X as XIcon } from 'lucide-react';
import HeaderSection from '../components/HeaderSection';
import MathRenderer from '../components/MathRenderer';


const mathTopics = [
    { 
        id: 'number', 
        level: 1,
        title: '1. 수와 연산', 
        icon: <Calculator size={20} />,
        elementary: '자연수, 분수, 소수, 사칙연산', 
        middle: '정수, 유리수, 실수, 제곱근, 비례식', 
        high: '복소수, 지수와 로그' 
    },
    { 
        id: 'algebra', 
        level: 2,
        title: '2. 문자와 식 (대수)', 
        icon: <Sigma size={20} />,
        elementary: '수의 규칙, 미지의 수, 식의 표현', 
        middle: '일차방정식, 부등식, 다항식 연산(인수분해 개념 포함)', 
        high: '다항식의 연산, 방정식과 부등식, 행렬, 명제' 
    },
    { 
        id: 'function', 
        level: 3,
        title: '3. 함수 (변화와 관계)', 
        icon: <TrendingUp size={20} />,
        elementary: '규칙과 대응, 비와 비율', 
        middle: '일차함수, 이차함수', 
        high: '지수·로그·삼각함수, 수열, 극한' 
    },
    { 
        id: 'geometry', 
        level: 4,
        title: '4. 기하 (도형)', 
        icon: <Triangle size={20} />,
        elementary: '평면/입체도형의 성질, 합동', 
        middle: '피타고라스, 삼각비, 원의 성질, 공간좌표', 
        high: '도형의 방정식, 벡터' 
    },
    { 
        id: 'stats', 
        level: 5,
        title: '5. 확률과 통계', 
        icon: <BarChart3 size={20} />,
        elementary: '표와 그래프, 평균, 가능성', 
        middle: '경우의 수, 확률, 대푯값', 
        high: '순열과 조합, 확률분포, 통계적 추정' 
    },
];

const seungjeCurriculum = [
    { id: 'seungje_01', title: '01강 분모가 같은 분수의 덧셈과 뺄셈, 약수의 뜻' },
    { id: 'seungje_02', title: '02강 약수의 개수와 약수의 총합, 배수의 뜻' },
    { id: 'seungje_03', title: '03강 최대공약수와 최소공배수' },
    { id: 'seungje_04', title: '04강 통분과 약분, 역수의 뜻' },
    { id: 'seungje_05', title: '05강 소수의 덧셈, 뺄셈, 곱셈, 나눗셈(1)' },
    { id: 'seungje_06', title: '06강 소수의 덧셈, 뺄셈, 곱셈, 나눗셈(2)' },
    { id: 'seungje_07', title: '07강 최대공약수와 최소공배수' },
    { id: 'seungje_08', title: '08강 양수와 음수' },
    { id: 'seungje_09', title: '09강 정수와 유리수의 덧셈' },
    { id: 'seungje_10', title: '10강 정수와 유리수의 곱셈' },
    { id: 'seungje_11', title: '11강 유한소수, 무한소수, 순환소수' },
    { id: 'seungje_12', title: '12강 제곱근의 뜻(1)' },
    { id: 'seungje_13', title: '13강 제곱근의 뜻(2)' },
    { id: 'seungje_14', title: '14강 실수의 대소관계, 제곱근의 곱셈과 나눗셈' },
    { id: 'seungje_15', title: '15강 분모의 유리화, 제곱근의 덧셈과 뺄셈' },
    { id: 'seungje_16', title: '16강 복소수의 뜻, 복소수의 사칙연산' },
    { id: 'seungje_17', title: '17강 켤레복소수' },
    { id: 'seungje_18', title: '18강 다항식의 뜻, 분배법칙' },
    { id: 'seungje_19', title: '19강 동류항, 지수법칙' },
    { id: 'seungje_20', title: '20강 단항식의 곱셈과 나눗셈' },
    { id: 'seungje_21', title: '21강 일차식의 곱셈과 나눗셈' },
    { id: 'seungje_22', title: '22강 곱셈공식(1) - 중학과정' },
    { id: 'seungje_23', title: '23강 곱셈공식(2) - 고등과정' },
    { id: 'seungje_24', title: '24강 식 변형 공식 4가지' },
    { id: 'seungje_25', title: '25강 인수분해(1) - 완전제곱식' },
    { id: 'seungje_26', title: '26강 인수분해(2) - 합과 차, 합과 곱' },
    { id: 'seungje_27', title: '27강 인수분해(3) - 공식으로 인수분해' },
    { id: 'seungje_28', title: '28강 인수분해(4) - 복이차식의 인수분해' },
    { id: 'seungje_29', title: '29강 인수분해(5) - 여러 문자로 이루어진 식의 인수분해' },
    { id: 'seungje_30', title: '30강 인수분해(6) - 항등식과 미정계수법' },
    { id: 'seungje_31', title: '31강 인수분해(7) - 나머지 정리, 조립제법' },
    { id: 'seungje_32', title: '32강 인수분해(8) - 인수정리, 초가식의 인수분해(1)' },
    { id: 'seungje_33_1', title: '33강 인수분해(8) - 인수정리, 초가식의 인수분해(2)' },
    { id: 'seungje_33_2', title: '33강 등식의 성질' },
    { id: 'seungje_34', title: '34강 일차방정식의 풀이' },
    { id: 'seungje_35', title: '35강 연립방정식의 풀이' },
    { id: 'seungje_36', title: '36강 연립방정식의 활용' },
    { id: 'seungje_37', title: '37강 이차방정식의 풀이' },
    { id: 'seungje_38', title: '38강 이차방정식의 근의 공식, 판별식' },
    { id: 'seungje_39', title: '39강 근과 계수와의 관계' },
    { id: 'seungje_40', title: '40강 실근의 부호, 고차방정식, 연립방정식' },
    { id: 'seungje_41', title: '41강 일차부등식의 풀이' },
    { id: 'seungje_42', title: '42강 연립부등식, 절댓값 부등식' },
    { id: 'seungje_43', title: '43강 연립부등식의 활용' },
    { id: 'seungje_44', title: '44강 이차부등식의 풀이' },
    { id: 'seungje_45', title: '45강 절대 부등식' },
];


const MathSelectionScreen = ({ user, onSignUp, onLogin, onLogout }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('level');
    const [availableStages, setAvailableStages] = useState(null);
    const [objectives, setObjectives] = useState({});

    useEffect(() => {
        if (activeTab === 'seungje') {
            // Fetch objectives and available stages when the seungje tab is active
            const fetchSeungjeData = async () => {
                try {
                    const [objectivesRes, stagesRes] = await Promise.all([
                        fetch('/words/math_jsj50day_objectives.json'),
                        fetch('/words/math_jsj50day.json')
                    ]);
                    
                    if (!objectivesRes.ok || !stagesRes.ok) {
                        throw new Error('Failed to load Seungje math data');
                    }
                    
                    const objectivesData = await objectivesRes.json();
                    const stagesData = await stagesRes.json();
                    
                    setObjectives(objectivesData);
                    
                    if (Array.isArray(stagesData)) {
                        const stageSet = new Set(stagesData.map(q => q.stage));
                        setAvailableStages(stageSet);
                    }
                } catch (error) {
                    console.error("Error fetching Seungje math data:", error);
                    setAvailableStages(new Set()); // Set to empty set on error
                }
            };
            
            fetchSeungjeData();
        }
    }, [activeTab]);

    const handleTopicSelect = (topicId, difficulty) => {
        if (activeTab === 'level') {
            navigate('/math/game', { state: { topicLevel: topicId, difficulty } });
        } else {
            // topicId is now the lecture id, e.g., 'seungje_01'
            navigate(`/math/jsj50day/${topicId}`);
        }
    };

    return (
        <div className="glass-card p-6 sm:p-8 text-center relative max-w-4xl w-full mx-auto">
             <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all flex items-center"
                >
                    <ArrowLeft size={16} className="mr-1" /> 과목선택
                </button>
            </div>
            <HeaderSection
                onSignUp={onSignUp}
                onLogin={onLogin}
                onLogout={onLogout}
                user={user}
            />

            <h2 className="text-3xl font-bold text-white mb-2 mt-8">수학 학습 영역 선택</h2>
            <p className="text-gray-300 mb-6">학습할 영역과 난이도를 선택하세요.</p>

            <div className="mb-6 flex justify-center border-b border-white/10">
                <button
                    onClick={() => setActiveTab('level')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors ${
                        activeTab === 'level' ? 'text-primary-light border-b-2 border-primary-light' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    단계별 학습
                </button>
                <button
                    onClick={() => setActiveTab('seungje')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors ${
                        activeTab === 'seungje' ? 'text-primary-light border-b-2 border-primary-light' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    정승제 50일수학
                </button>
            </div>
            
            {activeTab === 'level' && (
                <div className="grid gap-6 text-left">
                    {mathTopics.map((topic) => (
                        <div key={topic.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/10 rounded-lg text-primary-light">
                                    {topic.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white">{topic.title}</h3>
                            </div>
                            
                            <div className="space-y-3">
                                <button 
                                    onClick={() => handleTopicSelect(topic.level, 'elementary')}
                                    className="w-full text-left p-4 rounded-lg bg-black/20 hover:bg-primary/20 border border-white/5 hover:border-primary/50 transition-all group flex items-start"
                                >
                                    <span className="text-primary-light font-bold min-w-[60px] shrink-0">[초등]</span>
                                    <span className="text-gray-300 group-hover:text-white">{topic.elementary}</span>
                                </button>

                                <button 
                                    onClick={() => handleTopicSelect(topic.level, 'middle')}
                                    className="w-full text-left p-4 rounded-lg bg-black/20 hover:bg-secondary/20 border border-white/5 hover:border-secondary/50 transition-all group flex items-start"
                                >
                                    <span className="text-secondary-light font-bold min-w-[60px] shrink-0">[중등]</span>
                                    <span className="text-gray-300 group-hover:text-white">{topic.middle}</span>
                                </button>

                                <button 
                                    onClick={() => handleTopicSelect(topic.level, 'high')}
                                    className="w-full text-left p-4 rounded-lg bg-black/20 hover:bg-danger/20 border border-white/5 hover:border-danger/50 transition-all group flex items-start"
                                >
                                    <span className="text-danger-light font-bold min-w-[60px] shrink-0">[고등]</span>
                                    <span className="text-gray-300 group-hover:text-white">{topic.high}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'seungje' && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                    {seungjeCurriculum.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => handleTopicSelect(item.id)}
                            className="w-full text-left p-4 rounded-lg bg-black/20 hover:bg-white/20 border border-white/10 hover:border-white/30 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen size={20} className="text-primary-light shrink-0" />
                                <span className="text-gray-300 group-hover:text-white font-medium">{item.title}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MathSelectionScreen;
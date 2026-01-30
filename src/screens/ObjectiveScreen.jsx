import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X as XIcon } from 'lucide-react';
import MathRenderer from '../components/MathRenderer';

// Data moved here to make component self-sufficient
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

const ObjectiveScreen = () => {
    const navigate = useNavigate();
    const { lectureId } = useParams();

    const [lecture, setLecture] = useState(null);
    const [objective, setObjective] = useState('');
    const [isStageAvailable, setIsStageAvailable] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const foundLecture = seungjeCurriculum.find(item => item.id === lectureId);
        if (!foundLecture) {
            setLoading(false);
            return;
        }

        const stage = parseInt(foundLecture.id.split('_')[1]);
        setLecture({ ...foundLecture, stage });

        const fetchObjectiveData = async () => {
            try {
                const [objectivesRes, stagesRes] = await Promise.all([
                    fetch('/words/math_jsj50day_objectives.json'),
                    fetch('/words/math_jsj50day.json')
                ]);

                if (!objectivesRes.ok || !stagesRes.ok) {
                    throw new Error('Failed to load objective data');
                }

                const objectivesData = await objectivesRes.json();
                const stagesData = await stagesRes.json();

                setObjective(objectivesData[stage] || '학습 목표를 찾을 수 없습니다.');
                
                if (Array.isArray(stagesData)) {
                    const availableStages = new Set(stagesData.map(q => q.stage));
                    setIsStageAvailable(availableStages.has(stage));
                }
            } catch (error) {
                console.error("Error fetching objective data:", error);
                setObjective('오류가 발생했습니다.');
                setIsStageAvailable(false);
            } finally {
                setLoading(false);
            }
        };

        fetchObjectiveData();

    }, [lectureId]);

    const handleStart = () => {
        if (lecture) {
            navigate('/math/game', { state: { topicLevel: lecture.stage, difficulty: 'jsj50day' } });
        }
    };

    const handleBack = () => {
        navigate(-1);
    };
    
    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-white">로딩 중...</div>;
    }

    if (!lecture) {
        return <div className="flex justify-center items-center min-h-screen text-white">강의 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-screen">
            <div className="glass-card max-w-lg w-full rounded-2xl p-6 sm:p-8 border border-white/20 relative">
                <button 
                    onClick={handleBack} 
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
                                <MathRenderer text={objective} />
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
                            onClick={handleStart} 
                            className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                            학습 시작
                        </button>
                     )}
                    <button 
                        onClick={handleBack} 
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

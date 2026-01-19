import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, Sigma, TrendingUp, Triangle, BarChart3 } from 'lucide-react';
import PlayerStats from '../components/PlayerStats';

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

const MathSelectionScreen = ({ onBack, onLevelSelect, user }) => {

    const handleSelect = (topicLevel, difficulty) => {
        onLevelSelect(topicLevel, difficulty);
    };

    return (
        <div className="glass-card p-6 sm:p-8 text-center relative max-w-4xl w-full mx-auto">
             <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={onBack}
                    className="text-sm font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-full border border-white/40 hover:border-white/80 bg-black/20 hover:bg-black/40 transition-all flex items-center"
                >
                    <ArrowLeft size={16} className="mr-1" /> 과목선택
                </button>
            </div>
            
            {user && (
                <div className="absolute top-4 right-4">
                     <PlayerStats />
                </div>
            )}

            <h2 className="text-3xl font-bold text-white mb-2 mt-8">수학 학습 영역 선택</h2>
            <p className="text-gray-300 mb-6">학습할 영역과 난이도를 선택하세요.</p>
            
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
                                onClick={() => handleSelect(topic.level, 'elementary')}
                                className="w-full text-left p-4 rounded-lg bg-black/20 hover:bg-primary/20 border border-white/5 hover:border-primary/50 transition-all group flex items-start"
                            >
                                <span className="text-primary-light font-bold min-w-[60px] shrink-0">[초등]</span>
                                <span className="text-gray-300 group-hover:text-white">{topic.elementary}</span>
                            </button>

                            <button 
                                onClick={() => handleSelect(topic.level, 'middle')}
                                className="w-full text-left p-4 rounded-lg bg-black/20 hover:bg-secondary/20 border border-white/5 hover:border-secondary/50 transition-all group flex items-start"
                            >
                                <span className="text-secondary-light font-bold min-w-[60px] shrink-0">[중등]</span>
                                <span className="text-gray-300 group-hover:text-white">{topic.middle}</span>
                            </button>

                            <button 
                                onClick={() => handleSelect(topic.level, 'high')}
                                className="w-full text-left p-4 rounded-lg bg-black/20 hover:bg-danger/20 border border-white/5 hover:border-danger/50 transition-all group flex items-start"
                            >
                                <span className="text-danger-light font-bold min-w-[60px] shrink-0">[고등]</span>
                                <span className="text-gray-300 group-hover:text-white">{topic.high}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MathSelectionScreen;
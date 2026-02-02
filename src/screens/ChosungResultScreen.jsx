import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const ChosungResultScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const score = location.state?.score || 0;

    const handleRestart = () => {
        navigate('/korean/chosung');
    };

    const handleBack = () => {
        navigate('/korean');
    };

    return (
        <div className="glass-card p-6 sm:p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4 text-primary-light">게임 종료!</h2>
            <p className="text-xl mb-6">
                최종 점수: <span className="text-yellow-300 font-bold">{score}</span>점
            </p>
            <div className="flex justify-center gap-4">
                <Button onClick={handleRestart} variant="threedee" color="primary">다시 풀기</Button>
                <Button onClick={handleBack} variant="threedee" color="normal">돌아가기</Button>
            </div>
        </div>
    );
};

export default ChosungResultScreen;

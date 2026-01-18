import React, { useState, useEffect } from 'react';
import Button from '../components/Button';

const TamagotchiScreen = ({ onBack, points, user, updatePoints }) => {
    const [name, setName] = useState('알');
    const [age, setAge] = useState(0);
    const [hunger, setHunger] = useState(50);
    const [happiness, setHappiness] = useState(50);

    const handleFeed = () => {
        if (points >= 10) {
            setHunger(h => Math.min(100, h + 10));
            updatePoints(user.id, points - 10);
        } else {
            alert('포인트가 부족합니다!');
        }
    };

    const handlePlay = () => {
        if (points >= 5) {
            setHappiness(h => Math.min(100, h + 5));
            updatePoints(user.id, points - 5);
        } else {
            alert('포인트가 부족합니다!');
        }
    };

    const getCharacter = () => {
        if (age < 1) return '🥚';
        if (hunger < 20 || happiness < 20) return '😢';
        if (hunger > 80 && happiness > 80) return '😍';
        return '😊';
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setAge(a => a + 1);
            setHunger(h => Math.max(0, h - 1));
            setHappiness(h => Math.max(0, h - 1));
        }, 1000 * 60 * 60); // Update every hour
        return () => clearInterval(timer);
    }, []);


    return (
        <div className="glass-card p-6 sm:p-12 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">{name}</h1>
            <div className="mb-8">
                <p className="text-2xl font-bold text-primary-light">
                    포인트: {points}
                </p>
            </div>
            <div className="mb-8">
                <div className="w-48 h-48 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-5xl">{getCharacter()}</span>
                </div>
                <div className="text-white text-lg">
                    <p>나이: {age}살</p>
                    <p>배고픔: {hunger}%</p>
                    <p>행복: {happiness}%</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleFeed} variant="threedee" color="primary">밥주기 (10포인트)</Button>
                <Button onClick={handlePlay} variant="threedee" color="secondary">놀아주기 (5포인트)</Button>
            </div>
            <div className="mt-8">
                <Button onClick={onBack} variant="threedee" color="danger">돌아가기</Button>
            </div>
        </div>
    );
};

export default TamagotchiScreen;

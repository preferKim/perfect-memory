import React, { useState } from 'react';
import Button from '../Button';

const ClickerGame = ({ onBack }) => {
    const [clicks, setClicks] = useState(0);

    return (
        <div className="glass-card p-6 sm:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">클리커 게임</h2>
            <p className="text-xl text-white mb-6">Clicks: {clicks}</p>
            <div className="flex flex-col items-center gap-4">
                <Button 
                    onClick={() => setClicks(c => c + 1)} 
                    variant="threedee" 
                    color="primary"
                    className="w-48 h-48 rounded-full flex items-center justify-center text-5xl"
                >
                    +
                </Button>
                <Button onClick={onBack} variant="secondary" className="w-48">
                    뒤로가기
                </Button>
            </div>
        </div>
    );
};

export default ClickerGame;

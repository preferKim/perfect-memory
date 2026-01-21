import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';

const ClickerGame = ({ onBack }) => {
    const [count, setCount] = useState(0);

    return (
        <div className="glass-card p-6 sm:p-12 text-center relative flex flex-col items-center">
            <button
                onClick={onBack}
                className="absolute top-4 left-4 text-gray-200 hover:text-white transition p-2"
                title="Back"
                aria-label="Back"
            >
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-4xl font-bold text-white mb-8">클릭 게임</h1>
            <p className="text-6xl font-bold text-white mb-8">{count}</p>
            <Button onClick={() => setCount(count + 1)} variant="threedee" color="primary">
                클릭!
            </Button>
        </div>
    );
};

export default ClickerGame;

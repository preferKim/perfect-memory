import React from 'react';
import { Play, Repeat, X } from 'lucide-react';

const PauseMenu = ({ onResume, onRestart, onExit }) => {
    return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
            <div className="glass-card flex flex-col gap-4 p-8 rounded-2xl items-center">
                <h2 className="text-4xl font-bold text-white mb-4">일시정지</h2>
                <button
                    onClick={onResume}
                    className="flex items-center justify-center gap-3 w-64 p-4 bg-success/80 hover:bg-success transition-transform text-white text-xl font-bold rounded-lg"
                >
                    <Play />
                    계속하기
                </button>
                <button
                    onClick={onRestart}
                    className="flex items-center justify-center gap-3 w-64 p-4 bg-primary/80 hover:bg-primary transition-transform text-white text-xl font-bold rounded-lg"
                >
                    <Repeat />
                    다시 시작
                </button>
                <button
                    onClick={onExit}
                    className="flex items-center justify-center gap-3 w-64 p-4 bg-danger/80 hover:bg-danger transition-transform text-white text-xl font-bold rounded-lg"
                >
                    <X />
                    나가기
                </button>
            </div>
        </div>
    );
};

export default PauseMenu;

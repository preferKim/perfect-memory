import React, { useEffect, useState } from 'react';

const LevelUpNotification = ({ levelUpInfo }) => {
    const { message, description } = levelUpInfo;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 3500); // fade out after 3.5s
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!message) return null;

    return (
        <div className={`fixed top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-4 z-50 transition-all duration-700 ease-out ${visible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-12'}`}>
            <div className="glass-card bg-gradient-to-br from-primary/95 to-indigo-600/90 border-4 border-yellow-300 p-6 rounded-3xl shadow-[0_0_30px_rgba(253,224,71,0.6)] text-center">
                <div className="text-6xl mb-3 animate-bounce drop-shadow-lg">🎉</div>
                <h2 className="text-3xl font-black text-white mb-2 drop-shadow-md tracking-wide">{message}</h2>
                <p className="text-white font-bold text-lg drop-shadow-sm">{description}</p>
            </div>
        </div>
    );
};

export default LevelUpNotification;

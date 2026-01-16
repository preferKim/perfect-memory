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
        <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4 z-50 transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <div className="glass-card bg-primary/80 border-2 border-primary-light p-6 rounded-2xl shadow-2xl text-center">
                <div className="text-5xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-4xl font-bold text-white mb-2">{message}</h2>
                <p className="text-white/90 text-lg">{description}</p>
            </div>
        </div>
    );
};

export default LevelUpNotification;

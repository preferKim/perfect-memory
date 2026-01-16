import React, { useState, useRef, useEffect } from 'react';
import { Heart, ArrowLeft, Clock } from 'lucide-react';

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const ConnectingGameScreen = ({ words, lives, matchedPairs, onCheckAnswer, resetGame, time }) => {
    const [leftColumn, setLeftColumn] = useState([]);
    const [rightColumn, setRightColumn] = useState([]);

    const [selectedItem, setSelectedItem] = useState(null);
    const [incorrectPair, setIncorrectPair] = useState([]);

    const svgRef = useRef(null);
    const itemRefs = useRef({});

    useEffect(() => {
        const shuffledWords = shuffleArray(words);
        setLeftColumn(shuffledWords.map(word => ({ type: 'korean', word })));
        setRightColumn(shuffleArray(words).map(word => ({ type: 'english', word })));
        itemRefs.current = {};
        setSelectedItem(null);
        setIncorrectPair([]);
    }, [words]);

    const getNodePosition = (id) => {
        const node = itemRefs.current[id];
        if (!node || !svgRef.current) return null;
        const svgRect = svgRef.current.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();
        
        const isLeft = id.startsWith('korean');
        const x = isLeft ? nodeRect.right - svgRect.left : nodeRect.left - svgRect.left;
        const y = nodeRect.top - svgRect.top + nodeRect.height / 2;

        return { x, y };
    };

    const handleWordClick = (node) => {
        if (matchedPairs.includes(node.word.english)) {
            return;
        }

        if (!selectedItem) {
            setSelectedItem(node);
            return;
        }

        if (selectedItem.id === node.id) {
            setSelectedItem(null);
            return;
        }

        if (selectedItem.type === node.type) {
            setSelectedItem(node);
            return;
        }

        // Now we have a pair from different columns
        const word1 = selectedItem.type === 'korean' ? selectedItem.word : node.word;
        const word2 = selectedItem.type === 'english' ? selectedItem.word : node.word;

        onCheckAnswer(word1, word2);

        if (word1.english !== word2.english) {
            setIncorrectPair([selectedItem.id, node.id]);
            setTimeout(() => setIncorrectPair([]), 500);
        }
        setSelectedItem(null);
    };

    const WordItem = ({ node }) => {
        const id = `${node.type}-${node.word.english}`;
        const text = node.type === 'korean' ? node.word.korean : node.word.english;
        const isMatched = matchedPairs.includes(node.word.english);
        const isSelected = selectedItem && selectedItem.id === id;
        const isIncorrect = incorrectPair.includes(id);

        return (
            <div
                ref={el => itemRefs.current[id] = el}
                id={id}
                className={`p-2 rounded-lg border-2 transition-all duration-300 ${
                    isMatched 
                        ? 'bg-success-dark/30 border-success-dark/0 opacity-60' 
                        : isSelected
                        ? 'bg-primary-dark/50 border-primary-light ring-2 ring-primary-light'
                        : isIncorrect
                        ? 'bg-danger-dark/50 border-danger-light ring-2 ring-danger-light'
                        : 'bg-white/10 border-white/10 cursor-pointer hover:bg-white/20 hover:border-white/30'
                }`}
                onClick={() => handleWordClick({ id, ...node })}
            >
                <p className={`text-base font-semibold text-center ${isMatched ? 'text-gray-400' : 'text-white'}`}>{text}</p>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-2">
             <div className="glass-card flex justify-between items-center p-4">
                <button onClick={resetGame} className="text-gray-300 hover:text-white p-2 rounded-full transition">
                    <ArrowLeft size={28} />
                </button>
                <div className="flex items-center gap-2 text-2xl font-bold text-white">
                    <Clock size={28} />
                    <span>{formatTime(time)}</span>
                </div>
                <div className="flex items-center gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Heart key={i} size={32} className={i < lives ? 'text-danger-light fill-current animate-pulse' : 'text-gray-600'} />
                    ))}
                </div>
            </div>

            <div className="relative glass-card p-4">
                <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                    <div className="space-y-2">
                        {leftColumn.map((item) => (
                            <WordItem key={`korean-${item.word.english}`} node={item} />
                        ))}
                    </div>
                    <div className="space-y-2">
                        {rightColumn.map((item) => (
                            <WordItem key={`english-${item.word.english}`} node={item} />
                        ))}
                    </div>
                </div>

                <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {/* Correct connections */}
                    {words.filter(w => matchedPairs.includes(w.english)).map(word => {
                        const startPos = getNodePosition(`korean-${word.english}`);
                        const endPos = getNodePosition(`english-${word.english}`);
                        if (startPos && endPos) {
                           return <line key={`line-${word.english}`} x1={startPos.x} y1={startPos.y} x2={endPos.x} y2={endPos.y} stroke="theme(colors.success.light)" strokeWidth="5" strokeLinecap="round" />
                        }
                        return null;
                    })}
                </svg>
            </div>
        </div>
    );
};

export default ConnectingGameScreen;

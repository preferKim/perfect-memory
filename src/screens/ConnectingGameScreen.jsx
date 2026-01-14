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

    const [selectedLeft, setSelectedLeft] = useState(null);
    const [incorrectPair, setIncorrectPair] = useState([]);

    const svgRef = useRef(null);
    const itemRefs = useRef({});

    useEffect(() => {
        const shuffledWords = shuffleArray(words);
        setLeftColumn(shuffledWords.map(word => ({ type: 'korean', word })));
        setRightColumn(shuffleArray(words).map(word => ({ type: 'english', word })));
        itemRefs.current = {};
        setSelectedLeft(null);
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

        if (node.type === 'korean') {
            if (selectedLeft && selectedLeft.id === node.id) {
                setSelectedLeft(null);
            } else {
                setSelectedLeft(node);
            }
        } else if (node.type === 'english') {
            if (selectedLeft) {
                onCheckAnswer(selectedLeft.word, node.word);

                if (selectedLeft.word.english !== node.word.english) {
                    setIncorrectPair([selectedLeft.id, node.id]);
                    setTimeout(() => setIncorrectPair([]), 500);
                }
                setSelectedLeft(null);
            }
        }
    };

    const WordItem = ({ node }) => {
        const id = `${node.type}-${node.word.english}`;
        const text = node.type === 'korean' ? node.word.korean : node.word.english;
        const isMatched = matchedPairs.includes(node.word.english);
        const isSelected = selectedLeft && selectedLeft.id === id;
        const isIncorrect = incorrectPair.includes(id);

        return (
            <div
                ref={el => itemRefs.current[id] = el}
                id={id}
                className={`p-2 rounded-lg shadow-md border-2 transition-all duration-300 ${
                    isMatched 
                        ? 'bg-green-100 border-green-300 opacity-60' 
                        : isSelected
                        ? 'bg-indigo-200 border-indigo-400 ring-2 ring-indigo-500'
                        : isIncorrect
                        ? 'bg-red-200 border-red-400'
                        : 'bg-white cursor-pointer hover:bg-indigo-100 hover:border-indigo-400'
                }`}
                onClick={() => handleWordClick({ id, ...node })}
            >
                <p className={`text-base font-semibold text-center ${isMatched ? 'text-green-700' : 'text-gray-800'}`}>{text}</p>
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
             <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow-lg">
                <button onClick={resetGame} className="text-gray-500 hover:text-indigo-600 p-2 rounded-full transition">
                    <ArrowLeft size={28} />
                </button>
                <div className="flex items-center gap-2 text-2xl font-bold text-indigo-600">
                    <Clock size={28} />
                    <span>{formatTime(time)}</span>
                </div>
                <div className="flex items-center gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Heart key={i} size={32} className={i < lives ? 'text-red-500 fill-current animate-pulse' : 'text-gray-300'} />
                    ))}
                </div>
            </div>

            <div className="relative">
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
                           return <line key={`line-${word.english}`} x1={startPos.x} y1={startPos.y} x2={endPos.x} y2={endPos.y} stroke="#22c55e" strokeWidth="5" strokeLinecap="round" />
                        }
                        return null;
                    })}
                </svg>
            </div>
        </div>
    );
};

export default ConnectingGameScreen;

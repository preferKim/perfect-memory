import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Button from '../components/Button';

const KoreanGrammarScreen = () => {
    const navigate = useNavigate();
    const [terms, setTerms] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null);

    useEffect(() => {
        fetch('/words/korean_grammar_terms.json')
            .then(res => res.json())
            .then(data => setTerms(data))
            .catch(error => console.error("Failed to load grammar terms:", error));
    }, []);

    if (terms.length === 0) {
        return (
            <div className="glass-card p-6 sm:p-12 text-center max-w-2xl mx-auto">
                <p className="text-white text-xl">품사 개념어를 불러오는 중입니다...</p>
            </div>
        );
    }
    
    // Detail View
    if (selectedTerm) {
        return (
            <div className="glass-card p-4 sm:p-8 text-white relative flex flex-col max-w-2xl mx-auto h-[90vh] max-h-[800px]">
                {/* Header */}
                <div className="w-full flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="w-1/4 text-left">
                        <button
                            onClick={() => setSelectedTerm(null)} // Back to list
                            className="text-gray-200 hover:text-white transition p-2"
                            title="목록으로"
                            aria-label="Back to grammar terms list"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    </div>
                    <div className="w-1/2 text-center">
                        <h2 className="text-2xl font-bold text-white">품사 상세</h2>
                    </div>
                    <div className="w-1/4 text-right"></div>
                </div>

                {/* Term Details */}
                <div className="overflow-y-auto pr-2 -mr-2 flex-grow">
                    <div className="glass-card p-6 sm:p-8 rounded-lg mb-6 w-full text-left bg-black/20">
                        <h3 className="text-3xl font-bold text-primary-light mb-2">{selectedTerm.term}</h3>
                        <p className="text-xl font-semibold text-primary-light mb-4">{selectedTerm.hanja} ({selectedTerm.hanja_meaning})</p>
                        <p className="text-lg text-gray-200 mb-6 leading-relaxed">{selectedTerm.description}</p>
                        
                        {selectedTerm.examples && selectedTerm.examples.length > 0 && (
                            <div className="border-t border-white/20 pt-4 mt-4">
                                <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
                                    <BookOpen size={20} className="mr-2 text-yellow-400" /> 예시
                                </h4>
                                {selectedTerm.examples.map((example, index) => (
                                    <div key={index} className="mb-4 last:mb-0 p-3 bg-black/10 rounded-md">
                                        <p className="text-md text-gray-100 italic">"{example.quote}"</p>
                                        {example.source && <p className="text-sm text-gray-400 mt-1">- {example.source}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="glass-card p-4 sm:p-8 text-white relative flex flex-col max-w-2xl mx-auto">
            {/* Header */}
            <div className="w-full flex justify-between items-center mb-4 flex-shrink-0">
                <div className="w-1/4 text-left">
                    <button
                        onClick={() => navigate('/korean')}
                        className="text-gray-200 hover:text-white transition p-2"
                        title="국어 선택으로"
                        aria-label="Back to Korean selection screen"
                    >
                        <ArrowLeft size={24} />
                    </button>
                </div>
                <div className="w-1/2 text-center">
                    <h2 className="text-2xl font-bold text-white">품사 학습</h2>
                </div>
                <div className="w-1/4 text-right"></div>
            </div>

            {/* Quiz Button Section */}
            <div className="w-full mb-6 flex-shrink-0">
                <Button 
                    onClick={() => navigate('/korean/grammar-quiz')}
                    variant="threedee" 
                    color="primary"
                    className="w-full h-28 text-2xl flex flex-col justify-center items-center"
                >
                    📝<span className="mt-2">품사 개념 퀴즈</span>
                </Button>
            </div>
            
            {/* Learning Area Section */}
            <div className="w-full flex flex-col flex-grow overflow-hidden">
                <h3 className="text-xl font-bold text-white mb-4 text-center flex-shrink-0">
                    <span className="inline-block border-b-2 border-primary-light pb-1">학습 영역: 9품사</span>
                </h3>
                <div>
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 w-full">
                        {terms.map((term, index) => (
                            <Button 
                                key={index} 
                                onClick={() => setSelectedTerm(term)}
                                variant="threedee" 
                                color="normal"
                                className="w-full h-24 text-base p-1 flex flex-col justify-center text-center"
                            >
                                <>
                                    <span className="text-lg font-bold underline">{term.term}</span>
                                    {`(${term.hanja_meaning.split(',')[0]})`}
                                </>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KoreanGrammarScreen;
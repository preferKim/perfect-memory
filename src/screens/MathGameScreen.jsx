import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import MathRenderer from '../components/MathRenderer';

const MathGameScreen = ({ onBack, difficulty, topicLevel }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const explanationRef = useRef(null);

  useEffect(() => {
    if (isAnswered && explanationRef.current) {
      explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isAnswered]);

  // Define loadQuestions function outside of useEffect to be callable by restartGame
  const loadQuestions = () => {
    const selectedDifficulty = difficulty || 'easy';
    const selectedTopicLevel = topicLevel || 1; // Default to 1 if not provided

    setIsLoading(true); // Always show loading when fetching

    fetch(`/words/math_${selectedDifficulty}.json`)
      .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        let finalQuestions = [];
        if (data.length === 0) {
          console.warn(`No questions found in file for difficulty: ${selectedDifficulty}`);
        } else {
          finalQuestions = data.filter(q => q.level === selectedTopicLevel);
          if (finalQuestions.length === 0) {
              console.warn(`No questions found for topic level ${selectedTopicLevel} in difficulty ${selectedDifficulty}.`);
          }
        }
        
        // Shuffle and slice to get 10 random questions
        const shuffled = [...finalQuestions].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 10));
        setIsLoading(false);
      })
      .catch(error => {
        console.error(`Failed to load math problems for difficulty ${selectedDifficulty}:`, error);
        setQuestions([]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadQuestions(); // Call loadQuestions when difficulty or topicLevel changes
  }, [difficulty, topicLevel]);

  const handleAnswerSelect = (option) => {
    if (isAnswered) return;

    setSelectedAnswer(option);
    setIsAnswered(true);

    if (option === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    } else {
      setWrongAnswers(wrongAnswers + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      setGameFinished(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setWrongAnswers(0);
    setGameFinished(false);
    setShowHint(false);
    loadQuestions(); // Call loadQuestions to get a new set of questions
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">준비중입니다.</h2>
              <p className="text-xl text-gray-700 mb-6">
                  선택하신 난이도와 주제에 해당하는 문제가 없습니다.
              </p>
              <button
                  onClick={onBack}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                  돌아가기
              </button>
          </div>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">퀴즈 완료!</h2>
            <p className="text-xl text-gray-700 mb-6">
                총 {questions.length}문제 중 <span className="font-bold text-blue-600">{score}</span>개를 맞혔습니다! (오답: {wrongAnswers})
            </p>
            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    과목 선택으로
                </button>
                <button
                    onClick={restartGame}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    다시 풀기
                </button>
            </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  const getButtonClass = (option) => {
    if (!isAnswered) {
      return "bg-white/5 hover:bg-white/10 border-white/10";
    }
    const isCorrect = option === currentQuestion.answer;
    if (isCorrect) {
      return "bg-green-500/50 border-green-500";
    }
    if (option === selectedAnswer && !isCorrect) {
      return "bg-red-500/50 border-red-500";
    }
    return "bg-white/5 border-white/10 opacity-60";
  };
  
  const getIcon = (option) => {
      if (!isAnswered) return null;
      const isCorrect = option === currentQuestion.answer;
      if (isCorrect) return <Check className="text-green-600" />;
      if (option === selectedAnswer && !isCorrect) return <X className="text-red-600" />;
      return null;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-3xl">
            {/* Header */}
            <div className="relative flex items-center justify-between mb-4 self-stretch">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} className="text-gray-300" />
                </button>
                <div className="text-lg font-bold text-white flex items-center gap-4">
                    <span>수학 퀴즈</span>
                    <div className="flex items-center gap-3 text-sm bg-black/20 px-3 py-1 rounded-lg">
                        <span className="text-green-400 font-bold">O: {score}</span>
                        <span className="text-red-400 font-bold">X: {wrongAnswers}</span>
                    </div>
                </div>
                <div className="w-8"></div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>

            {/* Question Card */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-lg mb-3">
                <p className="text-sm text-gray-300 mb-2">문제 {currentQuestionIndex + 1}/{questions.length}</p>
                {/* Problem text */}
                <div className="mb-2">
                    <p className="text-xl sm:text-2xl font-medium text-white leading-relaxed">
                        <MathRenderer text={currentQuestion.problem} />
                    </p>
                </div>
                {/* Hint button - moved to next line and conditional rendering based on !showHint */}
                {!showHint && currentQuestion.hint && (
                    <button
                        onClick={() => setShowHint(true)}
                        className="mb-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                        힌트보기
                    </button>
                )}
                {/* Hint text - only shown if showHint is true */}
                {showHint && currentQuestion.hint && (
                    <p className="text-white text-sm italic mb-4 flex items-center underline">
                      <MathRenderer text={currentQuestion.hint} />
                    </p>
                )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={isAnswered}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${getButtonClass(option)}`}
                    >
                        <span className="font-medium text-white">
                          <MathRenderer text={option} />
                        </span>
                        {getIcon(option)}
                    </button>
                ))}
            </div>

            {/* Explanation & Next Button */}
            {isAnswered && (
                <div ref={explanationRef} className="glass-card p-6 rounded-2xl shadow-lg animate-fade-in">
                    <h3 className="font-bold text-lg mb-2 text-white">{selectedAnswer === currentQuestion.answer ? "정답입니다!" : "오답입니다."}</h3>
                    <p className="text-gray-300 mb-4">
                      <MathRenderer text={currentQuestion.explanation} />
                    </p>
                    <button
                        onClick={handleNextQuestion}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        {currentQuestionIndex < questions.length - 1 ? "다음 문제" : "결과 보기"}
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default MathGameScreen;
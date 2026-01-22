import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

const BOARD_SIZE = 8;
const ANIMAL_ICONS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

const getRandomIcon = () => ANIMAL_ICONS[Math.floor(Math.random() * ANIMAL_ICONS.length)];

const PuzzleGame = ({ onBack }) => {
  const [board, setBoard] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState(0);
  const [matchedCells, setMatchedCells] = useState(new Set());
  const [selectedCell, setSelectedCell] = useState(null);
  const [draggedCell, setDraggedCell] = useState(null);
  const processingRef = useRef(false);

  useEffect(() => {
    setBoard(createInitialBoard());
  }, []);

  const createInitialBoard = () => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        let newIcon;
        do {
          newIcon = getRandomIcon();
        } while (
          (c >= 2 && newBoard[r][c-1] === newIcon && newBoard[r][c-2] === newIcon) ||
          (r >= 2 && newBoard[r-1][c] === newIcon && newBoard[r-2][c] === newIcon)
        );
        newBoard[r][c] = newIcon;
      }
    }
    return newBoard;
  };

  const findMatches = (currentBoard) => {
    const matches = new Set();

    // Horizontal matches
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 2; c++) {
        if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r][c+1] && currentBoard[r][c] === currentBoard[r][c+2]) {
          matches.add(`${r}-${c}`);
          matches.add(`${r}-${c+1}`);
          matches.add(`${r}-${c+2}`);
        }
      }
    }

    // Vertical matches
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (let r = 0; r < BOARD_SIZE - 2; r++) {
        if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r+1][c] && currentBoard[r][c] === currentBoard[r+2][c]) {
          matches.add(`${r}-${c}`);
          matches.add(`${r+1}-${c}`);
          matches.add(`${r+2}-${c}`);
        }
      }
    }
    return matches;
  };

  const clearMatches = (currentBoard, matches) => {
    const newBoard = [...currentBoard.map(row => [...row])];
    matches.forEach(match => {
      const [r, c] = match.split('-').map(Number);
      newBoard[r][c] = null;
    });
    return newBoard;
  };

  const applyGravity = (currentBoard) => {
    const newBoard = [...currentBoard.map(row => [...row])];
    for (let c = 0; c < BOARD_SIZE; c++) {
      let writeRow = BOARD_SIZE - 1;
      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        if (newBoard[r][c]) {
          const temp = newBoard[r][c];
          newBoard[r][c] = null;
          newBoard[writeRow][c] = temp;
          writeRow--;
        }
      }
    }
    return newBoard;
  };

  const refillBoard = (currentBoard) => {
    const newBoard = [...currentBoard.map(row => [...row])];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (newBoard[r][c] === null) {
          newBoard[r][c] = getRandomIcon();
        }
      }
    }
    return newBoard;
  };

  const processCascades = async (initialBoard) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    let tempBoard = [...initialBoard.map(row => [...row])];
    
    while (true) {
      const matches = findMatches(tempBoard);
      if (matches.size === 0) {
        break;
      }

      setScore(prev => prev + matches.size);
      setMatchedCells(matches);
      await new Promise(r => setTimeout(r, 300));
      
      tempBoard = clearMatches(tempBoard, matches);
      setMatchedCells(new Set());
      
      tempBoard = applyGravity(tempBoard);
      tempBoard = refillBoard(tempBoard);

      setBoard(tempBoard);
      await new Promise(r => setTimeout(r, 400));
    }

    setBoard(tempBoard);
    setIsProcessing(false);
    processingRef.current = false;
  };

  const handleCellClick = async (r, c) => {
    if (isProcessing || !board) return;

    if (!selectedCell) {
      setSelectedCell({ r, c });
    } else {
      const isAdjacent = 
        (Math.abs(selectedCell.r - r) === 1 && selectedCell.c === c) ||
        (Math.abs(selectedCell.c - c) === 1 && selectedCell.r === r);

      if (!isAdjacent) {
        setSelectedCell({ r, c });
        return;
      }

      await swapCells(selectedCell.r, selectedCell.c, r, c);
      setSelectedCell(null);
    }
  };

  const handleDragStart = (e, r, c) => {
    if (isProcessing) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    setDraggedCell({ r, c });
    
    // 드래그 이미지 설정 (더 나은 시각적 피드백)
    const dragImage = e.currentTarget.cloneNode(true);
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'scale(1.1)';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 25, 25);
    setTimeout(() => document.body.removeChild(dragImage), 0);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${r}-${c}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e, r, c) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedCell || isProcessing) return;

    // 같은 셀에 드롭한 경우 무시
    if (draggedCell.r === r && draggedCell.c === c) {
      setDraggedCell(null);
      return;
    }

    const isAdjacent = 
      (Math.abs(draggedCell.r - r) === 1 && draggedCell.c === c) ||
      (Math.abs(draggedCell.c - c) === 1 && draggedCell.r === r);

    if (isAdjacent) {
      await swapCells(draggedCell.r, draggedCell.c, r, c);
    }
    
    setDraggedCell(null);
  };

  const handleDragEnd = (e) => {
    e.preventDefault();
    setDraggedCell(null);
  };

  const swapCells = async (r1, c1, r2, c2) => {
    // Swap cells
    const newBoard = [...board.map(row => [...row])];
    const temp = newBoard[r1][c1];
    newBoard[r1][c1] = newBoard[r2][c2];
    newBoard[r2][c2] = temp;
    
    const matches = findMatches(newBoard);
    
    if (matches.size > 0) {
      setBoard(newBoard);
      await processCascades(newBoard);
    } else {
      // Show swap briefly then revert
      setBoard(newBoard);
      setTimeout(() => {
        const revertedBoard = [...newBoard.map(row => [...row])];
        revertedBoard[r2][c2] = newBoard[r1][c1];
        revertedBoard[r1][c1] = newBoard[r2][c2];
        setBoard(revertedBoard);
      }, 200);
    }
  };

  if (!board) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-white text-xl">보드 생성 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack} 
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-white">퍼즐 게임</h1>
          <div className="bg-white/10 px-4 py-2 rounded-lg">
            <span className="text-xl font-bold text-white">점수: {score}</span>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-black/30 rounded-2xl p-3 shadow-2xl backdrop-blur-sm">
          <div 
            className="grid gap-1"
            style={{ 
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              aspectRatio: '1/1'
            }}
          >
            {board.map((row, r) => 
              row.map((icon, c) => {
                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                const isMatched = matchedCells.has(`${r}-${c}`);
                const isDragging = draggedCell?.r === r && draggedCell?.c === c;
                
                return (
                  <div
                    key={`${r}-${c}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Cell ${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCellClick(r, c);
                      }
                    }}
                    draggable={!isProcessing}
                    onDragStart={(e) => handleDragStart(e, r, c)}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDrop={(e) => handleDrop(e, r, c)}
                    onDragEnd={handleDragEnd}
                    className={`
                      w-full h-full rounded-lg transition-all duration-200
                      flex items-center justify-center text-3xl sm:text-4xl
                      select-none touch-none
                      ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105 active:scale-95'}
                      ${isSelected ? 'bg-yellow-400/40 ring-4 ring-yellow-300 scale-110' : 'bg-white/10 hover:bg-white/20'}
                      ${isMatched ? 'animate-pulse bg-red-400/60' : ''}
                      ${isDragging ? 'opacity-30 scale-90' : ''}
                    `}
                    style={{
                      transform: isMatched ? 'scale(0.8)' : isSelected ? 'scale(1.1)' : isDragging ? 'scale(0.9)' : 'scale(1)',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none'
                    }}
                  >
                    {icon}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-white/80 text-sm">
          <p>같은 동물 3개 이상을 맞춰보세요!</p>
          <p className="mt-1">🖱️ 클릭: 인접한 두 블록을 클릭해서 교환</p>
          <p>👆 드래그: 블록을 드래그해서 인접한 블록에 드롭</p>
        </div>
      </div>
    </div>
  );
};

export default PuzzleGame;
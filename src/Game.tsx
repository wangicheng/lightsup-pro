import { useState, useEffect, useCallback, useRef } from 'react';
import { generateRandomLevel, toggleLights, checkWin } from './utils/gameLogic';
import type { GameRecord } from './types';

interface GameProps {
  onGameComplete?: (data: Pick<GameRecord, 'timeSpent' | 'moves' | 'initialGrid'>) => void;
  initialLevel?: boolean[][];
  onLevelReset?: () => void;
  gridSize?: number;
}

export default function Game({ onGameComplete, initialLevel, onLevelReset, gridSize = 5 }: GameProps) {
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [initialGrid, setInitialGrid] = useState<boolean[][]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const startTimeRef = useRef<number>(0);

  // 初始化遊戲
  const startNewGame = useCallback(() => {
    if (onLevelReset) {
      onLevelReset();
    }
    const difficulty = gridSize * gridSize * 3 + Math.floor(Math.random() * 2);
    
    const newLevel = generateRandomLevel(gridSize, difficulty);
    setGrid(newLevel);
    setInitialGrid(newLevel);
    setMoves(0);
    setTime(0);
    setIsWon(false);
    setIsPlaying(true);
    startTimeRef.current = Date.now();
  }, [onLevelReset, gridSize]);

  // 第一次加載
  useEffect(() => {
    // 防止在遊戲進行中因父組件重渲染而重置 (除非是切換到重播模式或改變尺寸)
    if (grid.length > 0 && !initialLevel && grid.length === gridSize) return;

    if (initialLevel) {
      setGrid(initialLevel);
      setInitialGrid(initialLevel);
      setMoves(0);
      setTime(0);
      setIsWon(false);
      setIsPlaying(true);
      startTimeRef.current = Date.now();
    } else {
      startNewGame();
    }
  }, [initialLevel, startNewGame, gridSize]);

  // 計時器邏輯
  useEffect(() => {
    let interval: number;
    if (isPlaying && !isWon) {
      interval = setInterval(() => {
        const now = Date.now();
        setTime((now - startTimeRef.current) / 1000);
      }, 37); // 約 30fps 更新頻率
    }
    return () => clearInterval(interval);
  }, [isPlaying, isWon]);

  // 處理點擊
  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;

    const newGrid = toggleLights(grid, r, c);
    setGrid(newGrid);
    const newMoves = moves + 1;
    setMoves(newMoves);

    if (checkWin(newGrid)) {
      setIsWon(true);
      setIsPlaying(false);
      
      const endTime = Date.now();
      const finalTime = (endTime - startTimeRef.current) / 1000;
      setTime(finalTime);

      if (onGameComplete) {
        onGameComplete({
          timeSpent: finalTime,
          moves: newMoves,
          initialGrid: initialGrid
        });
      }
    }
  };

  // 格式化時間 mm:ss.ms
  const formatTime = (seconds: number) => {
    const totalMs = Math.floor(seconds * 1000);
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  if (grid.length === 0) return null;

  // 根據網格密度動態調整樣式
  const isLargeGrid = grid.length > 10;
  const isMediumGrid = grid.length > 5;
  
  // 網格越密，間距越小，圓角越小，內距越小
  const gapClass = isLargeGrid ? 'gap-0.5' : isMediumGrid ? 'gap-1.5' : 'gap-3';
  const cellRoundedClass = isLargeGrid ? 'rounded-sm' : isMediumGrid ? 'rounded-md' : 'rounded-xl';
  const boardRoundedClass = isLargeGrid ? 'rounded-xl' : isMediumGrid ? 'rounded-2xl' : 'rounded-[2rem]';
  const pClass = isLargeGrid ? 'p-3' : isMediumGrid ? 'p-4' : 'p-6';

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto animate-fade-in">
      
      {/* Stats Bar */}
      <div className="flex items-center gap-12 mb-10">
        <div className="flex flex-col items-center w-36">
          <span className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase mb-1">Time</span>
          <span className="text-2xl font-mono font-medium text-zinc-200 tabular-nums">
            {formatTime(time)}
          </span>
        </div>
        <div className="w-px h-10 bg-zinc-800" />
        <div className="flex flex-col items-center w-36">
          <span className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase mb-1">Moves</span>
          <span className="text-2xl font-mono font-medium text-zinc-200 tabular-nums">
            {moves}
          </span>
        </div>
      </div>

      {/* Game Board Container */}
      {/* 固定最大寬度以接近原版 5x5 的視覺大小 (約 460px) */}
      <div className="relative group w-full max-w-[460px] aspect-square">
        {/* Glow effect behind the board */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 ${boardRoundedClass} blur-xl transition-opacity duration-1000 ${isWon ? 'opacity-100' : 'opacity-0'}`} />
        
        <div className={`relative bg-zinc-900/80 backdrop-blur-sm ${pClass} ${boardRoundedClass} border border-zinc-800 shadow-2xl h-full flex items-center justify-center`}>
          <div 
            className={`grid ${gapClass} w-full h-full`}
            style={{ 
              gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${grid.length}, minmax(0, 1fr))`
            }}
          >
            {grid.map((row, rIndex) => (
              row.map((isOn, cIndex) => (
                <button
                  key={`${rIndex}-${cIndex}`}
                  onClick={() => handleCellClick(rIndex, cIndex)}
                  aria-label={`Toggle light at ${rIndex},${cIndex}`}
                  className={`
                    relative w-full h-full ${cellRoundedClass} transition-all duration-300 ease-out
                    ${isOn 
                      ? 'bg-amber-400 shadow-[0_0_15px_-2px_rgba(251,191,36,0.6)] scale-100 z-10' 
                      : 'bg-zinc-800 hover:bg-zinc-750 scale-95 shadow-inner'
                    }
                    ${isWon ? 'cursor-default' : 'cursor-pointer active:scale-90'}
                  `}
                >
                  {/* 只有在格子夠大時才顯示裝飾點 */}
                  {grid.length <= 8 && !isOn && (
                    <div className="absolute inset-0 m-auto w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-zinc-900/50" />
                  )}
                  {grid.length <= 8 && isOn && (
                    <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white/40 blur-[1px]" />
                  )}
                </button>
              ))
            ))}
          </div>
        </div>
      </div>

      {/* Win State / Controls */}
      <div className="h-24 mt-6 flex flex-col items-center justify-center space-y-4">
        {isWon ? (
          <div className="animate-fade-in-up text-center space-y-4">
            <div className="text-amber-400 font-bold text-lg tracking-widest uppercase drop-shadow-lg">
              Level Complete
            </div>
            <button
              onClick={startNewGame}
              className="px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-full font-bold text-sm tracking-wide transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-zinc-900/50"
            >
              PLAY AGAIN
            </button>
          </div>
        ) : (
          <button
            onClick={startNewGame}
            className="group flex items-center gap-2 px-6 py-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm font-medium tracking-wide"
          >
            <span className="w-2 h-2 rounded-full bg-zinc-600 group-hover:bg-amber-500 transition-colors" />
            RESET BOARD
          </button>
        )}
      </div>
    </div>
  );
}
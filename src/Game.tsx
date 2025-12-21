import { useState, useEffect, useCallback, useRef } from 'react';
import { generateRandomLevel, toggleLights, checkWin } from './utils/gameLogic';
import type { GameRecord } from './types';

interface GameProps {
  onGameComplete?: (data: Pick<GameRecord, 'timeSpent' | 'moves' | 'initialGrid'>) => void;
}

export default function Game({ onGameComplete }: GameProps) {
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [initialGrid, setInitialGrid] = useState<boolean[][]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const startTimeRef = useRef<number>(0);

  // 初始化遊戲
  const startNewGame = useCallback(() => {
    const newLevel = generateRandomLevel(100);
    setGrid(newLevel);
    setInitialGrid(newLevel);
    setMoves(0);
    setTime(0);
    setIsWon(false);
    setIsPlaying(true);
    startTimeRef.current = Date.now();
  }, []);

  // 第一次加載
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

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

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto animate-fade-in">
      
      {/* Stats Bar */}
      <div className="flex gap-12 mb-10">
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase mb-1">Time</span>
          <span className="text-2xl font-mono font-medium text-zinc-200 tabular-nums">
            {formatTime(time)}
          </span>
        </div>
        <div className="w-px h-10 bg-zinc-800" />
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase mb-1">Moves</span>
          <span className="text-2xl font-mono font-medium text-zinc-200 tabular-nums">
            {moves}
          </span>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative group">
        {/* Glow effect behind the board */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-[2rem] blur-xl transition-opacity duration-1000 ${isWon ? 'opacity-100' : 'opacity-0'}`} />
        
        <div className="relative bg-zinc-900/80 backdrop-blur-sm p-6 rounded-[2rem] border border-zinc-800 shadow-2xl">
          <div className="flex flex-col gap-3">
            {grid.map((row, rIndex) => (
              <div key={rIndex} className="flex gap-3">
                {row.map((isOn, cIndex) => (
                  <button
                    key={`${rIndex}-${cIndex}`}
                    onClick={() => handleCellClick(rIndex, cIndex)}
                    aria-label={`Toggle light at ${rIndex},${cIndex}`}
                    className={`
                      relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl transition-all duration-300 ease-out
                      ${isOn 
                        ? 'bg-amber-400 shadow-[0_0_25px_-5px_rgba(251,191,36,0.6)] scale-100 z-10' 
                        : 'bg-zinc-800 hover:bg-zinc-750 scale-95 shadow-inner'
                      }
                      ${isWon ? 'cursor-default' : 'cursor-pointer active:scale-90'}
                    `}
                  >
                    {!isOn && (
                      <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-zinc-900/50" />
                    )}
                    {isOn && (
                      <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-white/40 blur-[1px]" />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Win State / Controls */}
      <div className="h-24 mt-12 flex flex-col items-center justify-center space-y-4">
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
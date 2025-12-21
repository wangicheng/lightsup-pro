import { useState, useEffect, useCallback } from 'react';
import Game from './Game';
import Tutorial from './Tutorial';
import History from './History';
import type { GameRecord } from './types';

type View = 'game' | 'tutorial' | 'history' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('game');
  const [gridSize, setGridSize] = useState(5);
  const [replayGrid, setReplayGrid] = useState<boolean[][] | null>(null);
  const [history, setHistory] = useState<GameRecord[]>(() => {
    const saved = localStorage.getItem('lightsup-history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('lightsup-history', JSON.stringify(history));
  }, [history]);

  const handleGameComplete = (data: Pick<GameRecord, 'timeSpent' | 'moves' | 'initialGrid'>) => {
    // 如果是重播模式，不記錄到歷史
    if (replayGrid) return;

    const newRecord: GameRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      gridSize: gridSize, // Add gridSize to record
      ...data
    } as GameRecord; // Cast to avoid TS error if type not updated yet
    setHistory(prev => [...prev, newRecord]);
  };

  const handleReplay = (grid: boolean[][]) => {
    setReplayGrid(grid);
    setGridSize(grid.length); // Set size to match replay
    setView('game');
  };

  const handleLevelReset = useCallback(() => {
    setReplayGrid(null);
  }, []);

  return (
    <div 
      className="h-screen w-full bg-zinc-950 flex flex-col items-center text-zinc-100 font-sans selection:bg-amber-500/30 overflow-hidden"
    >
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header Area */}
      <div className="mb-6 text-center space-y-2 mt-8 flex-none">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-500">
          LIGHTS UP
        </h1>
        <div className="h-1 w-12 bg-amber-500 rounded-full mx-auto" />
      </div>

      {/* Navigation Tabs */}
      <div className="relative flex w-full max-w-md p-1 bg-zinc-900 rounded-full mb-8 border border-zinc-800 flex-none">
        {/* Sliding Background */}
        <div 
          className={`absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/4)] rounded-full bg-zinc-100 shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            view === 'game' ? 'translate-x-0' : 
            view === 'history' ? 'translate-x-full' : 
            view === 'tutorial' ? 'translate-x-[200%]' :
            'translate-x-[300%]'
          }`} 
        />

        <button
          onClick={() => {
            setView('game');
            setReplayGrid(null); // 切換到 Game tab 時重置為一般模式
          }}
          className={`relative z-10 flex-1 py-2 text-sm font-bold transition-colors duration-300 ${
            view === 'game' 
              ? 'text-zinc-950' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          GAME
        </button>
        <button
          onClick={() => setView('history')}
          className={`relative z-10 flex-1 py-2 text-sm font-bold transition-colors duration-300 ${
            view === 'history' 
              ? 'text-zinc-950' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          HISTORY
        </button>
        <button
          onClick={() => setView('tutorial')}
          className={`relative z-10 flex-1 py-2 text-sm font-bold transition-colors duration-300 ${
            view === 'tutorial' 
              ? 'text-zinc-950' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          TUTORIAL
        </button>
        <button
          onClick={() => setView('settings')}
          className={`relative z-10 flex-1 py-2 text-sm font-bold transition-colors duration-300 ${
            view === 'settings' 
              ? 'text-zinc-950' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          SETTINGS
        </button>
      </div>

      {/* Content Area */}
      <div className="w-full flex-1 overflow-y-auto scrollbar-hide px-6 pb-6">
        <div className="flex justify-center w-full">
          {view === 'game' && (
            <Game 
              key={replayGrid ? 'replay' : `game-${gridSize}`} // Force remount on size change
              onGameComplete={handleGameComplete} 
              initialLevel={replayGrid || undefined}
              onLevelReset={handleLevelReset}
              gridSize={gridSize}
            />
          )}
          {view === 'history' && <History records={history} onReplay={handleReplay} gridSize={gridSize} />}
          {view === 'tutorial' && <Tutorial />}
          {view === 'settings' && (
            <div className="w-full max-w-md animate-fade-in space-y-6">
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
                <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-amber-500 rounded-full"/>
                  Game Settings
                </h2>
                
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-400">Grid Size</span>
                    <span className="text-amber-500 font-mono font-bold">{gridSize} x {gridSize}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={gridSize}
                    onChange={(e) => {
                      setGridSize(parseInt(e.target.value));
                      setReplayGrid(null);
                    }}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                  />
                  <div className="flex justify-between w-full text-[10px] text-zinc-600 font-mono px-1">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    Adjust the grid size to change difficulty. Larger grids are more challenging.
                    <br/>
                    Note: Changing grid size will reset the current game.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
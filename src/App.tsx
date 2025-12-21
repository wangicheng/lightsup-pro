import { useState, useEffect, useCallback } from 'react';
import Game from './Game';
import Tutorial from './Tutorial';
import History from './History';
import type { GameRecord } from './types';

type View = 'game' | 'tutorial' | 'history';

export default function App() {
  const [view, setView] = useState<View>('game');
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
      ...data
    };
    setHistory(prev => [...prev, newRecord]);
  };

  const handleReplay = (grid: boolean[][]) => {
    setReplayGrid(grid);
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
      <div className="mb-8 text-center space-y-2 mt-10 flex-none">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-500">
          LIGHTS UP
        </h1>
        <div className="h-1 w-12 bg-amber-500 rounded-full mx-auto" />
      </div>

      {/* Navigation Tabs */}
      <div className="relative flex w-full max-w-sm p-1 bg-zinc-900 rounded-full mb-8 border border-zinc-800 flex-none">
        {/* Sliding Background */}
        <div 
          className={`absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-zinc-100 shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            view === 'game' ? 'translate-x-0' : 
            view === 'history' ? 'translate-x-full' : 
            'translate-x-[200%]'
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
      </div>

      {/* Content Area */}
      <div className="w-full flex-1 overflow-y-auto scrollbar-hide px-6 pb-6">
        <div className="flex justify-center">
          {view === 'game' && (
            <Game 
              key={replayGrid ? 'replay' : 'normal'} // 強制重新掛載以重置狀態
              onGameComplete={handleGameComplete} 
              initialLevel={replayGrid || undefined}
              onLevelReset={handleLevelReset}
            />
          )}
          {view === 'history' && <History records={history} onReplay={handleReplay} />}
          {view === 'tutorial' && <Tutorial />}
        </div>
      </div>
      
    </div>
  );
}
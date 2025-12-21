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
      className="h-screen w-full bg-zinc-950 flex flex-col items-center p-6 text-zinc-100 font-sans selection:bg-amber-500/30 overflow-y-auto scrollbar-hide"
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
      <div className="mb-8 text-center space-y-2 mt-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-100 to-zinc-500">
          LIGHTS UP
        </h1>
        <div className="h-1 w-12 bg-amber-500 rounded-full mx-auto" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-zinc-900 rounded-full mb-8 border border-zinc-800">
        <button
          onClick={() => {
            setView('game');
            setReplayGrid(null); // 切換到 Game tab 時重置為一般模式
          }}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            view === 'game' 
              ? 'bg-zinc-100 text-zinc-950 shadow-lg' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          GAME
        </button>
        <button
          onClick={() => setView('history')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            view === 'history' 
              ? 'bg-zinc-100 text-zinc-950 shadow-lg' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          HISTORY
        </button>
        <button
          onClick={() => setView('tutorial')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            view === 'tutorial' 
              ? 'bg-zinc-100 text-zinc-950 shadow-lg' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          TUTORIAL
        </button>
      </div>

      {/* Content Area */}
      <div className="w-full flex justify-center">
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
  );
}
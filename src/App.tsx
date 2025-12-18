import { useState } from 'react';
import Game from './Game';
import Tutorial from './Tutorial';

type View = 'game' | 'tutorial';

export default function App() {
  const [view, setView] = useState<View>('game');

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center p-6 text-zinc-100 font-sans selection:bg-amber-500/30">
      
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
          onClick={() => setView('game')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            view === 'game' 
              ? 'bg-zinc-100 text-zinc-950 shadow-lg' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          GAME
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
        {view === 'game' ? <Game /> : <Tutorial />}
      </div>
      
    </div>
  );
}
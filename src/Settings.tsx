import React from 'react';

interface SettingsProps {
  gridSize: number;
  setGridSize: (size: number) => void;
  onResetReplay: () => void;
  onClearHistory: () => void;
}

export default function Settings({ 
  gridSize, 
  setGridSize, 
  onResetReplay, 
  onClearHistory 
}: SettingsProps) {
  
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      onClearHistory();
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in space-y-6">
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
        <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-amber-500 rounded-full"/>
          Game Settings
        </h2>
        
        <div className="flex flex-col gap-8">
          {/* Grid Size Section */}
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
                onResetReplay();
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

          {/* Data Management Section */}
          <div className="pt-6 border-t border-zinc-800/50">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Data Management</h3>
            <button
              onClick={handleClearHistory}
              className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-bold rounded-xl transition-colors border border-red-500/20 flex items-center justify-center gap-2"
            >
              Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

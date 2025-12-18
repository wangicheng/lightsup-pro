import { useState, useEffect } from 'react';
import { GRID_SIZE, toggleLights, createSolvedGrid, checkWin } from './utils/gameLogic';

// 定義教學關卡資料結構
type TutorialLevel = {
  id: string;
  title: string;
  description: string;
  setup: () => boolean[][];
};

const TUTORIAL_LEVELS: TutorialLevel[] = [
  {
    id: 'basic',
    title: '基礎開關',
    description: '點擊任意燈泡，會同時切換「它自己」與「上下左右」四個相鄰燈泡的狀態。試著點擊中間熄滅的燈泡，將它點亮。',
    setup: () => {
      // 產生一個全亮盤面，然後點擊中間，造成中間與四周熄滅
      let grid = createSolvedGrid();
      return toggleLights(grid, 2, 2);
    }
  },
  {
    id: 'chase-intro',
    title: '追燈法 (Chasing)',
    description: '這是解題的核心技巧：當你看到某一列有暗燈時，點擊它「正下方」的燈泡，就能改變上方燈泡的狀態。試著點擊第二列的燈泡，來修復第一列的暗燈。',
    setup: () => {
      let grid = createSolvedGrid();
      // 模擬第一列有暗燈的情況 (透過點擊第二列造成)
      grid = toggleLights(grid, 1, 1);
      grid = toggleLights(grid, 1, 3);
      return grid;
    }
  },
  {
    id: 'corner',
    title: '邊角處理',
    description: '角落的燈泡只有兩個鄰居。這在處理邊界情況時很重要。試著將角落的暗燈點亮。',
    setup: () => {
      let grid = createSolvedGrid();
      grid = toggleLights(grid, 4, 0);
      grid = toggleLights(grid, 4, 4);
      return grid;
    }
  },
  {
    id: 'advanced-row',
    title: '整列消除',
    description: '現在試試看連續運用「追燈法」。你的目標是把第一列全部點亮，不用管第二列會變怎樣。只要專注於「點擊暗燈的正下方」即可。',
    setup: () => {
      let grid = createSolvedGrid();
      grid = toggleLights(grid, 1, 0);
      grid = toggleLights(grid, 1, 1);
      grid = toggleLights(grid, 1, 2);
      grid = toggleLights(grid, 1, 3);
      grid = toggleLights(grid, 1, 4);
      return grid;
    }
  }
];

export default function Tutorial() {
  const [activeLevelId, setActiveLevelId] = useState(TUTORIAL_LEVELS[0].id);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [isWon, setIsWon] = useState(false);

  const currentLevel = TUTORIAL_LEVELS.find(l => l.id === activeLevelId) || TUTORIAL_LEVELS[0];

  // 切換關卡或重置時執行
  useEffect(() => {
    setGrid(currentLevel.setup());
    setIsWon(false);
  }, [currentLevel]);

  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;
    
    const newGrid = toggleLights(grid, r, c);
    setGrid(newGrid);

    if (checkWin(newGrid)) {
      setIsWon(true);
    }
  };

  const resetLevel = () => {
    setGrid(currentLevel.setup());
    setIsWon(false);
  };

  if (grid.length === 0) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl mx-auto animate-fade-in p-4">
      
      {/* Sidebar: Level Selection */}
      <div className="lg:w-1/3 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-zinc-100 px-2">教學模式</h2>
        <div className="flex flex-col gap-2">
          {TUTORIAL_LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setActiveLevelId(level.id)}
              className={`
                text-left px-4 py-3 rounded-xl transition-all duration-200 border
                ${activeLevelId === level.id 
                  ? 'bg-zinc-800 border-amber-500/50 text-amber-400 shadow-lg' 
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }
              `}
            >
              <div className="font-bold text-sm">{level.title}</div>
            </button>
          ))}
        </div>

        {/* Description Box */}
        <div className="mt-4 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 text-sm leading-relaxed text-zinc-300">
          <div className="text-amber-500 font-bold mb-2 uppercase tracking-wider text-xs">Mission</div>
          {currentLevel.description}
        </div>
      </div>

      {/* Main Area: Game Board */}
      <div className="lg:w-2/3 flex flex-col items-center justify-center min-h-[500px] bg-zinc-950/50 rounded-3xl border border-zinc-900 relative overflow-hidden">
        
        {/* Success Overlay */}
        {isWon && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
            <div className="text-3xl font-bold text-amber-400 mb-4">Excellent!</div>
            <button 
              onClick={resetLevel}
              className="px-6 py-2 bg-zinc-100 text-zinc-950 rounded-full font-bold hover:scale-105 transition-transform"
            >
              Replay
            </button>
          </div>
        )}

        <div className="relative p-6">
           <div className="flex flex-col gap-3">
            {grid.map((row, rIndex) => (
              <div key={rIndex} className="flex gap-3">
                {row.map((isOn, cIndex) => (
                  <button
                    key={`${rIndex}-${cIndex}`}
                    onClick={() => handleCellClick(rIndex, cIndex)}
                    className={`
                      relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl transition-all duration-300 ease-out
                      ${isOn 
                        ? 'bg-amber-400 shadow-[0_0_20px_-5px_rgba(251,191,36,0.5)] scale-100' 
                        : 'bg-zinc-800 hover:bg-zinc-750 scale-95'
                      }
                    `}
                  >
                    {!isOn && <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-zinc-900/50" />}
                    {isOn && <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/40 blur-[1px]" />}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button 
            onClick={resetLevel}
            className="text-xs font-bold text-zinc-500 hover:text-zinc-300 tracking-widest uppercase"
          >
            Reset Level
          </button>
        </div>
      </div>
    </div>
  );
}
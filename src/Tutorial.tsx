import { useState, useEffect } from 'react';
import { GRID_SIZE, toggleLights, createSolvedGrid, checkWin } from './utils/gameLogic';

// 定義教學關卡資料結構
type TutorialLevel = {
  id: string;
  title: string;
  description: string;
  initialToggles: [number, number][];
};

type TutorialCategory = {
  title: string;
  levels: TutorialLevel[];
};

const TUTORIAL_CATEGORIES: TutorialCategory[] = [
  {
    title: '基礎觀念',
    levels: [
      {
        id: 'basic',
        title: '基礎開關',
        description: '點擊任意燈泡，會同時切換「它自己」與「上下左右」四個相鄰燈泡的狀態。試著點擊中間熄滅的燈泡，將它點亮。',
        initialToggles: [[2, 2]]
      },
      {
        id: 'chase-intro',
        title: '追燈法 (Chasing)',
        description: '這是解題的核心技巧：當你看到某一列有暗燈時，點擊它「正下方」的燈泡，就能改變上方燈泡的狀態。試著點擊第二列的燈泡，來修復第一列的暗燈。',
        initialToggles: [[1, 1], [1, 3]]
      },
      {
        id: 'corner',
        title: '邊角處理',
        description: '角落的燈泡只有兩個鄰居。這在處理邊界情況時很重要。試著將角落的暗燈點亮。',
        initialToggles: [[4, 0], [4, 4]]
      },
      {
        id: 'advanced-row',
        title: '整列消除',
        description: '現在試試看連續運用「追燈法」。你的目標是把第一列全部點亮，不用管第二列會變怎樣。只要專注於「點擊暗燈的正下方」即可。',
        initialToggles: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]]
      },
    ]
  },
  {
    title: '常見公式',
    levels: [
      {
        id: '01001',
        title: '公式：🌑🌕🌑🌑🌕',
        description: '當追燈至最後一列，呈現「暗亮暗暗亮」的狀態時，這是一個常見的特殊情況。這時候無法直接消除，必須回到第一列點擊特定位置。',
        initialToggles: [
          [0, 4], [1, 3], [1, 4], [2, 2], [2, 4], 
          [3, 1], [3, 2], [3, 3], [4, 0]
        ]
      },
      {
        id: '10010',
        title: '公式：🌕🌑🌑🌕🌑',
        description: '這是上一關的鏡像版本。當最後一列呈現「亮暗暗亮暗」時，同樣需要對應的公式解法。',
        initialToggles: [
          [0, 0], [1, 0], [1, 1], [2, 0], [2, 2], 
          [3, 1], [3, 2], [3, 3], [4, 4]
        ]
      },
      {
        id: '00100',
        title: '公式：🌑🌑🌕🌑🌑',
        description: '當最後一列只有中間是亮燈「暗暗亮暗暗」時，這是最容易辨識的圖形之一。',
        initialToggles: [
          [0, 1], [0, 3], [1, 0], [1, 1], [1, 3], 
          [1, 4], [2, 1], [2, 3], [4, 1], [4, 3]
        ]
      },
      {
        id: '00011',
        title: '公式：🌑🌑🌑🌕🌕',
        description: '當最後一列右邊兩顆是亮燈「暗暗暗亮亮」時的處理方式。',
        initialToggles: [
          [0, 1], [1, 0], [1, 1], [1, 2], [2, 3], 
          [3, 0], [3, 1], [3, 3], [3, 4], [4, 3]
        ]
      },
      {
        id: '11000',
        title: '公式：🌕🌕🌑🌑🌑',
        description: '這是上一關的鏡像。當最後一列左邊兩顆是亮燈「亮亮暗暗暗」時的處理方式。',
        initialToggles: [
          [0, 3], [1, 2], [1, 3], [1, 4], [2, 1], 
          [3, 0], [3, 1], [3, 3], [3, 4], [4, 1]
        ]
      },
      {
        id: '10101',
        title: '公式：🌕🌑🌕🌑🌕',
        description: '當最後一列呈現梅花樁式的「亮暗亮暗亮」排列時，需要使用此公式。',
        initialToggles: [
          [0, 0], [0, 1], [0, 2], [1, 1], [1, 3], 
          [2, 2], [2, 3], [2, 4], [4, 2], [4, 3],
          [4, 4]
        ]
      },
      {
        id: '01110',
        title: '公式：🌑🌕🌕🌕🌑',
        description: '當最後一列中間三顆是亮燈「暗亮亮亮暗」時，這是最後一種常見的基本公式。',
        initialToggles: [
          [0, 0], [0, 2], [0, 3], [1, 0], [1, 4], 
          [2, 1], [2, 2], [2, 4], [4, 1], [4, 2],
          [4, 4]
        ]
      }
    ]
  }
];

export default function Tutorial() {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeLevelId, setActiveLevelId] = useState(TUTORIAL_CATEGORIES[0].levels[0].id);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [isWon, setIsWon] = useState(false);
  const [showFormula, setShowFormula] = useState(false); // 新增：控制是否顯示公式提示
  const [remainingToggles, setRemainingToggles] = useState<string[]>([]); // 新增：追蹤剩餘需要點擊的位置

  const allLevels = TUTORIAL_CATEGORIES.flatMap(c => c.levels);
  const currentLevel = allLevels.find(l => l.id === activeLevelId) || allLevels[0];

  const handleCategoryChange = (index: number) => {
    setActiveCategoryIndex(index);
    setActiveLevelId(TUTORIAL_CATEGORIES[index].levels[0].id);
  };

  const initLevelGrid = (level: TutorialLevel) => {
    let grid = createSolvedGrid();
    level.initialToggles.forEach(([r, c]) => {
      grid = toggleLights(grid, r, c);
    });
    return grid;
  };

  // 切換關卡或重置時執行
  useEffect(() => {
    setGrid(initLevelGrid(currentLevel));
    setIsWon(false);
    setShowFormula(false); // 切換關卡時重置提示狀態
    // 初始化剩餘點擊位置
    setRemainingToggles(currentLevel.initialToggles.map(([r, c]) => `${r},${c}`));
  }, [currentLevel]);

  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;
    
    const newGrid = toggleLights(grid, r, c);
    setGrid(newGrid);

    // 更新剩餘點擊位置
    const key = `${r},${c}`;
    setRemainingToggles(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });

    if (checkWin(newGrid)) {
      setIsWon(true);
    }
  };

  const resetLevel = () => {
    setGrid(initLevelGrid(currentLevel));
    setIsWon(false);
    setRemainingToggles(currentLevel.initialToggles.map(([r, c]) => `${r},${c}`));
  };

  if (grid.length === 0) return null;

  // 計算目前提示應該顯示在哪一列 (最小的列索引)
  const hintRow = remainingToggles.length > 0 
    ? Math.min(...remainingToggles.map(t => parseInt(t.split(',')[0]))) 
    : -1;

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl mx-auto animate-fade-in p-4">
      
      {/* Sidebar: Level Selection */}
      <div className="lg:w-1/3 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-zinc-100 px-2">教學模式</h2>
        
        {/* Category Tabs */}
        <div className="flex gap-2 px-1">
          {TUTORIAL_CATEGORIES.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryChange(index)}
              className={`
                px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200
                ${activeCategoryIndex === index
                  ? 'bg-zinc-100 text-zinc-900 shadow-md'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }
              `}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
          {TUTORIAL_CATEGORIES[activeCategoryIndex].levels.map((level) => (
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
        <div className="mt-auto bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 text-sm leading-relaxed text-zinc-300 relative">
          <div className="flex justify-between items-center mb-2">
            <div className="text-amber-500 font-bold uppercase tracking-wider text-xs">Mission</div>
            {/* 顯示公式按鈕：僅在常見公式類別顯示 */}
            {TUTORIAL_CATEGORIES[activeCategoryIndex].title === '常見公式' && (
              <button
                onClick={() => setShowFormula(!showFormula)}
                className={`
                  text-xs px-2 py-1 rounded border transition-colors
                  ${showFormula 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                  }
                `}
              >
                {showFormula ? '隱藏公式' : '顯示公式'}
              </button>
            )}
          </div>
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
                {row.map((isOn, cIndex) => {
                  // 判斷是否為公式提示位置：只顯示目前進度最上方的一列
                  const isHint = showFormula && rIndex === hintRow && remainingToggles.includes(`${rIndex},${cIndex}`);
                  
                  return (
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
                      
                      {/* 公式提示標記 */}
                      {isHint && (
                        <>
                          <span className="absolute inset-0 border-4 border-red-500/70 rounded-xl animate-pulse z-10 pointer-events-none" />
                          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full z-20 shadow-lg">!</span>
                        </>
                      )}
                    </button>
                  );
                })}
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
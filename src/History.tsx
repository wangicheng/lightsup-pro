import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { GameRecord } from './types';

interface HistoryProps {
  records: GameRecord[];
  onReplay: (grid: boolean[][]) => void;
  gridSize: number;
}

export default function History({ records, onReplay, gridSize }: HistoryProps) {
  const [visibleCount, setVisibleCount] = useState(20);

  // Filter records by current grid size
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // 兼容舊資料 (沒有 gridSize 屬性視為 5x5)
      const rSize = (r as any).gridSize || 5;
      return rSize === gridSize;
    });
  }, [records, gridSize]);

  const stats = useMemo(() => {
    if (filteredRecords.length === 0) return null;
    
    const totalGames = filteredRecords.length;
    const totalTime = filteredRecords.reduce((acc, r) => acc + r.timeSpent, 0);
    const avgTime = totalTime / totalGames;
    
    // 排序時間以計算分位數
    const times = filteredRecords.map(r => r.timeSpent).sort((a, b) => a - b);
    const bestTime = times[0];
    const maxTime = times[times.length - 1];
    
    // 離群值處理邏輯：
    // 1. 找出 P90 (第 90 百分位數)
    const p90Index = Math.floor(times.length * 0.9);
    const p90 = times[p90Index];
    
    // 2. 設定截斷點：P90 的 1.5 倍，或是最小值 + 60秒 (避免數據太集中時圖表太窄)
    // 如果最大值遠超這個點，我們就截斷圖表
    const outlierThreshold = p90 * 1.5;
    const hasOutliers = maxTime > outlierThreshold;
    
    // 決定圖表計算的有效最大值
    const effectiveMax = hasOutliers ? outlierThreshold : maxTime;
    
    // Dynamic Histogram Logic
    const range = effectiveMax - bestTime;
    let binSize = Math.ceil((range + 1) / 10); // 目標約 10 個區間

    // 對齊區間起始點
    const startBin = Math.floor(bestTime / binSize) * binSize;
    // 計算結束點
    const endBin = Math.ceil((effectiveMax + 1) / binSize) * binSize;
    
    const distribution = [];
    for (let current = startBin; current < endBin; current += binSize) {
      const next = current + binSize;
      // 計算落在區間內的數量 [current, next)
      const count = times.filter(t => t >= current && t < next).length;
      
      distribution.push({
        range: `${current}-${next}s`,
        count,
      });
    }

    // 如果有離群值，將剩餘所有數據合併到最後一欄
    if (hasOutliers) {
      const overflowCount = times.filter(t => t >= endBin).length;
      if (overflowCount > 0) {
        distribution.push({
          range: `>${endBin}s`,
          count: overflowCount,
        });
      }
    }

    return { totalGames, avgTime, bestTime, distribution };
  }, [filteredRecords]);

  const recentRecords = useMemo(() => filteredRecords.slice().reverse(), [filteredRecords]);
  const displayedRecords = recentRecords.slice(0, visibleCount);

  const formatTime = (seconds: number) => {
    const totalMs = Math.round(seconds * 1000);
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('zh-TW', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (filteredRecords.length === 0) {
    return (
      <div className="text-center text-zinc-500 mt-20 animate-fade-in">
        <p>尚無 {gridSize}x{gridSize} 的遊戲紀錄</p>
        <p className="text-sm mt-2">完成一局遊戲後將在此顯示紀錄</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in space-y-8 pb-12">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">總場數</div>
          <div className="text-2xl font-mono text-zinc-100">{stats?.totalGames}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">平均耗時</div>
          <div className="text-2xl font-mono text-zinc-100">{formatTime(stats?.avgTime || 0)}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl text-center">
          <div className="text-xs text-amber-500/80 uppercase tracking-wider font-bold mb-1">最快紀錄</div>
          <div className="text-2xl font-mono text-amber-400">{formatTime(stats?.bestTime || 0)}</div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6">耗時分布</h3>
        <div className="h-64 w-full">
          {stats && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="range" 
                  stroke="#71717a" 
                  tick={{ fill: '#71717a', fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#71717a" 
                  tick={{ fill: '#71717a', fontSize: 10 }} 
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#27272a', 
                    borderRadius: '0.5rem',
                    color: '#f4f4f5',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#fbbf24" fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider px-2">
          近期紀錄 ({gridSize}x{gridSize})
        </h3>
        <div className="grid gap-3">
          {displayedRecords.map((record) => (
            <div key={record.id} className="group bg-zinc-900/80 border border-zinc-800/50 p-4 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-colors">
              
              <div className="flex items-center gap-6">
                {/* Mini Grid Preview */}
                <div 
                  className="grid gap-px w-10 h-10 bg-zinc-800 rounded overflow-hidden border border-zinc-800"
                  style={{ gridTemplateColumns: `repeat(${record.initialGrid.length}, 1fr)` }}
                >
                  {record.initialGrid.map((row, r) => 
                    row.map((isOn, c) => (
                      <div key={`${r}-${c}`} className={`${isOn ? 'bg-amber-500' : 'bg-zinc-700/50'}`} />
                    ))
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className="text-zinc-300 font-mono font-medium text-lg">
                    {formatTime(record.timeSpent)}
                  </span>
                  <span className="text-zinc-600 text-xs">
                    {formatDate(record.timestamp)}
                  </span>
                </div>
              </div>

              <div className="relative w-28 flex justify-end items-center">
                <div className="flex flex-col items-end transition-opacity duration-200 group-hover:opacity-0">
                  <span className="text-zinc-400 text-sm font-medium">
                    {record.moves} <span className="text-xs text-zinc-600 uppercase">Moves</span>
                  </span>
                </div>
                
                <button
                  onClick={() => onReplay(record.initialGrid)}
                  className="absolute right-0 opacity-0 group-hover:opacity-100 transition-all duration-200 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg uppercase tracking-wide shadow-lg transform scale-95 group-hover:scale-100"
                  title="重玩此局 (不計入紀錄)"
                >
                  Replay
                </button>
              </div>

            </div>
          ))}
        </div>

        {visibleCount < filteredRecords.length && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setVisibleCount(prev => prev + 20)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm font-medium rounded-lg transition-colors"
            >
              載入更多 ({filteredRecords.length - visibleCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 產生一個全亮的盤面 (目標狀態)
export const createSolvedGrid = (size: number = 5): boolean[][] => {
  return Array(size).fill(null).map(() => Array(size).fill(true));
};

// 切換燈的邏輯
export const toggleLights = (grid: boolean[][], row: number, col: number): boolean[][] => {
  const size = grid.length;
  // 深拷貝 grid 以避免直接修改 state
  const newGrid = grid.map(r => [...r]);

  // 定義自己與周圍四個方向的座標偏移
  const directions = [
    [0, 0],   // 自己
    [-1, 0],  // 上
    [1, 0],   // 下
    [0, -1],  // 左
    [0, 1]    // 右
  ];

  directions.forEach(([dr, dc]) => {
    const r = row + dr;
    const c = col + dc;
    // 檢查邊界
    if (r >= 0 && r < size && c >= 0 && c < size) {
      newGrid[r][c] = !newGrid[r][c];
    }
  });

  return newGrid;
};

// 產生隨機題目 (從全亮狀態隨機點擊數次)
export const generateRandomLevel = (size: number = 5, difficulty: number = 10): boolean[][] => {
  let grid = createSolvedGrid(size);
  for (let i = 0; i < difficulty; i++) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    grid = toggleLights(grid, r, c);
  }

  // 確保不會剛好生成已完成的狀態
  // 如果剛好是完成狀態，再隨機點擊一次
  if (checkWin(grid)) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    grid = toggleLights(grid, r, c);
  }

  return grid;
};

// 檢查是否勝利
export const checkWin = (grid: boolean[][]): boolean => {
  return grid.every(row => row.every(cell => cell === true));
};
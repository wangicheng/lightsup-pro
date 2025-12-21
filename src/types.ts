export interface GameRecord {
  id: string;
  timestamp: number;
  timeSpent: number;
  moves: number;
  initialGrid: boolean[][];
}

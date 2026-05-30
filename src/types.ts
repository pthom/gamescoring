export type WinnerRule = "highest" | "lowest";

export interface Player {
  id: string;
  name: string;
}

export interface Round {
  id: string;
  /** playerId -> points for this round; null means "not entered" (counts as 0). */
  scores: Record<string, number | null>;
}

export interface Game {
  id: string;
  name: string;
  winnerRule: WinnerRule;
  players: Player[];
  rounds: Round[];
  createdAt: number;
  updatedAt: number;
  finished: boolean;
}

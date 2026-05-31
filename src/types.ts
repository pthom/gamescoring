export type WinnerRule = "highest" | "lowest";

/** Whether this device may edit the game ("keeper") or only watch ("viewer").
 *  Single-writer by convention — see Spec "Share". */
export type Role = "keeper" | "viewer";

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
  /** Free-form note for the whole game (house rules, context, etc.). */
  notes: string;
  /** This device's role for this game. */
  role: Role;
  /** Monotonic edit counter, bumped on each keeper edit; decides which shared
   *  copy is "newer" when a link is opened. */
  version: number;
  createdAt: number;
  updatedAt: number;
  finished: boolean;
}

import type { WinnerRule } from "./types";

/** Minimal structural shape needed to compute scores — satisfied by both
 *  the editable Game and a read-only SharedGame. */
export interface Scorable {
  players: { id: string }[];
  rounds: { scores: Record<string, number | null> }[];
  winnerRule: WinnerRule;
}

/** Sum of a player's round values; null entries count as 0. */
export function playerTotal(game: Scorable, playerId: string): number {
  return game.rounds.reduce((sum, round) => {
    const v = round.scores[playerId];
    return sum + (v ?? 0);
  }, 0);
}

export function allTotals(game: Scorable): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const p of game.players) totals[p.id] = playerTotal(game, p.id);
  return totals;
}

/**
 * Returns the set of player ids currently leading per the winner rule.
 * Empty until at least one score has been entered. Ties return multiple ids.
 */
export function leaderIds(game: Scorable): Set<string> {
  const leaders = new Set<string>();
  if (game.players.length === 0) return leaders;

  const anyScore = game.rounds.some((r) =>
    game.players.some((p) => r.scores[p.id] != null)
  );
  if (!anyScore) return leaders;

  const totals = allTotals(game);
  const values = game.players.map((p) => totals[p.id]);
  const best =
    game.winnerRule === "highest" ? Math.max(...values) : Math.min(...values);

  for (const p of game.players) {
    if (totals[p.id] === best) leaders.add(p.id);
  }
  return leaders;
}

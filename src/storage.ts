import type { Game, Player, WinnerRule } from "./types";

const GAMES_KEY = "gamescoring.games";
const CURRENT_KEY = "gamescoring.currentId";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(GAMES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Game[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGames(games: Game[]): void {
  try {
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  } catch {
    // Storage full or unavailable — game still works in memory this session.
  }
}

export function loadCurrentId(): string | null {
  return localStorage.getItem(CURRENT_KEY);
}

export function saveCurrentId(id: string | null): void {
  if (id) localStorage.setItem(CURRENT_KEY, id);
  else localStorage.removeItem(CURRENT_KEY);
}

export function createGame(
  name: string,
  winnerRule: WinnerRule,
  playerNames: string[]
): Game {
  const now = Date.now();
  const players: Player[] = playerNames.map((n, i) => ({
    id: uid(),
    name: n.trim() || `Player ${i + 1}`,
  }));
  return {
    id: uid(),
    name: name.trim(),
    winnerRule,
    players,
    rounds: [],
    createdAt: now,
    updatedAt: now,
    finished: false,
  };
}

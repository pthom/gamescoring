import type { Game, WinnerRule } from "./types";

/** A decoded, read-only game reconstructed from a share link. */
export interface SharedGame {
  name: string;
  winnerRule: WinnerRule;
  players: { id: string; name: string }[];
  rounds: { id: string; scores: Record<string, number | null> }[];
  sharedAt: number | null;
}

/** Compact wire format — no UUIDs, scores as a rounds×players matrix. */
interface Payload {
  v: 1;
  n: string;
  r: "h" | "l";
  p: string[];
  s: (number | null)[][];
  t: number;
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function encodeGame(game: Game): string {
  const payload: Payload = {
    v: 1,
    n: game.name,
    r: game.winnerRule === "lowest" ? "l" : "h",
    p: game.players.map((p) => p.name),
    s: game.rounds.map((round) =>
      game.players.map((p) => round.scores[p.id] ?? null)
    ),
    t: Date.now(),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  return bytesToB64url(bytes);
}

export function decodeShare(code: string): SharedGame | null {
  try {
    const json = new TextDecoder().decode(b64urlToBytes(code));
    const p = JSON.parse(json) as Payload;
    if (p.v !== 1 || !Array.isArray(p.p) || !Array.isArray(p.s)) return null;

    const players = p.p.map((name, i) => ({ id: `p${i}`, name }));
    const rounds = p.s.map((row, ri) => {
      const scores: Record<string, number | null> = {};
      players.forEach((pl, i) => {
        scores[pl.id] = typeof row[i] === "number" ? row[i] : null;
      });
      return { id: `r${ri}`, scores };
    });

    return {
      name: typeof p.n === "string" ? p.n : "",
      winnerRule: p.r === "l" ? "lowest" : "highest",
      players,
      rounds,
      sharedAt: typeof p.t === "number" ? p.t : null,
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(game: Game): string {
  return `${location.origin}${location.pathname}#g=${encodeGame(game)}`;
}

/** Read a shared game from the current URL hash, if present. */
export function readShareFromLocation(): SharedGame | null {
  const m = location.hash.match(/[#&]g=([^&]+)/);
  return m ? decodeShare(m[1]) : null;
}

import LZString from "lz-string";
import type { Game, WinnerRule } from "./types";

/** Target ceiling for the whole share URL (chars ≈ bytes; the code is ASCII).
 *  Keeps the QR comfortably scannable; the note is trimmed to fit within it. */
export const MAX_SHARE_URL = 800;

/** A decoded, read-only game reconstructed from a share link. */
export interface SharedGame {
  name: string;
  winnerRule: WinnerRule;
  players: { id: string; name: string }[];
  rounds: { id: string; scores: Record<string, number | null> }[];
  notes: string;
  sharedAt: number | null;
}

/** Compact wire format — no UUIDs, scores as a rounds×players matrix. */
interface Payload {
  v: 1;
  n: string;
  r: "h" | "l";
  p: string[];
  s: (number | null)[][];
  c?: string; // game note (length fitted to the URL budget)
  t: number;
}

function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function truncate(note: string, k: number): string {
  if (k >= note.length) return note;
  if (k <= 0) return "";
  return note.slice(0, k).trimEnd() + "…";
}

/** Encode a game (with an explicit note) to a compressed, URL-safe code. */
export function encodeGame(game: Game, note: string = game.notes ?? ""): string {
  const payload: Payload = {
    v: 1,
    n: game.name,
    r: game.winnerRule === "lowest" ? "l" : "h",
    p: game.players.map((p) => p.name),
    s: game.rounds.map((round) =>
      game.players.map((p) => round.scores[p.id] ?? null)
    ),
    ...(note ? { c: note } : {}),
    t: Date.now(),
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

/** Largest prefix of the note whose encoded game still fits `codeBudget`.
 *  Binary search re-encodes each candidate, so it accounts for compression. */
function fitNote(game: Game, fullNote: string, codeBudget: number): string {
  if (!fullNote) return "";
  if (encodeGame(game, fullNote).length <= codeBudget) return fullNote;
  if (encodeGame(game, "").length >= codeBudget) return ""; // scores alone over budget
  let lo = 0;
  let hi = fullNote.length;
  let best = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (encodeGame(game, truncate(fullNote, mid)).length <= codeBudget) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return truncate(fullNote, best);
}

export function buildShareUrl(game: Game): string {
  const base = `${location.origin}${location.pathname}#g=`;
  const note = fitNote(game, (game.notes ?? "").trim(), MAX_SHARE_URL - base.length);
  return base + encodeGame(game, note);
}

function tryParse(json: string | null): Payload | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as Payload;
  } catch {
    return null;
  }
}

export function decodeShare(code: string): SharedGame | null {
  // New links are lz-string compressed; fall back to the legacy base64 format.
  let p = tryParse(LZString.decompressFromEncodedURIComponent(code));
  if (!p) {
    try {
      p = tryParse(new TextDecoder().decode(b64urlToBytes(code)));
    } catch {
      p = null;
    }
  }
  if (!p || p.v !== 1 || !Array.isArray(p.p) || !Array.isArray(p.s)) return null;

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
    notes: typeof p.c === "string" ? p.c : "",
    sharedAt: typeof p.t === "number" ? p.t : null,
  };
}

/** Read a shared game from the current URL hash, if present. */
export function readShareFromLocation(): SharedGame | null {
  const m = location.hash.match(/[#&]g=([^&]+)/);
  return m ? decodeShare(m[1]) : null;
}

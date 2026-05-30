# GameScoring — Spec

A simple mobile-friendly web app for keeping score when playing Scrabble or
card games with friends. No accounts, no server — open it on your phone and
start a game.

## Goals

- Track scores for 2+ players across multiple rounds.
- Add points per round; see running totals update live.
- Work on iOS and Android via the browser; installable to the home screen.
- Survive refreshes and closing the tab — pick up an in-progress game later.
- Fast to use mid-game: big tap targets, number entry, minimal friction.

## Non-goals (for now)

- No user accounts or login.
- No cloud sync / shared real-time scoreboards across devices.
- No game-specific rules engine (no Scrabble dictionary, no card logic).
  The app just tracks numbers; players decide what the numbers mean.

## Core concepts

- **Game** — one play session. Has a name/type (optional), a winner rule,
  a list of players, and a list of rounds.
- **Player** — a name and a position (column). 2+ per game.
- **Round** — one row of scores: one value per player (may be blank/0).
- **Total** — sum of a player's round values. Updates live.
- **Winner rule** — `highest wins` (e.g. Scrabble) or `lowest wins`
  (e.g. Golf, Hearts). Chosen per game; drives leader highlighting.

## MVP features

### Start a game
- Optional game name (e.g. "Scrabble", "Rummy", free text).
- Choose winner rule: highest-wins (default) or lowest-wins.
- Enter player names; add/remove rows; reorder. Minimum 2 players.

### Play / scoreboard
- Grid: one column per player, one row per round, a **Totals** row at the top
  or bottom (always visible).
- "Add round" appends a new row; enter each player's points (numeric keypad).
- Negative numbers allowed (some card games subtract).
- Blank entries count as 0.
- Edit any past cell to fix a mistake — totals recompute.
- Delete a round (with confirm).
- Leader highlighted per the winner rule; ties shown as tied.
- Horizontal scroll if there are many players; player names stay readable.

### Game management
- **Save** automatically and continuously to the device (localStorage).
- Resume the in-progress game on reopen.
- **New game** (with confirm if a game is in progress).
- Optional: a list of past/finished games to revisit or delete.

## Screens

1. **Home** — resume current game, or start a new one; (later) list past games.
2. **New game** — name, winner rule, players.
3. **Scoreboard** — the grid; add round, edit cells, see totals & leader.

## Data model (localStorage)

```
Game {
  id: string
  name: string                 // optional, e.g. "Scrabble"
  winnerRule: "highest" | "lowest"
  players: { id, name }[]
  rounds: { id, scores: { [playerId]: number | null } }[]
  createdAt, updatedAt
}
```

Store the current game under a known key; keep a list of saved games.

## Tech

- **PWA**: single-page web app + manifest + service worker so it can be
  installed ("Add to Home Screen") and run offline.
- Responsive, mobile-first layout; touch-friendly controls; numeric inputs.
- Suggested stack: a lightweight SPA framework (e.g. React or Svelte) with
  Vite. No backend required.

## Possible future enhancements

- Cloud sync / shared scoreboard so each friend watches on their own phone.
- Per-game templates and presets (default player lists, scoring shortcuts).
- Round timer, dealer/turn tracker.
- Stats & history across games (win counts, averages).
- Export/share a finished game (image or link).
- Undo/redo for edits.

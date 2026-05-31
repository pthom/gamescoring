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
- "Add round" appends a new row (auto-focused) and enters each player's points
  (numeric keypad).
- Negative numbers allowed (some card games subtract); a **±** button on the
  focused cell flips its sign without dismissing the keypad.
- Blank entries count as 0.
- Edit any past cell to fix a mistake — totals recompute.
- Delete a round (with confirm).
- Rename a player by tapping their name in the header.
- Leader highlighted per the winner rule; ties shown as tied.
- Header row and round-number column stay pinned; horizontal scroll if there
  are many players.
- Optional free-form **note** per game (house rules / context).

### Game management
- **Save** automatically and continuously to the device (localStorage).
- Resume the in-progress game on reopen.
- **New game** (with confirm if a game is in progress).
- A list of past games to revisit or delete; most recently edited first, each
  showing players, round count, relative "edited" time, and a "view only" tag
  for shared copies.
- **Rename** a game by tapping its title (and a player by tapping their name).
- **End game** — locks the game read-only and shows full **ranked standings**
  (🥇/🥈/🥉 then numbers; ties share a rank). **Continue** reopens it for
  editing; **Rematch** starts a fresh game with the same players and winner rule.
- **Copy to a new game** — duplicate any game into a fresh, independent editable
  game ("… (copy)"); the main use is turning a view-only shared copy into one
  you keep.
- A **"new version available" prompt** offers a one-tap reload when a new build
  is deployed (the service worker uses prompt mode, not silent auto-update).

### Turn stopwatch — shipped
- An **optional**, hideable mm:ss stopwatch (start / pause / reset) for timing a
  turn. Off by default; toggled from the menu, preference remembered.
- Fully manual and **not** part of the saved game — it's a scratch timer and
  resets on reload. Not tied to players or rounds.

### Share (view-only) + copy — shipped
- Links are **always view-only**. **Share read-only link** lz-string-compresses
  the game state (id, version, scores, note, finished) into the URL hash
  (`#g=…`) — no backend, the data rides in the link itself.
- A share dialog shows a **QR code** (so a friend can scan it at the table) plus
  copy / native-share buttons. The note length is **fitted to an ~800-byte URL
  budget** (`MAX_SHARE_URL`): scores are encoded first, the note gets the
  remainder (binary search over the compressed size); past the budget the QR is
  hidden and the link offered. The full note stays on-device.
- Opening a link **saves a view-only copy** into the recipient's games list
  (matched by game **id**) and shows it read-only, with a "view only" tag.
- **Updates by re-sharing**: opening a newer link (higher **version**) for a
  game you already hold refreshes your view-only copy. A stale/older link is
  ignored; a game you keep yourself is never overwritten.
- **No in-place handoff** (it was too fragile without a server). To take over
  scoring or fix a mistake, **Copy to a new game** forks the view-only copy
  into your own independent editable game. Watchers don't auto-follow a fork —
  the new keeper shares fresh links. See "Deferred" below.

## Screens

1. **Home** — resume current game, start a new one, or reopen/delete past games.
2. **New game** — name, winner rule, players.
3. **Scoreboard** — the grid; add round, edit cells, see totals & leader;
   share, end/continue, stopwatch. Shared (view-only) copies open here too,
   read-only, with a "Copy to a new game" action.

## Data model (localStorage)

```
Game {
  id: string
  name: string                 // optional, e.g. "Scrabble"
  winnerRule: "highest" | "lowest"
  players: { id, name }[]
  rounds: { id, scores: { [playerId]: number | null } }[]
  notes: string                // free-form per-game note
  role: "keeper" | "viewer"    // editable, or a view-only shared copy
  version: number              // bumped on each edit; decides "newer" link
  finished: boolean            // ended -> read-only
  createdAt, updatedAt
}
```

A share link encodes a compact copy of one game (id, version, name, rule,
player names, a rounds×players score matrix, a budget-fitted note, finished),
lz-string-compressed into the URL hash; it is not stored server-side. Opening
it saves a `viewer` copy keyed by `id`; re-opening a higher-`version` link
refreshes it.

Store the current game under a known key; keep a list of saved games.

## Tech

- **PWA**: single-page web app + manifest + service worker so it can be
  installed ("Add to Home Screen") and run offline.
- Responsive, mobile-first layout; touch-friendly controls; numeric inputs.
- Suggested stack: a lightweight SPA framework (e.g. React or Svelte) with
  Vite. No backend required.

## Possible future enhancements

- Per-game templates and presets (default player lists, scoring shortcuts).
- Per-round date + duration (parked — needs a clear definition of "duration"
  and a layout that doesn't clutter the grid on mobile).
- Dealer / turn tracker (active-player concept); a per-player chess clock.
- Stats & history across games (win counts, averages).
- Undo/redo for edits.

## Deferred / out of scope (and why)

- **Real-time multi-device editing** (each friend edits the same game live from
  their own phone). Deliberately **not built**. The core use is *in-person*
  play, where one scorekeeper with one phone is the norm; full sync would add a
  backend, accounts, a privacy shift (data leaving the device), and
  offline-reconciliation complexity — high permanent cost for a small,
  occasional benefit. The **view-only share link + QR + copy** (above) covers
  the likely real wants ("let everyone watch" and "let someone else take over")
  at a fraction of the cost, with no backend.
- **Link-based handoff of a live game** (move the score-keeper role between
  devices for the *same* game id). This was prototyped and **removed** — without
  a server you can't enforce a single writer, so it diverged in confusing,
  hard-to-diagnose ways. Replaced by the simpler rule: links are view-only, and
  taking over means **forking a copy** (a new game id). Revisit only if true
  shared *editing* becomes a felt need; a realtime BaaS (Supabase / Firebase)
  would be the honest path then.

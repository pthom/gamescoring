# Score Sheet ♪

A simple, mobile-friendly web app for keeping score when playing **Scrabble**
or **card games** with friends — a *score sheet* in both senses. No accounts,
no setup; open it on your phone and start a game.

### 🎲 Live app: **https://gamescoring.vercel.app**

Open it on your phone and "Add to Home Screen" to install it like a native app
(it's a PWA, so it works offline once installed).

- **iOS (Safari):** Share → Add to Home Screen
- **Android (Chrome):** ⋮ menu → Install app

## Features

- **Any number of players** — one column each, with live running totals.
  The header row and round-number column stay pinned as you scroll.
- **Round-based scoring** — a grid of rounds × players; works for Scrabble
  turns and card-game hands alike.
- **Configurable winner rule** — highest-wins (Scrabble) or lowest-wins
  (Golf, Hearts…); the current leader is highlighted with a ♛.
- **Edit anything** — fix a mistyped cell, delete a round (with confirm);
  totals recompute instantly. Negative numbers allowed; blank counts as 0.
- **Negative scores made easy** — a ± button on the focused cell flips its
  sign without dismissing the numeric keypad (e.g. tarot).
- **Rename players** — tap a player's name in the header to fix or change it.
- **End game & rematch** — end a game to see full **ranked standings**
  (🥇/🥈/🥉, ties shared); *Continue* to reopen, or *Rematch* to start fresh
  with the same players and rule.
- **Per-game note** — a free-form note (house rules, context) attached to a
  game.
- **Share read-only** — generate a link (with a **QR code**) that opens a
  read-only snapshot of the scores (and the note) on anyone's phone. No
  backend — the game state rides in the link itself, lz-string-compressed,
  with the note length fitted to keep the QR scannable.
- **Optional turn stopwatch** — a hideable mm:ss timer for timing a turn.
- **Auto-saved** — games persist in the browser (localStorage) and resume
  where you left off, even after closing the tab.
- **Installable PWA** — add to your home screen; works offline; an in-app
  prompt offers to reload when a new version is deployed.

No backend, no login, no data leaves your device (a share link carries only
that one game's scores, and only when you choose to share it).

## Tech stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for builds and dev server
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) for the manifest +
  service worker
- [qrcode.react](https://github.com/zpao/qrcode.react) for share QR codes
- [lz-string](https://github.com/pieroxy/lz-string) to compress the game
  state carried in share links
- [@resvg/resvg-js](https://github.com/yisibl/resvg-js) to rasterize the SVG
  icon into PNGs (build-time only)
- Deployed on [Vercel](https://vercel.com)

## Run locally

```bash
npm install
npm run dev            # dev server at http://localhost:5173
npm run dev -- --host  # also expose on your local network (for phones)
```

## Build & deploy

```bash
npm run build        # type-check + production build into dist/
npm run preview      # preview the production build locally
npm run icons        # regenerate PNG app icons from the SVGs in public/
npx vercel --prod    # deploy to production (Vercel)
```

## Project structure

```
src/
  types.ts             # Game / Player / Round models
  storage.ts           # localStorage persistence + game creation
  scoring.ts           # totals & leader computation (structural)
  share.ts             # compress/encode game state to/from a share link
  format.ts            # relative-time formatting
  App.tsx              # view routing + state
  components/
    Home.tsx           # resume / new game / saved games
    NewGame.tsx        # name, winner rule, players
    Scoreboard.tsx     # the scoring grid + menu/actions
    ScoreGrid.tsx      # presentational grid (editable & read-only)
    ShareDialog.tsx    # QR code + copy / native share
    SharedView.tsx     # read-only snapshot from a share link
    Stopwatch.tsx      # optional turn timer
    NotesDialog.tsx    # per-game free-form note editor
    UpdatePrompt.tsx   # "new version available" reload toast
  styles.css
scripts/
  gen-icons.mjs        # SVG -> PNG icon generation
public/                # PWA icons (SVG sources + generated PNGs)
```

See [Spec.md](Spec.md) for the full design notes.

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
- **Round-based scoring** — a grid of rounds × players; works for Scrabble
  turns and card-game hands alike.
- **Configurable winner rule** — highest-wins (Scrabble) or lowest-wins
  (Golf, Hearts…); the current leader is highlighted with a ♛.
- **Edit anything** — fix a mistyped cell, delete a round; totals recompute
  instantly. Negative numbers allowed; blank counts as 0.
- **Auto-saved** — games persist in the browser (localStorage) and resume
  where you left off, even after closing the tab.
- **Installable PWA** — add to your home screen; works offline.

No backend, no login, no data leaves your device.

## Tech stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for builds and dev server
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) for the manifest +
  service worker
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
npx vercel --prod    # deploy to production (Vercel)
```

## Project structure

```
src/
  types.ts             # Game / Player / Round models
  storage.ts           # localStorage persistence + game creation
  scoring.ts           # totals & leader computation
  App.tsx              # view routing + state
  components/
    Home.tsx           # resume / new game / saved games
    NewGame.tsx        # name, winner rule, players
    Scoreboard.tsx     # the scoring grid
  styles.css
public/                # PWA icons
```

See [Spec.md](Spec.md) for the full design notes.

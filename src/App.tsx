import { useEffect, useRef, useState } from "react";
import type { Game } from "./types";
import {
  createGame,
  loadCurrentId,
  loadGames,
  saveCurrentId,
  saveGames,
  uid,
} from "./storage";
import { Home } from "./components/Home";
import { NewGame } from "./components/NewGame";
import { Scoreboard } from "./components/Scoreboard";
import {
  readShareFromLocation,
  sharedToGame,
  type SharedGame,
} from "./share";

type View = { name: "home" } | { name: "new" } | { name: "play"; id: string };

function clearShareHash() {
  history.replaceState(null, "", location.pathname + location.search);
}

export default function App() {
  const [games, setGames] = useState<Game[]>(() => loadGames());
  const [currentId, setCurrentId] = useState<string | null>(() =>
    loadCurrentId()
  );
  const [view, setView] = useState<View>(() =>
    loadCurrentId() ? { name: "play", id: loadCurrentId()! } : { name: "home" }
  );

  // Always-fresh games for reconciliation from event handlers.
  const gamesRef = useRef(games);
  gamesRef.current = games;

  useEffect(() => saveGames(games), [games]);
  useEffect(() => saveCurrentId(currentId), [currentId]);

  /** Save a game as-is (no version bump) — create / import / role change. */
  function putGame(g: Game) {
    const saved = { ...g, updatedAt: Date.now() };
    setGames((prev) => {
      const i = prev.findIndex((x) => x.id === saved.id);
      if (i === -1) return [saved, ...prev];
      const next = [...prev];
      next[i] = saved;
      return next;
    });
  }

  /** Keeper content edit — bumps the version so re-shares read as newer. */
  function editGame(g: Game) {
    putGame({ ...g, version: g.version + 1 });
  }

  function handleStart(
    name: string,
    rule: Game["winnerRule"],
    players: string[]
  ) {
    const game = createGame(name, rule, players);
    putGame(game);
    setCurrentId(game.id);
    setView({ name: "play", id: game.id });
  }

  function handleDelete(id: string) {
    setGames((prev) => prev.filter((g) => g.id !== id));
    if (currentId === id) setCurrentId(null);
    setView({ name: "home" });
  }

  function openGame(id: string) {
    setCurrentId(id);
    setView({ name: "play", id });
  }

  function handleRematch(from: Game) {
    const fresh = createGame(
      from.name,
      from.winnerRule,
      from.players.map((p) => p.name)
    );
    putGame(fresh);
    setCurrentId(fresh.id);
    setView({ name: "play", id: fresh.id });
  }

  /** Fork a game into a brand-new, independent editable game (a "copy"). */
  function forkGame(from: Game) {
    const now = Date.now();
    const fresh: Game = {
      id: uid(),
      name: `${from.name || "Game"} (copy)`,
      winnerRule: from.winnerRule,
      players: from.players.map((p) => ({ ...p })),
      rounds: from.rounds.map((r) => ({ id: uid(), scores: { ...r.scores } })),
      notes: from.notes,
      role: "keeper",
      version: 1,
      createdAt: now,
      updatedAt: now,
      finished: false,
    };
    putGame(fresh);
    setCurrentId(fresh.id);
    setView({ name: "play", id: fresh.id });
  }

  /** Reconcile an opened (view-only) share link into the local database.
   *  Links are always view-only; a viewer copy refreshes only to a newer
   *  version. A game you keep (your own id) just opens — never overwritten. */
  function receiveShared(shared: SharedGame) {
    const existing = gamesRef.current.find((g) => g.id === shared.id);
    if (!existing) {
      putGame(sharedToGame(shared, "viewer"));
    } else if (existing.role === "viewer" && shared.version > existing.version) {
      putGame(sharedToGame(shared, "viewer", existing));
    }
    setCurrentId(shared.id);
    setView({ name: "play", id: shared.id });
    clearShareHash();
  }

  // Process a share link on first load and whenever the hash changes (a scanned
  // link can land on an already-open tab/PWA without a reload).
  const receiveRef = useRef(receiveShared);
  receiveRef.current = receiveShared;
  useEffect(() => {
    const handle = () => {
      const s = readShareFromLocation();
      if (s) receiveRef.current(s);
    };
    handle();
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, []);

  if (view.name === "new") {
    return (
      <NewGame onStart={handleStart} onCancel={() => setView({ name: "home" })} />
    );
  }

  if (view.name === "play") {
    const game = games.find((g) => g.id === view.id);
    if (game) {
      return (
        <Scoreboard
          game={game}
          onChange={editGame}
          onDelete={() => handleDelete(game.id)}
          onHome={() => setView({ name: "home" })}
          onRematch={() => handleRematch(game)}
          onFork={() => forkGame(game)}
        />
      );
    }
  }

  return (
    <Home
      games={games}
      currentId={currentId}
      onNew={() => setView({ name: "new" })}
      onOpen={openGame}
      onDelete={handleDelete}
    />
  );
}

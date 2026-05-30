import { useEffect, useState } from "react";
import type { Game } from "./types";
import {
  createGame,
  loadCurrentId,
  loadGames,
  saveCurrentId,
  saveGames,
} from "./storage";
import { Home } from "./components/Home";
import { NewGame } from "./components/NewGame";
import { Scoreboard } from "./components/Scoreboard";
import { SharedView } from "./components/SharedView";
import { readShareFromLocation, type SharedGame } from "./share";

type View = { name: "home" } | { name: "new" } | { name: "play"; id: string };

export default function App() {
  const [games, setGames] = useState<Game[]>(() => loadGames());
  const [currentId, setCurrentId] = useState<string | null>(() =>
    loadCurrentId()
  );
  const [shared, setShared] = useState<SharedGame | null>(() =>
    readShareFromLocation()
  );
  const [view, setView] = useState<View>(() =>
    loadCurrentId() ? { name: "play", id: loadCurrentId()! } : { name: "home" }
  );

  useEffect(() => saveGames(games), [games]);
  useEffect(() => saveCurrentId(currentId), [currentId]);

  function upsertGame(updated: Game) {
    updated.updatedAt = Date.now();
    setGames((prev) => {
      const i = prev.findIndex((g) => g.id === updated.id);
      if (i === -1) return [updated, ...prev];
      const next = [...prev];
      next[i] = updated;
      return next;
    });
  }

  function handleStart(
    name: string,
    rule: Game["winnerRule"],
    players: string[]
  ) {
    const game = createGame(name, rule, players);
    upsertGame(game);
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

  if (shared) {
    return (
      <SharedView
        game={shared}
        onExit={() => {
          history.replaceState(null, "", location.pathname + location.search);
          setShared(null);
          setView({ name: "home" });
        }}
      />
    );
  }

  if (view.name === "new") {
    return <NewGame onStart={handleStart} onCancel={() => setView({ name: "home" })} />;
  }

  if (view.name === "play") {
    const game = games.find((g) => g.id === view.id);
    if (!game) return <Home games={games} onNew={() => setView({ name: "new" })} onOpen={openGame} onDelete={handleDelete} />;
    return (
      <Scoreboard
        game={game}
        onChange={upsertGame}
        onDelete={() => handleDelete(game.id)}
        onHome={() => setView({ name: "home" })}
      />
    );
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

import type { Game } from "../types";
import { allTotals } from "../scoring";

interface Props {
  games: Game[];
  currentId?: string | null;
  onNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

function summary(game: Game): string {
  const names = game.players.map((p) => p.name).join(", ");
  const rounds = game.rounds.length;
  return `${names} · ${rounds} round${rounds === 1 ? "" : "s"}`;
}

function topScore(game: Game): string {
  const totals = allTotals(game);
  const entries = game.players.map((p) => `${p.name} ${totals[p.id]}`);
  return entries.join("  ·  ");
}

export function Home({ games, currentId, onNew, onOpen, onDelete }: Props) {
  const current = currentId ? games.find((g) => g.id === currentId) : undefined;
  const others = games
    .filter((g) => g.id !== current?.id)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="screen">
      <header className="app-header">
        <h1>GameScoring</h1>
        <p className="tagline">Scores for Scrabble &amp; card games</p>
      </header>

      {current && (
        <button className="resume-card" onClick={() => onOpen(current.id)}>
          <div className="resume-label">Resume game</div>
          <div className="resume-title">{current.name || "Untitled game"}</div>
          <div className="resume-sub">{summary(current)}</div>
          <div className="resume-scores">{topScore(current)}</div>
        </button>
      )}

      <button className="btn btn-primary btn-block" onClick={onNew}>
        + New game
      </button>

      {others.length > 0 && (
        <section className="saved">
          <h2>Saved games</h2>
          <ul className="game-list">
            {others.map((g) => (
              <li key={g.id} className="game-row">
                <button className="game-open" onClick={() => onOpen(g.id)}>
                  <span className="game-name">{g.name || "Untitled game"}</span>
                  <span className="game-meta">{summary(g)}</span>
                </button>
                <button
                  className="icon-btn danger"
                  aria-label="Delete game"
                  onClick={() => {
                    if (confirm(`Delete "${g.name || "Untitled game"}"?`))
                      onDelete(g.id);
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

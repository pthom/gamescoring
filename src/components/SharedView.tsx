import type { SharedGame } from "../share";
import { allTotals, leaderIds } from "../scoring";
import { ScoreGrid } from "./ScoreGrid";

interface Props {
  game: SharedGame;
  onExit: () => void;
}

function sharedWhen(ts: number | null): string {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

export function SharedView({ game, onExit }: Props) {
  const totals = allTotals(game);
  const leaders = leaderIds(game);
  const when = sharedWhen(game.sharedAt);

  return (
    <div className="screen play">
      <header className="bar">
        <span className="badge">read-only</span>
        <h1 className="bar-title">{game.name || "Shared game"}</h1>
        <span className="bar-spacer" />
      </header>

      <div className="snapshot-note">
        📸 Snapshot{when ? ` from ${when}` : ""} — scores won't update live.
        Ask for a fresh link to see the latest.
      </div>

      {game.notes && <div className="shared-note">📝 {game.notes}</div>}

      <div className="grid-wrap">
        <ScoreGrid
          players={game.players}
          rounds={game.rounds}
          totals={totals}
          leaders={leaders}
        />
        {game.rounds.length === 0 && (
          <p className="empty">No rounds played yet.</p>
        )}
      </div>

      <div className="play-actions">
        <button className="btn btn-ghost btn-block" onClick={onExit}>
          Open Score Sheet ♪
        </button>
      </div>
    </div>
  );
}

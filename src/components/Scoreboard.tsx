import { useState } from "react";
import type { Game, Round } from "../types";
import { allTotals, leaderIds } from "../scoring";
import { uid } from "../storage";
import { buildShareUrl } from "../share";
import { ScoreGrid } from "./ScoreGrid";
import { ShareDialog } from "./ShareDialog";

interface Props {
  game: Game;
  onChange: (game: Game) => void;
  onDelete: () => void;
  onHome: () => void;
}

export function Scoreboard({ game, onChange, onDelete, onHome }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const totals = allTotals(game);
  const leaders = leaderIds(game);

  function addRound() {
    const round: Round = { id: uid(), scores: {} };
    for (const p of game.players) round.scores[p.id] = null;
    onChange({ ...game, rounds: [...game.rounds, round] });
  }

  function setScore(roundId: string, playerId: string, raw: string) {
    const value = raw === "" || raw === "-" ? null : Number(raw);
    if (value !== null && Number.isNaN(value)) return;
    onChange({
      ...game,
      rounds: game.rounds.map((r) =>
        r.id === roundId
          ? { ...r, scores: { ...r.scores, [playerId]: value } }
          : r
      ),
    });
  }

  function deleteRound(roundId: string) {
    onChange({ ...game, rounds: game.rounds.filter((r) => r.id !== roundId) });
  }

  function openShare() {
    setMenuOpen(false);
    setShareUrl(buildShareUrl(game));
  }

  return (
    <div className="screen play">
      <header className="bar">
        <button className="link" onClick={onHome}>
          ‹ Games
        </button>
        <h1 className="bar-title">{game.name || "Game"}</h1>
        <button
          className="icon-btn"
          aria-label="Menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          ⋯
        </button>
      </header>

      {menuOpen && (
        <div className="menu-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="menu" onClick={(e) => e.stopPropagation()}>
            <button className="menu-item" onClick={openShare}>
              Share read-only link
            </button>
            <button
              className="menu-item danger"
              onClick={() => {
                if (confirm("Delete this game? This can't be undone."))
                  onDelete();
              }}
            >
              Delete game
            </button>
          </div>
        </div>
      )}

      <div className="grid-wrap">
        <ScoreGrid
          players={game.players}
          rounds={game.rounds}
          totals={totals}
          leaders={leaders}
          onScore={setScore}
          onDeleteRound={deleteRound}
        />
        {game.rounds.length === 0 && (
          <p className="empty">No rounds yet. Add the first round to begin.</p>
        )}
      </div>

      <div className="play-actions">
        <button className="btn btn-primary btn-block" onClick={addRound}>
          + Add round
        </button>
      </div>

      {shareUrl && (
        <ShareDialog
          url={shareUrl}
          title={game.name || "Score Sheet"}
          onClose={() => setShareUrl(null)}
        />
      )}
    </div>
  );
}

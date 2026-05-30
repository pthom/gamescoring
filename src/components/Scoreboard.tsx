import { useEffect, useRef, useState } from "react";
import type { Game, Round } from "../types";
import { allTotals, leaderIds } from "../scoring";
import { uid, loadTimerVisible, saveTimerVisible } from "../storage";
import { buildShareUrl } from "../share";
import { ScoreGrid } from "./ScoreGrid";
import { ShareDialog } from "./ShareDialog";
import { Stopwatch } from "./Stopwatch";

interface Props {
  game: Game;
  onChange: (game: Game) => void;
  onDelete: () => void;
  onHome: () => void;
  onRematch: () => void;
}

export function Scoreboard({
  game,
  onChange,
  onDelete,
  onHome,
  onRematch,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showTimer, setShowTimer] = useState(() => loadTimerVisible());
  const gridWrap = useRef<HTMLDivElement>(null);
  const justAdded = useRef(false);
  const totals = allTotals(game);
  const leaders = leaderIds(game);
  const finished = game.finished;

  // After adding a round, focus its first cell and scroll it into view.
  useEffect(() => {
    if (!justAdded.current) return;
    justAdded.current = false;
    const rows = gridWrap.current?.querySelectorAll("tbody tr");
    const last = rows?.[rows.length - 1];
    last?.scrollIntoView({ block: "nearest" });
    last?.querySelector<HTMLInputElement>("input.score-input")?.focus();
  }, [game.rounds.length]);

  function addRound() {
    const round: Round = { id: uid(), scores: {} };
    for (const p of game.players) round.scores[p.id] = null;
    justAdded.current = true;
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
    const n = game.rounds.findIndex((r) => r.id === roundId) + 1;
    if (!confirm(`Delete round ${n}?`)) return;
    onChange({ ...game, rounds: game.rounds.filter((r) => r.id !== roundId) });
  }

  function renamePlayer(playerId: string, name: string) {
    onChange({
      ...game,
      players: game.players.map((p) =>
        p.id === playerId ? { ...p, name } : p
      ),
    });
  }

  function endGame() {
    setMenuOpen(false);
    onChange({ ...game, finished: true });
  }

  function continueGame() {
    onChange({ ...game, finished: false });
  }

  function openShare() {
    setMenuOpen(false);
    setShareUrl(buildShareUrl(game));
  }

  function toggleTimer() {
    setMenuOpen(false);
    setShowTimer((v) => {
      saveTimerVisible(!v);
      return !v;
    });
  }

  // Ranked standings for the end screen (ties share a rank).
  const ranked = game.players
    .map((p) => ({ id: p.id, name: p.name, total: totals[p.id] }))
    .sort((a, b) =>
      game.winnerRule === "highest" ? b.total - a.total : a.total - b.total
    )
    .map((s, i, arr) => ({
      ...s,
      rank: i > 0 && arr[i - 1].total === s.total ? -1 : i + 1,
    }))
    .map((s, i, arr) => ({
      ...s,
      rank: s.rank === -1 ? arr[i - 1].rank : s.rank,
    }));

  function medal(rank: number): string {
    return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}`;
  }

  return (
    <div className="screen play">
      <header className="bar">
        <button className="link" onClick={onHome}>
          ‹ Games
        </button>
        <h1 className="bar-title">
          {game.name || "Game"}
          {finished && <span className="badge ended-badge"> ended</span>}
        </h1>
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
            {!finished && (
              <button className="menu-item" onClick={toggleTimer}>
                {showTimer ? "Hide timer" : "Show timer"}
              </button>
            )}
            {!finished && (
              <button className="menu-item" onClick={endGame}>
                End game
              </button>
            )}
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

      {finished && (
        <ol className="standings">
          {ranked.map((s) => (
            <li
              key={s.id}
              className={s.rank === 1 ? "standing first" : "standing"}
            >
              <span className="rank">{medal(s.rank)}</span>
              <span className="sname">{s.name}</span>
              <span className="stotal">{s.total}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="grid-wrap" ref={gridWrap}>
        <ScoreGrid
          players={game.players}
          rounds={game.rounds}
          totals={totals}
          leaders={leaders}
          onScore={finished ? undefined : setScore}
          onDeleteRound={finished ? undefined : deleteRound}
          onRenamePlayer={finished ? undefined : renamePlayer}
        />
        {game.rounds.length === 0 && (
          <p className="empty">No rounds yet. Add the first round to begin.</p>
        )}
      </div>

      {showTimer && !finished && <Stopwatch />}

      <div className="play-actions">
        {finished ? (
          <div className="action-row">
            <button className="btn btn-ghost" onClick={continueGame}>
              Continue
            </button>
            <button className="btn btn-primary" onClick={onRematch}>
              Rematch
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-block" onClick={addRound}>
            + Add round
          </button>
        )}
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

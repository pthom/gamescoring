import { useEffect, useRef, useState } from "react";
import type { Game, Round } from "../types";
import { allTotals, leaderIds } from "../scoring";
import { uid, loadTimerVisible, saveTimerVisible } from "../storage";
import { buildShareUrl } from "../share";
import { ScoreGrid } from "./ScoreGrid";
import { ShareDialog } from "./ShareDialog";
import { Stopwatch } from "./Stopwatch";
import { NotesDialog } from "./NotesDialog";

interface Props {
  game: Game;
  onChange: (game: Game) => void;
  onDelete: () => void;
  onHome: () => void;
  onRematch: () => void;
  onFork: () => void;
}

export function Scoreboard({
  game,
  onChange,
  onDelete,
  onHome,
  onRematch,
  onFork,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [showTimer, setShowTimer] = useState(() => loadTimerVisible());
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const gridWrap = useRef<HTMLDivElement>(null);
  const justAdded = useRef(false);
  const totals = allTotals(game);
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  const leaders = leaderIds(game);
  const finished = game.finished;
  const isViewer = game.role === "viewer";
  const readOnly = finished || isViewer;

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

  function toggleSign(roundId: string, playerId: string) {
    onChange({
      ...game,
      rounds: game.rounds.map((r) => {
        if (r.id !== roundId) return r;
        const v = r.scores[playerId];
        return v == null ? r : { ...r, scores: { ...r.scores, [playerId]: -v } };
      }),
    });
  }

  function renamePlayer(playerId: string, name: string) {
    onChange({
      ...game,
      players: game.players.map((p) =>
        p.id === playerId ? { ...p, name } : p
      ),
    });
  }

  function startTitleEdit() {
    if (isViewer) return;
    setTitleDraft(game.name);
    setEditingTitle(true);
  }

  function commitTitle() {
    const n = titleDraft.trim();
    if (n) onChange({ ...game, name: n });
    setEditingTitle(false);
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

  function fork() {
    setMenuOpen(false);
    onFork();
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
        {editingTitle ? (
          <input
            className="title-input"
            value={titleDraft}
            autoFocus
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              else if (e.key === "Escape") setEditingTitle(false);
            }}
          />
        ) : (
          <button
            className="bar-title bar-title-btn"
            onClick={startTitleEdit}
            disabled={isViewer}
          >
            {game.name || (isViewer ? "Shared game" : "Game")}
            {isViewer ? (
              <span className="badge ended-badge"> view only</span>
            ) : finished ? (
              <span className="badge ended-badge"> ended</span>
            ) : null}
          </button>
        )}
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
            {!isViewer && (
              <button
                className="menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setNotesOpen(true);
                }}
              >
                {game.notes ? "Edit notes" : "Add notes"}
              </button>
            )}
            {!readOnly && (
              <button className="menu-item" onClick={toggleTimer}>
                {showTimer ? "Hide timer" : "Show timer"}
              </button>
            )}
            {!isViewer && !finished && (
              <button className="menu-item" onClick={endGame}>
                End game
              </button>
            )}
            {!isViewer && (
              <button className="menu-item" onClick={fork}>
                Copy to a new game
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

      {game.notes &&
        (isViewer ? (
          <div className="shared-note">📝 {game.notes}</div>
        ) : (
          <button className="game-note" onClick={() => setNotesOpen(true)}>
            📝 {game.notes}
          </button>
        ))}

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

      {game.rounds.length > 0 && (
        <div className="grid-summary">
          <span className="gs-label">Total points</span>
          <span className="gs-value">{grandTotal}</span>
        </div>
      )}

      <div className="grid-wrap" ref={gridWrap}>
        <ScoreGrid
          players={game.players}
          rounds={game.rounds}
          totals={totals}
          leaders={leaders}
          onScore={readOnly ? undefined : setScore}
          onDeleteRound={readOnly ? undefined : deleteRound}
          onRenamePlayer={readOnly ? undefined : renamePlayer}
          onToggleSign={readOnly ? undefined : toggleSign}
        />
        {game.rounds.length === 0 && (
          <p className="empty">
            {isViewer
              ? "No rounds played yet."
              : "No rounds yet. Add the first round to begin."}
          </p>
        )}
      </div>

      {showTimer && !readOnly && <Stopwatch />}

      <div className="play-actions">
        {isViewer ? (
          <button className="btn btn-primary btn-block" onClick={onFork}>
            Copy to a new game
          </button>
        ) : finished ? (
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

      {notesOpen && (
        <NotesDialog
          initial={game.notes ?? ""}
          onSave={(text) => onChange({ ...game, notes: text })}
          onClose={() => setNotesOpen(false)}
        />
      )}
    </div>
  );
}

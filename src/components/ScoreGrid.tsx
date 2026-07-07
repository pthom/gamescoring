import { useState } from "react";

interface Player {
  id: string;
  name: string;
}
interface Round {
  id: string;
  scores: Record<string, number | null>;
}

interface Props {
  players: Player[];
  rounds: Round[];
  totals: Record<string, number>;
  leaders: Set<string>;
  /** When provided, cells are editable and a per-row delete control shows. */
  onScore?: (roundId: string, playerId: string, raw: string) => void;
  onDeleteRound?: (roundId: string) => void;
  /** When provided, tapping a player's name lets you rename them. */
  onRenamePlayer?: (playerId: string, name: string) => void;
  /** When provided, a ± button on the focused cell flips that score's sign. */
  onToggleSign?: (roundId: string, playerId: string) => void;
}

export function ScoreGrid({
  players,
  rounds,
  totals,
  leaders,
  onScore,
  onDeleteRound,
  onRenamePlayer,
  onToggleSign,
}: Props) {
  const editable = !!onScore;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [focusedCell, setFocusedCell] = useState<string | null>(null);

  function startEdit(p: Player) {
    if (!onRenamePlayer) return;
    setEditingId(p.id);
    setDraft(p.name);
  }

  function commit() {
    if (editingId && onRenamePlayer && draft.trim()) {
      onRenamePlayer(editingId, draft.trim());
    }
    setEditingId(null);
  }

  const fmtDelta = (v: number) => (v > 0 ? `+${v}` : `${v}`);

  // Running (cumulative) total per player after each round. `played` stays
  // false until the player has an actual score, so leading blanks stay blank.
  const acc: Record<string, number> = {};
  const seen: Record<string, boolean> = {};
  for (const p of players) {
    acc[p.id] = 0;
    seen[p.id] = false;
  }
  const running = rounds.map((round) => {
    const row: Record<string, { total: number; played: boolean }> = {};
    for (const p of players) {
      const v = round.scores[p.id];
      if (v != null) {
        acc[p.id] += v;
        seen[p.id] = true;
      }
      row[p.id] = { total: acc[p.id], played: seen[p.id] };
    }
    return row;
  });

  return (
    <table className="grid">
      <thead>
        <tr>
          <th className="corner">#</th>
          {players.map((p) => (
            <th
              key={p.id}
              className={leaders.has(p.id) ? "phead leader" : "phead"}
            >
              <span className="pname">
                {leaders.has(p.id) && <span className="crown">♛ </span>}
                {editingId === p.id ? (
                  <input
                    className="pname-input"
                    value={draft}
                    autoFocus
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                      else if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                ) : onRenamePlayer ? (
                  <button
                    className="pname-btn"
                    onClick={() => startEdit(p)}
                    title="Tap to rename"
                  >
                    {p.name}
                  </button>
                ) : (
                  p.name
                )}
              </span>
              <span className="ptotal">{totals[p.id]}</span>
            </th>
          ))}
          {onDeleteRound && <th className="rowtools" aria-hidden="true" />}
        </tr>
      </thead>
      <tbody>
        {rounds.map((round, i) => (
          <tr key={round.id}>
            <td className="rnum">{i + 1}</td>
            {players.map((p) => {
              const key = `${round.id}:${p.id}`;
              const delta = round.scores[p.id];
              const cell = running[i][p.id];
              return (
                <td key={p.id} className="cell">
                  {editable ? (
                    <label className="cell-box">
                      {onToggleSign && focusedCell === key && (
                        <button
                          className="sign-btn"
                          aria-label="Toggle sign"
                          // keep the input focused (and the keypad open)
                          onPointerDown={(e) => e.preventDefault()}
                          onClick={() => onToggleSign(round.id, p.id)}
                        >
                          ±
                        </button>
                      )}
                      {focusedCell !== key && delta != null && (
                        <>
                          <span className="cell-delta">{fmtDelta(delta)}</span>
                          <span className="cell-total-ov">{cell.total}</span>
                        </>
                      )}
                      <input
                        className={
                          focusedCell !== key && delta != null
                            ? "score-input ghost"
                            : "score-input"
                        }
                        type="text"
                        inputMode="numeric"
                        pattern="-?[0-9]*"
                        value={round.scores[p.id] ?? ""}
                        placeholder="–"
                        onChange={(e) => onScore!(round.id, p.id, e.target.value)}
                        onFocus={(e) => {
                          setFocusedCell(key);
                          e.target.select();
                        }}
                        onBlur={() =>
                          setFocusedCell((c) => (c === key ? null : c))
                        }
                      />
                    </label>
                  ) : (
                    <div className="cell-box">
                      {delta != null && (
                        <span className="cell-delta">{fmtDelta(delta)}</span>
                      )}
                      <span className="score-static">
                        {cell.played ? cell.total : "–"}
                      </span>
                    </div>
                  )}
                </td>
              );
            })}
            {onDeleteRound && (
              <td className="rowtools">
                <button
                  className="icon-btn danger sm"
                  aria-label={`Delete round ${i + 1}`}
                  onClick={() => onDeleteRound(round.id)}
                >
                  ✕
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

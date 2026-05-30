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
              return (
                <td key={p.id} className="cell">
                  {editable ? (
                    <>
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
                      <input
                        className="score-input"
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
                    </>
                  ) : (
                    <span className="score-static">
                      {round.scores[p.id] ?? "–"}
                    </span>
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

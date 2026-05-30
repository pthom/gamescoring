import { useState } from "react";
import type { Game, Round } from "../types";
import { allTotals, leaderIds } from "../scoring";
import { uid } from "../storage";

interface Props {
  game: Game;
  onChange: (game: Game) => void;
  onDelete: () => void;
  onHome: () => void;
}

export function Scoreboard({ game, onChange, onDelete, onHome }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
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
        <div className="menu" onClick={() => setMenuOpen(false)}>
          <button
            className="menu-item danger"
            onClick={() => {
              if (confirm("Delete this game? This can't be undone.")) onDelete();
            }}
          >
            Delete game
          </button>
        </div>
      )}

      <div className="grid-wrap">
        <table className="grid">
          <thead>
            <tr>
              <th className="corner">#</th>
              {game.players.map((p) => (
                <th
                  key={p.id}
                  className={leaders.has(p.id) ? "phead leader" : "phead"}
                >
                  <span className="pname">
                    {leaders.has(p.id) && <span className="crown">♛ </span>}
                    {p.name}
                  </span>
                  <span className="ptotal">{totals[p.id]}</span>
                </th>
              ))}
              <th className="rowtools" aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {game.rounds.map((round, i) => (
              <tr key={round.id}>
                <td className="rnum">{i + 1}</td>
                {game.players.map((p) => (
                  <td key={p.id} className="cell">
                    <input
                      className="score-input"
                      type="text"
                      inputMode="numeric"
                      pattern="-?[0-9]*"
                      value={round.scores[p.id] ?? ""}
                      placeholder="–"
                      onChange={(e) => setScore(round.id, p.id, e.target.value)}
                      onFocus={(e) => e.target.select()}
                    />
                  </td>
                ))}
                <td className="rowtools">
                  <button
                    className="icon-btn danger sm"
                    aria-label={`Delete round ${i + 1}`}
                    onClick={() => deleteRound(round.id)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {game.rounds.length === 0 && (
          <p className="empty">No rounds yet. Add the first round to begin.</p>
        )}
      </div>

      <div className="play-actions">
        <button className="btn btn-primary btn-block" onClick={addRound}>
          + Add round
        </button>
      </div>
    </div>
  );
}

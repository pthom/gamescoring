import { useState } from "react";
import type { WinnerRule } from "../types";

interface Props {
  onStart: (name: string, rule: WinnerRule, players: string[]) => void;
  onCancel: () => void;
}

export function NewGame({ onStart, onCancel }: Props) {
  const [name, setName] = useState("");
  const [rule, setRule] = useState<WinnerRule>("highest");
  const [players, setPlayers] = useState<string[]>(["", ""]);

  const validCount = players.filter((p) => p.trim()).length;
  const canStart = validCount >= 2;

  function setPlayer(i: number, value: string) {
    setPlayers((prev) => prev.map((p, idx) => (idx === i ? value : p)));
  }

  function addPlayer() {
    setPlayers((prev) => [...prev, ""]);
  }

  function removePlayer(i: number) {
    setPlayers((prev) => prev.filter((_, idx) => idx !== i));
  }

  function start() {
    const names = players.map((p) => p.trim()).filter(Boolean);
    onStart(name, rule, names);
  }

  return (
    <div className="screen">
      <header className="bar">
        <button className="link" onClick={onCancel}>
          ‹ Back
        </button>
        <h1>New game</h1>
        <span className="bar-spacer" />
      </header>

      <label className="field">
        <span className="field-label">Game name (optional)</span>
        <input
          className="input"
          type="text"
          placeholder="Scrabble, Rummy…"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <div className="field">
        <span className="field-label">Who wins?</span>
        <div className="segmented">
          <button
            className={rule === "highest" ? "seg active" : "seg"}
            onClick={() => setRule("highest")}
          >
            Highest score
          </button>
          <button
            className={rule === "lowest" ? "seg active" : "seg"}
            onClick={() => setRule("lowest")}
          >
            Lowest score
          </button>
        </div>
      </div>

      <div className="field">
        <span className="field-label">Players</span>
        <ul className="player-inputs">
          {players.map((p, i) => (
            <li key={i} className="player-input-row">
              <input
                className="input"
                type="text"
                placeholder={`Player ${i + 1}`}
                value={p}
                onChange={(e) => setPlayer(i, e.target.value)}
              />
              {players.length > 2 && (
                <button
                  className="icon-btn danger"
                  aria-label="Remove player"
                  onClick={() => removePlayer(i)}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
        <button className="btn btn-ghost btn-block" onClick={addPlayer}>
          + Add player
        </button>
      </div>

      <button
        className="btn btn-primary btn-block btn-start"
        disabled={!canStart}
        onClick={start}
      >
        Start game
      </button>
      {!canStart && (
        <p className="hint">Enter at least two players to start.</p>
      )}
    </div>
  );
}

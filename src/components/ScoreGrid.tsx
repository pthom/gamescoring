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
}

export function ScoreGrid({
  players,
  rounds,
  totals,
  leaders,
  onScore,
  onDeleteRound,
}: Props) {
  const editable = !!onScore;

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
                {p.name}
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
            {players.map((p) => (
              <td key={p.id} className="cell">
                {editable ? (
                  <input
                    className="score-input"
                    type="text"
                    inputMode="numeric"
                    pattern="-?[0-9]*"
                    value={round.scores[p.id] ?? ""}
                    placeholder="–"
                    onChange={(e) => onScore!(round.id, p.id, e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                ) : (
                  <span className="score-static">
                    {round.scores[p.id] ?? "–"}
                  </span>
                )}
              </td>
            ))}
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

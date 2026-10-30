import { useState } from "react";

// Every row has these; the one remaining key is the stat (runs, wickets, strikeRate...).
const BASE_KEYS = ["userId", "name", "profileImage", "teams", "matches"];

function Avatar({ src, name }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="stats-avatar stats-avatar--fallback" aria-hidden="true">
        {name?.[0]?.toUpperCase()}
      </span>
    );
  }
  return (
    <img
      className="stats-avatar"
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function StatsTable({
  rows,
  statLabel,
  field,
  decimals = 2,
  lowerIsBetter = false,
}) {
  if (!rows.length) {
    return <p className="stats-note">No stats yet. Finish a match to see the leaderboard.</p>;
  }

  const statKey = field ?? Object.keys(rows[0]).find((k) => !BASE_KEYS.includes(k));
  const values = rows.map((r) => Number(r[statKey]) || 0);
  const positives = values.filter((v) => v > 0);
  const best = positives.length
    ? lowerIsBetter
      ? Math.min(...positives)
      : Math.max(...positives)
    : 0;

  // Bar length shows how close each player is to the leader.
  const barWidth = (v) => {
    if (!best || v <= 0) return 0;
    return lowerIsBetter ? (best / v) * 100 : (v / best) * 100;
  };
  const format = (v) => (Number.isInteger(v) ? v : v.toFixed(decimals));

  return (
    <div className="stats-scroll">
      <table className="stats-table">
        <thead>
          <tr>
            <th className="stats-rank">#</th>
            <th>Player</th>
            <th className="stats-num">Matches</th>
            <th className="stats-stat">{statLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.userId} className={i === 0 ? "is-leader" : ""}>
              <td className="stats-rank">{i + 1}</td>
              <td>
                <span className="stats-player">
                  <Avatar src={row.profileImage} name={row.name} />
                  <span className="stats-name">{row.name.replace(/_/g, " ")}</span>
                </span>
              </td>
              <td className="stats-num">{row.matches}</td>
              <td className="stats-stat">
                <span className="stats-bar" style={{ width: `${barWidth(values[i])}%` }} />
                <span className="stats-value">{format(values[i])}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

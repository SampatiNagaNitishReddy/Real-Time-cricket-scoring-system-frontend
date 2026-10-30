import { useEffect, useState } from "react";
import StatsTable from "../../components/stats/StatsTable";
import * as stats from "../../services/statsService";
import "../../StatsPage.css";

const GROUPS = {
  batters: {
    label: "Batters",
    categories: [
      { key: "runs", label: "Most runs", statLabel: "Runs", fetch: stats.getTopRunScorers },
      { key: "sr", label: "Strike rate", statLabel: "Strike rate", fetch: stats.getHighestStrikeRate },
      { key: "avg", label: "Average", statLabel: "Average", fetch: stats.getHighestAverage },
      { key: "fours", label: "Most fours", statLabel: "Fours", fetch: stats.getMostFours },
      { key: "sixes", label: "Most sixes", statLabel: "Sixes", fetch: stats.getMostSixes },
    ],
  },
  bowlers: {
    label: "Bowlers",
    categories: [
      { key: "wkts", label: "Most wickets", statLabel: "Wickets", fetch: stats.getTopWicketTakers },
      { key: "econ", label: "Economy", statLabel: "Economy", fetch: stats.getLowestEconomy, lowerIsBetter: true },
      { key: "bsr", label: "Strike rate", statLabel: "Strike rate", fetch: stats.getLowestBowlingStrikeRate, lowerIsBetter: true },
      { key: "bavg", label: "Average", statLabel: "Average", fetch: stats.getLowestBowlingAverage, lowerIsBetter: true },
    ],
  },
};

export default function StatsPage() {
  const [group, setGroup] = useState("batters");
  const [catKey, setCatKey] = useState(GROUPS.batters.categories[0].key);
  const [state, setState] = useState({ status: "loading", rows: [] });
  const [attempt, setAttempt] = useState(0);

  const category = GROUPS[group].categories.find((c) => c.key === catKey);

  useEffect(() => {
    let ignore = false; // drop responses from a tab the user already left
    setState({ status: "loading", rows: [] });
    category
      .fetch()
      .then((rows) => !ignore && setState({ status: "ready", rows }))
      .catch(() => !ignore && setState({ status: "error", rows: [] }));
    return () => {
      ignore = true;
    };
  }, [category, attempt]);

  const changeGroup = (g) => {
    setGroup(g);
    setCatKey(GROUPS[g].categories[0].key);
  };

  return (
     <div className="stats-shell">
    <main className="stats-page">
      <h1>Player stats</h1>

      <div className="stats-tabs" role="tablist" aria-label="Stats type">
        {Object.entries(GROUPS).map(([key, g]) => (
          <button
            key={key}
            role="tab"
            aria-selected={group === key}
            className={group === key ? "is-active" : ""}
            onClick={() => changeGroup(key)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="stats-pills">
        {GROUPS[group].categories.map((c) => (
          <button
            key={c.key}
            aria-pressed={catKey === c.key}
            className={catKey === c.key ? "is-active" : ""}
            onClick={() => setCatKey(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {state.status === "loading" && <p className="stats-note">Loading stats…</p>}
      {state.status === "error" && (
        <p className="stats-note">
          Couldn't load these stats. <button className="stats-retry" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
        </p>
      )}
      {state.status === "ready" && (
        <StatsTable
          rows={state.rows}
          statLabel={category.statLabel}
          lowerIsBetter={category.lowerIsBetter}
        />
      )}
    </main>
    </div>
  );
}

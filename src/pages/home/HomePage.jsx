import { useEffect, useState } from "react";

import MatchCard from "../../components/match/MatchCard";
import { getAllMatches } from "../../services/matchService";

const isLive = (m) => m.status?.startsWith("LIVE");

const FILTERS = [
  { key: "all", label: "All", test: () => true },
  { key: "live", label: "Live", test: isLive },
  { key: "completed", label: "Completed", test: (m) => m.status === "COMPLETED" },
  { key: "abandoned", label: "Abandoned", test: (m) => m.status === "ABANDONED" },
  {
    key: "upcoming",
    label: "Upcoming",
    test: (m) => !isLive(m) && m.status !== "COMPLETED" && m.status !== "ABANDONED",
  },
];

function MatchGrid({ matches }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function SectionTitle({ children, count }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 className="text-lg font-semibold text-white">{children}</h2>
      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
        {count}
      </span>
    </div>
  );
}

function HomePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllMatches();

      setMatches(data);
    } catch (err) {
      setError("Failed to fetch matches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 h-9 w-40 animate-pulse rounded-lg bg-zinc-900" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-zinc-900" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchMatches}
          className="rounded-lg bg-zinc-800 px-5 py-2 font-medium transition hover:bg-zinc-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const liveMatches = matches.filter(isLive);
  const otherMatches = matches.filter((m) => !isLive(m)).reverse(); // newest first

  const activeFilter = FILTERS.find((f) => f.key === filter);
  const filtered = [...liveMatches, ...otherMatches].filter(activeFilter.test);

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Matches</h1>

          {liveMatches.length > 0 ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              {liveMatches.length} live {liveMatches.length === 1 ? "match" : "matches"} right now
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">No live matches right now</p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => {
            const count = matches.filter(f.test).length;
            if (f.key !== "all" && count === 0) return null;

            const active = filter === f.key;

            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-green-500 bg-green-500 text-black"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {f.label}
                <span className={active ? "text-black/60" : "text-zinc-500"}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {matches.length === 0 ? (
          <p className="py-20 text-center text-zinc-500">
            No matches yet. Create a match to see it here.
          </p>
        ) : filter === "all" ? (
          <div className="space-y-10">
            {liveMatches.length > 0 && (
              <section>
                <SectionTitle count={liveMatches.length}>Live now</SectionTitle>
                <MatchGrid matches={liveMatches} />
              </section>
            )}

            {otherMatches.length > 0 && (
              <section>
                <SectionTitle count={otherMatches.length}>Recent matches</SectionTitle>
                <MatchGrid matches={otherMatches} />
              </section>
            )}
          </div>
        ) : (
          <MatchGrid matches={filtered} />
        )}
      </div>
    </div>
  );
}

export default HomePage;
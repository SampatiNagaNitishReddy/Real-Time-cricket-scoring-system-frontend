import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyTeams, getTeamSquad } from "../../services/teamService";

const ROLE_ORDER = ["BATTER", "WICKET_KEEPER", "ALL_ROUNDER", "BOWLER"];

const prettyName = (n = "") => n.replace(/_/g, " ");

const prettyRole = (r = "") =>
  r.charAt(0).toUpperCase() + r.slice(1).toLowerCase().replace(/_/g, " ");

const copyText = async (text, message) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  } catch {
    toast.error("Couldn't copy");
  }
};

const roleRank = (r) => {
  const i = ROLE_ORDER.indexOf(r);
  return i === -1 ? 99 : i;
};

// Captain, vice-captain, then by role, then by name
const sortSquad = (players) =>
  [...players].sort((a, b) => {
    if (a.captain !== b.captain) return a.captain ? -1 : 1;
    if (a.viceCaptain !== b.viceCaptain) return a.viceCaptain ? -1 : 1;

    return roleRank(a.role) - roleRank(b.role) || (a.name ?? "").localeCompare(b.name ?? "");
  });

function Avatar({ src, name, size = "h-14 w-14", text = "text-lg" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-green-500/15 ${text} font-bold text-green-400`}
      >
        {name?.[0]?.toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${size} shrink-0 rounded-full object-cover ring-2 ring-zinc-700`}
    />
  );
}

function CopyChip({ value, label }) {
  return (
    <button
      type="button"
      onClick={() => copyText(value, `${label} copied`)}
      title={`Copy ${label.toLowerCase()}`}
      className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400 transition hover:text-white"
    >
      {value}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
      </svg>
    </button>
  );
}

function PlayerCard({ player }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">

      <Avatar src={player.profileImage} name={player.name} />

      <div className="min-w-0">

        <div className="flex flex-wrap items-center gap-2">

          <h2 className="truncate text-lg font-semibold text-white">
            {prettyName(player.name)}
          </h2>

          {player.captain && (
            <span className="rounded bg-green-500 px-2 py-0.5 text-xs font-bold text-black">
              Captain
            </span>
          )}

          {player.viceCaptain && (
            <span className="rounded bg-zinc-600 px-2 py-0.5 text-xs font-bold text-white">
              Vice captain
            </span>
          )}

        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">

          {player.role && (
            <span className="text-sm text-zinc-400">{prettyRole(player.role)}</span>
          )}

          <CopyChip value={player.userId} label="Player ID" />

        </div>

      </div>

    </div>
  );
}

function TeamSquadPage() {

  const { teamId } = useParams();

  const [players, setPlayers] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [role, setRole] = useState("ALL");

  useEffect(() => {
    let ignore = false; // drop the response if the user navigated away

    const load = async () => {
      setLoading(true);
      setError(false);

      // The squad is required; the team header is a nice-to-have
      const [squadRes, teamsRes] = await Promise.allSettled([
        getTeamSquad(teamId),
        getMyTeams(),
      ]);

      if (ignore) return;

      if (squadRes.status === "rejected") {
        console.error(squadRes.reason);
        setError(true);
      } else {
        setPlayers(squadRes.value ?? []);

        setTeam(
          teamsRes.status === "fulfilled"
            ? (teamsRes.value ?? []).find((t) => t.teamId === teamId) ?? null
            : null
        );
      }

      setLoading(false);
    };

    load();

    return () => {
      ignore = true;
    };
  }, [teamId, attempt]);

  const sorted = sortSquad(players);
  const visible = role === "ALL" ? sorted : sorted.filter((p) => p.role === role);
  const rolesPresent = ROLE_ORDER.filter((r) => players.some((p) => p.role === r));

  return (

    <div className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-5xl">

        <Link
          to="/dashboard/teams"
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span> My teams
        </Link>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <div className="h-36 animate-pulse rounded-2xl bg-zinc-900" />
            <div className="grid gap-3 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-900" />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">

            <p className="mb-5 text-red-400">Failed to load squad.</p>

            <button
              onClick={() => setAttempt((n) => n + 1)}
              className="rounded-lg bg-zinc-800 px-5 py-2 font-medium transition hover:bg-zinc-700"
            >
              Try again
            </button>

          </div>
        )}

        {!loading && !error && (
          <>

            {/* Team header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

              <div className="flex min-w-0 items-center gap-5">

                {team && (
                  <Avatar
                    src={team.teamLogoUrl}
                    name={team.name}
                    size="h-20 w-20"
                    text="text-3xl"
                  />
                )}

                <div className="min-w-0">

                  <h1 className="truncate text-2xl font-bold sm:text-3xl">
                    {team?.name ?? "Team squad"}
                  </h1>

                  <p className="mt-1 text-zinc-400">
                    {players.length} {players.length === 1 ? "player" : "players"}
                  </p>

                  <div className="mt-2">
                    <CopyChip value={teamId} label="Team ID" />
                  </div>

                </div>

              </div>

              <Link
                to={`/dashboard/teams/${teamId}/manage`}
                className="rounded-lg bg-zinc-800 px-5 py-2.5 font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
              >
                Manage team
              </Link>

            </div>

            {players.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center">

                <p className="text-xl font-semibold">No players yet</p>

                <p className="mb-6 mt-2 text-zinc-400">
                  Add players to this team from the manage page.
                </p>

                <Link
                  to={`/dashboard/teams/${teamId}/manage`}
                  className="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-black transition hover:bg-green-400"
                >
                  Add players
                </Link>

              </div>

            ) : (
              <>

                {/* Role filters */}
                <div className="mb-5 flex gap-2 overflow-x-auto pb-1">

                  {["ALL", ...rolesPresent].map((r) => {
                    const count =
                      r === "ALL"
                        ? players.length
                        : players.filter((p) => p.role === r).length;
                    const active = role === r;

                    return (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                          active
                            ? "border-green-500 bg-green-500 text-black"
                            : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                        }`}
                      >
                        {r === "ALL" ? "All" : prettyRole(r)}
                        <span className={active ? "text-black/60" : "text-zinc-500"}>
                          {count}
                        </span>
                      </button>
                    );
                  })}

                </div>

                {/* Players */}
                <div className="grid gap-3 md:grid-cols-2">
                  {visible.map((player) => (
                    <PlayerCard key={player.userId} player={player} />
                  ))}
                </div>

              </>
            )}

          </>
        )}

      </div>

    </div>

  );

}

export default TeamSquadPage;
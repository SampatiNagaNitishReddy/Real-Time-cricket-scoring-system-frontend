import { useEffect, useState } from "react";
import { getTeamSquad } from "../../services/teamService";

const prettyName = (n = "") => n.replace(/_/g, " ");

const prettyRole = (r = "") =>
  r.charAt(0).toUpperCase() + r.slice(1).toLowerCase().replace(/_/g, " ");

const ROLE_ORDER = { BATTER: 0, WICKET_KEEPER: 1, ALL_ROUNDER: 2, BOWLER: 3 };

// Captain, vice-captain, then by role. Delete this to keep the backend order.
const sortSquad = (players) =>
  [...players].sort((a, b) => {
    if (a.captain !== b.captain) return a.captain ? -1 : 1;
    if (a.viceCaptain !== b.viceCaptain) return a.viceCaptain ? -1 : 1;

    const roleDiff = (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9);
    return roleDiff || (a.name ?? "").localeCompare(b.name ?? "");
  });

function Avatar({ src, name }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-lg font-bold text-green-400"
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
      className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-zinc-700"
    />
  );
}

function PlayerCard({ player }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-zinc-800 p-3 pr-4">

      <Avatar src={player.profileImage} name={player.name} />

      <div className="min-w-0">

        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-white">
            {prettyName(player.name)}
          </h3>

          {player.captain && (
            <span
              title="Captain"
              className="rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-black"
            >
              C
            </span>
          )}

          {player.viceCaptain && (
            <span
              title="Vice-captain"
              className="rounded bg-zinc-600 px-1.5 py-0.5 text-[10px] font-bold text-white"
            >
              VC
            </span>
          )}
        </div>

        {player.role && (
          <p className="text-sm text-zinc-400">{prettyRole(player.role)}</p>
        )}

      </div>

    </div>
  );
}

function TeamSquad({ team, players }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

      {/* Team header */}
      <div className="mb-5 flex items-center gap-4">

        <img
          src={team.logo}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full bg-zinc-800 object-cover"
        />

        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            {team.name}
          </h2>

          <p className="text-sm text-zinc-400">
            {players.length} {players.length === 1 ? "player" : "players"}
          </p>
        </div>

      </div>

      {/* Players */}
      {players.length === 0 ? (
        <p className="py-4 text-zinc-500">No players in this squad yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {sortSquad(players).map((player) => (
            <PlayerCard key={player.userId} player={player} />
          ))}
        </div>
      )}

    </div>
  );
}

function Squads({ teamA, teamB }) {

  const [squads, setSquads] = useState({ a: [], b: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false; // drop the response if the tab was closed meanwhile

    const fetchSquads = async () => {
      try {
        setLoading(true);
        setError(false);

        const [aSquad, bSquad] = await Promise.all([
          getTeamSquad(teamA.id),
          getTeamSquad(teamB.id),
        ]);

        if (!ignore) setSquads({ a: aSquad ?? [], b: bSquad ?? [] });
      } catch (err) {
        console.error(err);
        if (!ignore) setError(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchSquads();

    return () => {
      ignore = true;
    };
  }, [teamA.id, teamB.id, attempt]);

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl bg-zinc-900" />
        <div className="h-96 animate-pulse rounded-2xl bg-zinc-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <p className="mb-4 text-red-400">Couldn't load the squads.</p>

        <button
          onClick={() => setAttempt((n) => n + 1)}
          className="rounded-lg bg-zinc-800 px-5 py-2 font-medium text-white transition hover:bg-zinc-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <TeamSquad team={teamA} players={squads.a} />
      <TeamSquad team={teamB} players={squads.b} />
    </div>
  );
}

export default Squads;
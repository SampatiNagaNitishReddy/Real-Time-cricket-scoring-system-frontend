import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyTeams } from "../../services/teamService";

const prettyName = (n) => (n ? n.replace(/_/g, " ") : null);

function TeamLogo({ src, name }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-2xl font-bold text-green-400"
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
      className="h-16 w-16 shrink-0 rounded-full border border-zinc-700 object-cover"
    />
  );
}

function CopyId({ teamId }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(teamId);
      toast.success("Team ID copied");
    } catch {
      toast.error("Couldn't copy the ID");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy team ID"
      className="mt-4 inline-flex w-fit items-center gap-2 rounded-md bg-zinc-800 px-2.5 py-1 font-mono text-xs text-zinc-400 transition hover:text-white"
    >
      {teamId}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
      </svg>
    </button>
  );
}

function Role({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className={`truncate font-medium ${value ? "text-white" : "text-zinc-600"}`}>
        {value ?? "Not set"}
      </dd>
    </div>
  );
}

function CreateTeamLink({ children = "Create Team" }) {
  return (
    <Link
      to="/dashboard/teams/create"
      className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      {children}
    </Link>
  );
}

function MyTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getMyTeams();

      setTeams(data ?? []);

    } catch (err) {

      console.error(err);

      setError("Failed to load teams.");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="text-3xl font-bold sm:text-4xl">
              My Teams
            </h1>

            <p className="mt-2 text-zinc-400">
              {loading || error
                ? "Teams you are part of"
                : `Teams you are part of · ${teams.length} ${teams.length === 1 ? "team" : "teams"}`}
            </p>

          </div>

          <CreateTeamLink />

        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-zinc-900" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">

            <p className="mb-5 text-red-400">{error}</p>

            <button
              onClick={fetchTeams}
              className="rounded-lg bg-zinc-800 px-5 py-2 font-medium transition hover:bg-zinc-700"
            >
              Try again
            </button>

          </div>
        )}

        {/* Empty */}
        {!loading && !error && teams.length === 0 && (

          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center sm:p-16">

            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </span>

            <h2 className="text-2xl font-semibold">
              No teams yet
            </h2>

            <p className="mb-8 mt-3 text-zinc-400">
              Create your first cricket team and add players to it.
            </p>

            <CreateTeamLink>Create your first team</CreateTeamLink>

          </div>

        )}

        {/* Teams */}
        {!loading && !error && teams.length > 0 && (

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {teams.map((team) => (

              <div
                key={team.teamId}
                className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:-translate-y-0.5 hover:border-zinc-600"
              >

                <div className="flex items-center gap-4">

                  <TeamLogo src={team.teamLogoUrl} name={team.name} />

                  <div className="min-w-0">

                    <h2 className="truncate text-xl font-bold">
                      {team.name}
                    </h2>

                    <p className="text-sm text-zinc-400">
                      {team.playerCount} {team.playerCount === 1 ? "player" : "players"}
                    </p>

                  </div>

                </div>

                <CopyId teamId={team.teamId} />

                <dl className="mt-5 space-y-2 text-sm">
                  <Role label="Captain" value={prettyName(team.captainName)} />
                  <Role label="Vice captain" value={prettyName(team.viceCaptainName)} />
                </dl>

                <div className="mt-auto flex gap-3 pt-6">

                  <Link
                    to={`/dashboard/teams/${team.teamId}`}
                    className="flex-1 rounded-lg bg-green-500 py-2 text-center font-semibold text-black transition hover:bg-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                  >
                    View
                  </Link>

                  <Link
                    to={`/dashboard/teams/${team.teamId}/manage`}
                    className="flex-1 rounded-lg bg-zinc-800 py-2 text-center font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                  >
                    Manage
                  </Link>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}

export default MyTeamsPage;
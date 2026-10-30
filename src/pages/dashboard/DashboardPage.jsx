import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ICONS = {
  plus: "M12 4.5v15m7.5-7.5h-15",
  play: [
    "M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    "M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z",
  ],
  shield:
    "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  arrow: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
};

function Icon({ name, className = "h-6 w-6" }) {
  const paths = [].concat(ICONS[name]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

function DashboardPage() {
  const { user } = useAuth();

  const name = user?.name?.replace(/_/g, " ");

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <h1 className="text-3xl font-bold sm:text-4xl">
          {greeting()}
          {name && <span className="text-green-400">, {name}</span>}
        </h1>

        <p className="mb-10 mt-2 text-zinc-400">
          What would you like to do today?
        </p>

        {/* Featured action */}
        <Link
          to="/matches/create"
          className="group relative mb-6 block overflow-hidden rounded-2xl border border-green-500/30 bg-zinc-900 p-6 transition hover:-translate-y-0.5 hover:border-green-500/60 focus-visible:outline-2 focus-visible:outline-green-500 sm:p-8"
        >

          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-green-500/15 via-transparent to-transparent" />

          <div className="relative flex items-center gap-5">

            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-500 text-black sm:h-16 sm:w-16">
              <Icon name="plus" className="h-8 w-8" />
            </span>

            <div className="min-w-0">
              <h2 className="text-xl font-semibold sm:text-2xl">Create Match</h2>
              <p className="mt-1 text-zinc-400">
                Set up a new match, pick the teams and start scoring.
              </p>
            </div>

            <Icon
              name="arrow"
              className="ml-auto hidden h-6 w-6 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-green-400 sm:block"
            />

          </div>

        </Link>

        {/* Secondary actions */}
        <div className="grid gap-6 sm:grid-cols-2">

          <Link
            to="/dashboard/matches"
            className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:-translate-y-0.5 hover:border-zinc-600 focus-visible:outline-2 focus-visible:outline-green-500"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-green-400 transition group-hover:bg-green-500/15">
              <Icon name="play" />
            </span>

            <div className="mt-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Match Controls</h2>
              <Icon
                name="arrow"
                className="h-5 w-5 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-green-400"
              />
            </div>

            <p className="mt-2 text-zinc-400">
              Score and manage the live matches you're a scorer for.
            </p>
          </Link>

          <Link
            to="/dashboard/teams"
            className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:-translate-y-0.5 hover:border-zinc-600 focus-visible:outline-2 focus-visible:outline-green-500"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-green-400 transition group-hover:bg-green-500/15">
              <Icon name="shield" />
            </span>

            <div className="mt-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">My Teams</h2>
              <Icon
                name="arrow"
                className="h-5 w-5 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-green-400"
              />
            </div>

            <p className="mt-2 text-zinc-400">
              View your teams and create a new one.
            </p>
          </Link>

        </div>

      </div>

    </div>
  );
}

export default DashboardPage;
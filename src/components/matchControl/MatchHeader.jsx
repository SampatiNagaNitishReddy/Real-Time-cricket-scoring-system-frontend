import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const STATUS_STYLES = {

    SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",

    TOSS_COMPLETED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",

    PLAYING_XI_SELECTED: "bg-purple-500/20 text-purple-400 border-purple-500/30",

    LIVE_FIRST_INNINGS: "bg-green-500/20 text-green-400 border-green-500/30",

    INNINGS_BREAK: "bg-orange-500/20 text-orange-400 border-orange-500/30",

    LIVE_SECOND_INNINGS: "bg-green-500/20 text-green-400 border-green-500/30",

    COMPLETED: "bg-zinc-700 text-white border-zinc-600",

    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",

    ABANDONED: "bg-red-500/20 text-red-400 border-red-500/30"

};

function StatusBadge({ status }) {

    const live = status?.startsWith("LIVE");

    return (

        <span
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${STATUS_STYLES[status] || STATUS_STYLES.SCHEDULED}`}
        >

            {live && (
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
            )}

            {(status ?? "UNKNOWN").replaceAll("_", " ")}

        </span>

    );

}

function TeamLogo({ src, name }) {

    const [failed, setFailed] = useState(false);

    if (!src || failed) {

        return (

            <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-sm font-bold text-green-400"
            >

                {name?.[0]?.toUpperCase()}

            </span>

        );

    }

    return (

        <img
            src={src}
            alt=""
            onError={() => setFailed(true)}
            className="h-9 w-9 shrink-0 rounded-full bg-zinc-800 object-cover"
        />

    );

}

function Fact({ label, children }) {

    return (

        <div className="rounded-lg bg-zinc-800 px-3 py-2">

            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">

                {label}

            </p>

            <p className="text-sm font-semibold text-white">

                {children}

            </p>

        </div>

    );

}

const formatStart = (value) => {

    if (!value) return "Not set";

    const d = new Date(value);

    if (isNaN(d)) return "Not set";

    return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

};

function MatchHeader({ match }) {

    const copyId = async () => {

        try {

            await navigator.clipboard.writeText(match.matchId);

            toast.success("Match ID copied");

        } catch {

            toast.error("Couldn't copy");

        }

    };

    return (

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

            <Link
                to="/dashboard/matches"
                className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-white"
            >

                <span aria-hidden="true">←</span> My matches

            </Link>

            <div className="flex flex-wrap items-start justify-between gap-3">

                <div className="min-w-0">

                    <h1 className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xl font-bold text-white sm:text-2xl">

                        <span className="flex items-center gap-2">

                            <TeamLogo src={match.teamA?.logo} name={match.teamA?.name} />

                            {match.teamA?.name}

                        </span>

                        <span className="text-sm font-medium text-zinc-500">vs</span>

                        <span className="flex items-center gap-2">

                            <TeamLogo src={match.teamB?.logo} name={match.teamB?.name} />

                            {match.teamB?.name}

                        </span>

                    </h1>

                    <p className="mt-2 text-zinc-400">

                        {match.venue}

                    </p>

                </div>

                <StatusBadge status={match.status} />

            </div>

            <div className="mt-5 flex flex-wrap gap-2">

                <Fact label="Overs">

                    {match.overs}

                </Fact>

                <Fact label="Max / bowler">

                    {match.maxOversPerBowler}

                </Fact>

                <Fact label="Scheduled">

                    {formatStart(match.startTime)}

                </Fact>

                <button
                    type="button"
                    onClick={copyId}
                    title="Copy match ID"
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-left transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                >

                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">

                        Match ID

                    </span>

                    <span className="block font-mono text-sm font-semibold text-white">

                        {match.matchId}

                    </span>

                </button>

            </div>

        </div>

    );

}

export default MatchHeader;
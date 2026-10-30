import { useState } from "react";
import toast from "react-hot-toast";

import { Spinner } from "../auth/fields";

import { startSecondInnings } from "../../services/matchService";

const prettyName = (n = "") => n.replace(/_/g, " ");

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

function Highlight({ label, name, detail }) {

    return (

        <div className="rounded-lg bg-zinc-900/60 px-3 py-2">

            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">

                {label}

            </p>

            <p className="truncate font-semibold text-white">

                {name ? prettyName(name) : "—"}

            </p>

            <p className="text-sm text-zinc-400">

                {detail}

            </p>

        </div>

    );

}

function InningsBreakCard({
    match,
    refreshMatch
}) {

    const [loading, setLoading] = useState(false);

    const chasingTeam =
        match.currentBattingTeam === match.teamA.id
            ? match.teamA
            : match.teamB;

    const firstInningsTeam =
        chasingTeam.id === match.teamA.id
            ? match.teamB
            : match.teamA;

    const handleStartSecondInnings = async () => {

        if (loading) return;

        try {

            setLoading(true);

            await startSecondInnings(match.matchId);

            toast.success("Second innings started.");

            await refreshMatch();

        } catch (err) {

            console.error(err);

            toast.error(
                err.response?.data?.error ||
                "Failed to start second innings."
            );

        } finally {

            setLoading(false);

        }

    };

    // --------------------------------------------------
    // Display only: summary of the first innings
    // --------------------------------------------------

    const firstOvers = match.firstInningsOvers ?? [];

    const ballsBowled = firstOvers.reduce(
        (sum, over) => sum + (over.legalDeliveries ?? 0),
        0
    );

    const oversText = `${Math.floor(ballsBowled / 6)}.${ballsBowled % 6}`;

    const topBatter = [...(match.firstInnings?.batting ?? [])]
        .sort((a, b) => b.runs - a.runs)[0];

    const bestBowler = [...(match.firstInnings?.bowling ?? [])]
        .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];

    const requiredRate =
        match.target && match.overs
            ? match.target / match.overs
            : null;

    return (

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

            {/* Header */}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

                <div>

                    <h2 className="text-2xl font-bold text-white">
                        Innings Break
                    </h2>

                    <p className="mt-1 text-zinc-400">
                        First innings completed.
                    </p>

                </div>

                <span className="rounded-full bg-orange-500/15 px-4 py-2 font-semibold text-orange-400">
                    Target {match.target}
                </span>

            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">

                {/* First innings */}

                <div className="rounded-xl bg-zinc-800 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        First innings
                    </p>

                    <h3 className="mt-2 truncate text-lg font-semibold text-white">
                        {firstInningsTeam.name}
                    </h3>

                    <p className="mt-1 text-4xl font-bold tabular-nums text-white">

                        {firstInningsTeam.score}
                        <span className="text-2xl font-semibold text-zinc-500">
                            /{firstInningsTeam.wickets}
                        </span>

                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                        {oversText} overs
                    </p>

                    {(topBatter || bestBowler) && (

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">

                            {topBatter && (
                                <Highlight
                                    label="Top scorer"
                                    name={topBatter.batsmanName}
                                    detail={`${topBatter.runs} (${topBatter.balls})`}
                                />
                            )}

                            {bestBowler && (
                                <Highlight
                                    label="Best bowler"
                                    name={bestBowler.bowlerName}
                                    detail={`${bestBowler.wickets}/${bestBowler.runs} · ${bestBowler.overs} ov`}
                                />
                            )}

                        </div>

                    )}

                </div>

                {/* The chase */}

                <div className="flex flex-col justify-center rounded-xl border border-green-500/30 bg-green-500/10 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-green-400/80">
                        The chase
                    </p>

                    <p className="mt-2 text-lg text-green-300">

                        <span className="font-bold text-white">
                            {chasingTeam.name}
                        </span>

                        {" "}need{" "}

                        <span className="text-3xl font-bold text-white">
                            {match.target}
                        </span>

                        {" "}runs to win.

                    </p>

                    <p className="mt-3 text-sm text-zinc-400">

                        {match.overs} overs available

                        {requiredRate != null && (
                            <span> · Required rate {requiredRate.toFixed(2)}</span>
                        )}

                    </p>

                </div>

            </div>

            <button
                type="button"
                onClick={handleStartSecondInnings}
                disabled={loading}
                className={`flex h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-green-500 text-lg font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
            >

                {loading && <Spinner />}

                {
                    loading
                        ? "Starting..."
                        : "Start Second Innings"
                }

            </button>

        </div>

    );

}

export default InningsBreakCard;
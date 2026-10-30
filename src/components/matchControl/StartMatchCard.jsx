import { useState } from "react";
import toast from "react-hot-toast";

import { Spinner } from "../auth/fields";

import { startMatch } from "../../services/matchService";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

function TeamLogo({ src, name }) {

    const [failed, setFailed] = useState(false);

    if (!src || failed) {

        return (

            <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-lg font-bold text-green-400"
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
            className="h-12 w-12 shrink-0 rounded-full bg-zinc-800 object-cover"
        />

    );

}

function Side({ label, team, tone }) {

    return (

        <div className="rounded-xl bg-zinc-800 p-4">

            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">

                {label}

            </p>

            <div className="mt-3 flex items-center gap-3">

                <TeamLogo src={team.logo} name={team.name} />

                <p className={`min-w-0 text-xl font-semibold ${tone}`}>

                    {team.name}

                </p>

            </div>

        </div>

    );

}

function Check({ children }) {

    return (

        <li className="flex items-center gap-2 text-sm text-zinc-300">

            <span
                aria-hidden="true"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400"
            >

                ✓

            </span>

            {children}

        </li>

    );

}

function StartMatchCard({
    match,
    refreshMatch
}) {

    const [loading, setLoading] = useState(false);

    const handleStartMatch = async () => {

        if (loading) return;

        try {

            setLoading(true);

            await startMatch(match.matchId);

            toast.success("Match started successfully.");

            await refreshMatch();

        } catch (err) {

            console.error(err);

            toast.error(
                err.response?.data?.error ||
                "Failed to start match."
            );

        } finally {

            setLoading(false);

        }

    };

    const battingFirst =
        match.currentBattingTeam === match.teamA.id
            ? match.teamA
            : match.teamB;

    const bowlingFirst =
        match.currentBowlingTeam === match.teamA.id
            ? match.teamA
            : match.teamB;

    // The toss winner can arrive as a team id or a team name
    const tossWinner = [match.teamA, match.teamB].find(
        (team) =>
            team.id === match.tossWinner ||
            team.name === match.tossWinner
    );

    return (

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

            <h2 className="text-2xl font-bold text-white">

                Ready to Start Match

            </h2>

            <p className="mt-1 text-zinc-400">

                Check the details below, then start the match.

            </p>

            {/* Who bats first */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">

                <Side
                    label="Batting first"
                    team={battingFirst}
                    tone="text-green-400"
                />

                <Side
                    label="Bowling first"
                    team={bowlingFirst}
                    tone="text-blue-400"
                />

            </div>

            {/* Recap */}

            <ul className="mt-5 space-y-2 rounded-xl border border-zinc-800 p-4">

                <Check>

                    Toss completed
                    {tossWinner && (
                        <span className="text-zinc-400">
                            {" "}· {tossWinner.name} elected to{" "}
                            {match.tossDecision === "BAT" ? "bat" : "bowl"}
                        </span>
                    )}

                </Check>

                <Check>

                    Playing XI selected for both teams

                </Check>

                <li className="flex items-center gap-2 pl-7 text-sm text-zinc-500">

                    {match.overs} overs per side · max {match.maxOversPerBowler} per bowler

                </li>

            </ul>

            <p className="mt-4 text-sm text-zinc-500">

                Next you'll pick the opening batsmen and the first bowler.

            </p>

            <button
                type="button"
                onClick={handleStartMatch}
                disabled={loading}
                className={`mt-6 flex h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-green-500 text-lg font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
            >

                {loading && <Spinner />}

                {
                    loading
                        ? "Starting Match..."
                        : "Start Match"
                }

            </button>

        </div>

    );

}

export default StartMatchCard;
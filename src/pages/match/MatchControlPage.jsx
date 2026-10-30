import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getMatchDetails, conductToss } from "../../services/matchService";

// Components 
import MatchHeader from "../../components/matchControl/MatchHeader";
import TossCard from "../../components/matchControl/TossCard";
import PlayingXICard from "../../components/matchControl/PlayingXICard";
import StartMatchCard from "../../components/matchControl/StartMatchCard";
import BatsmenSelectionCard from "../../components/matchControl/BatsmenSelectionCard";
import BowlerSelectionCard from "../../components/matchControl/BowlerSelectionCard";
import CompactScorecard from "../../components/scoring/CompactScorecard";
import BallControls from "../../components/scoring/BallControls";
import MatchControlsCard from "../../components/matchControl/MatchControlsCard";
import InningsBreakCard from "../../components/matchControl/InningsBreakCard";

const prettyName = (n = "") => n.replace(/_/g, " ");

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

// --------------------------------------------------
// Match finished (completed / cancelled / abandoned)
// --------------------------------------------------

function ScoreRow({ team, dim = false }) {

    return (

        <div className="flex items-center justify-between gap-4">

            <div className="flex min-w-0 items-center gap-3">

                {team.logo ? (
                    <img
                        src={team.logo}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full bg-zinc-800 object-cover"
                    />
                ) : (
                    <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/15 font-bold text-green-400"
                    >
                        {team.name?.[0]?.toUpperCase()}
                    </span>
                )}

                <p className={`truncate font-semibold ${dim ? "text-zinc-400" : "text-white"}`}>
                    {team.name}
                </p>

            </div>

            <p className={`text-2xl font-bold tabular-nums ${dim ? "text-zinc-400" : "text-white"}`}>

                {team.score}
                <span className="text-lg font-medium text-zinc-500">
                    /{team.wickets}
                </span>

            </p>

        </div>

    );

}

function FinishedCard({ match }) {

    const completed = match.status === "COMPLETED";

    const title =
        completed
            ? "Match completed"
            : match.status === "CANCELLED"
                ? "Match cancelled"
                : "Match abandoned";

    const titleStyle =
        completed
            ? "text-green-400"
            : "text-red-400";

    return (

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8">

            <p className={`text-sm font-semibold uppercase tracking-wider ${titleStyle}`}>

                {title}

            </p>

            {match.result ? (

                <p className="mt-2 text-2xl font-bold text-white">

                    {match.result}

                </p>

            ) : !completed ? (

                <p className="mt-2 text-zinc-300">

                    Scoring has stopped for this match. Nothing more can be recorded.

                </p>

            ) : null}

            <div className="mt-6 space-y-4 rounded-xl bg-zinc-800 p-5">

                <ScoreRow team={match.teamA} />

                <ScoreRow team={match.teamB} />

            </div>

            {completed && match.manOfTheMatch && (

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-800 py-1 pl-1 pr-4">

                    {match.manOfTheMatch.image && (
                        <img
                            src={match.manOfTheMatch.image}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover"
                        />
                    )}

                    <span className="text-sm text-zinc-400">Man of the match</span>

                    <span className="text-sm font-semibold text-white">
                        {prettyName(match.manOfTheMatch.name)}
                    </span>

                </div>

            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                <Link
                    to={`/match/${match.matchId}`}
                    className={`rounded-lg bg-green-500 px-5 py-3 text-center font-semibold text-black transition hover:bg-green-400 ${focusRing}`}
                >

                    View full scorecard

                </Link>

                <Link
                    to="/dashboard/matches"
                    className={`rounded-lg border border-zinc-700 px-5 py-3 text-center font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white ${focusRing}`}
                >

                    Back to my matches

                </Link>

            </div>

        </div>

    );

}

// --------------------------------------------------
// Page
// --------------------------------------------------

function MatchControlPage() {

    const { matchId } = useParams();

    const [match, setMatch] = useState(null);

    const [loading, setLoading] = useState(true);

    const [loadError, setLoadError] = useState(false);

    const [tossSaving, setTossSaving] = useState(false);

    const fetchMatch = useCallback(async () => {

        try {

            const data = await getMatchDetails(matchId);

            setMatch(data);

            setLoadError(false);

        } catch (err) {

            console.error(err);

            setLoadError(true);

            toast.error("Failed to load match");

        } finally {

            setLoading(false);

        }

    }, [matchId]);

    //handlers
    const handleConductToss = async (winner, decision) => {

        if (tossSaving) return;

        try {

            setTossSaving(true);

            await conductToss(
                matchId,
                winner,
                decision
            );

            toast.success("Toss conducted successfully.");

            await fetchMatch();

        } catch (err) {

            toast.error(
                err.response?.data?.error ||
                "Failed to conduct toss."
            );

        } finally {

            setTossSaving(false);

        }

    };

    const retry = () => {

        setLoading(true);

        fetchMatch();

    };

    useEffect(() => {

        // A different match was opened: don't show the previous one meanwhile
        setMatch(null);

        setLoading(true);

        fetchMatch();

    }, [fetchMatch]);

    if (loading) {

        return (

            <div className="min-h-screen bg-black">

                <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">

                    <div className="h-40 animate-pulse rounded-2xl bg-zinc-900" />

                    <div className="h-64 animate-pulse rounded-2xl bg-zinc-900" />

                </div>

            </div>

        );

    }

    if (!match) {

        return (

            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white">

                <p className="text-xl font-semibold">

                    {loadError ? "Couldn't load this match" : "Match not found"}

                </p>

                <p className="text-zinc-400">

                    {loadError
                        ? "Check your connection and try again."
                        : "It may have been removed, or you may not be its scorer."}

                </p>

                <div className="flex gap-3">

                    {loadError && (

                        <button
                            type="button"
                            onClick={retry}
                            className={`rounded-lg bg-zinc-800 px-5 py-2 font-medium transition hover:bg-zinc-700 ${focusRing}`}
                        >

                            Try again

                        </button>

                    )}

                    <Link
                        to="/dashboard/matches"
                        className={`rounded-lg px-5 py-2 font-medium text-zinc-400 transition hover:text-white ${focusRing}`}
                    >

                        Back to my matches

                    </Link>

                </div>

            </div>

        );

    }

    const innings =
        match.currentInnings === 1
            ? match.firstInnings
            : match.secondInnings;

    const inningsOvers =
        match.currentInnings === 1
            ? match.firstInningsOvers
            : match.secondInningsOvers;

    const completedOvers =
        inningsOvers?.filter(
            over => over.legalDeliveries >= 6
        ).length ?? 0;

    const inningsCompleted =
        completedOvers >= match.overs ||
        innings?.wickets >= 10;

    const batsmenSelected =
        Boolean(
            innings?.strikerId &&
            innings?.nonStrikerId
        );

    const bowlerSelected =
        Boolean(
            innings?.currentBowlerId
        );

    const finished =
        match.status === "COMPLETED" ||
        match.status === "CANCELLED" ||
        match.status === "ABANDONED";

    return (

        <div className="min-h-screen bg-black text-white">

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">

                <MatchHeader match={match} />

                {/* Scheduled */}
                {
                    match.status === "SCHEDULED" && (

                        <TossCard
                            match={match}
                            loading={tossSaving}
                            onConductToss={handleConductToss}
                        />

                    )
                }

                {/* Toss completed */}
                {
                    match.status === "TOSS_COMPLETED" && (

                        <PlayingXICard
                            match={match}
                            refreshMatch={fetchMatch}
                        />

                    )
                }

                {/* Playing XI selected */}
                {
                    match.status === "PLAYING_XI_SELECTED" && (

                        <StartMatchCard
                            match={match}
                            refreshMatch={fetchMatch}
                        />

                    )
                }
                {/* Innings Break */}
                {
                    match.status === "INNINGS_BREAK" && (

                        <InningsBreakCard
                            match={match}
                            refreshMatch={fetchMatch}
                        />

                    )
                }

                {/* Completed / Cancelled / Abandoned */}
                {
                    finished && (

                        <FinishedCard match={match} />

                    )
                }

                {
                    (
                        match.status === "LIVE_FIRST_INNINGS" ||
                        match.status === "LIVE_SECOND_INNINGS"
                    ) && (

                        inningsCompleted ? (

                            <div className="space-y-6">

                                <CompactScorecard
                                    match={match}
                                />

                                <MatchControlsCard
                                    match={match}
                                    refreshMatch={fetchMatch}
                                />

                            </div>

                        ) : !batsmenSelected ? (

                            <BatsmenSelectionCard
                                match={match}
                                refreshMatch={fetchMatch}
                            />

                        ) : !bowlerSelected ? (

                            <BowlerSelectionCard
                                match={match}
                                refreshMatch={fetchMatch}
                            />

                        ) : (

                            <div className="grid gap-6 lg:grid-cols-3">

                                <div className="lg:col-span-1">
                                    <CompactScorecard match={match} />
                                </div>

                                <div className="space-y-6 lg:col-span-2">

                                    <MatchControlsCard
                                        match={match}
                                        refreshMatch={fetchMatch}
                                    />

                                    <BallControls
                                        match={match}
                                        refreshMatch={fetchMatch}
                                    />

                                </div>

                            </div>

                        )

                    )
                }

            </div>

        </div>

    );

}

export default MatchControlPage;
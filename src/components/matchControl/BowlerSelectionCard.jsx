import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PlayerSelectionCard from "./PlayerSelectionCard";
import { Spinner } from "../auth/fields";

import {
    getPlayingXI,
    setBowler
} from "../../services/matchService";

import {
    getTeamSquad
} from "../../services/teamService";

const prettyName = (n = "") => n.replace(/_/g, " ");

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

function Stat({ label, value }) {

    return (

        <div className="rounded-xl bg-zinc-800 px-4 py-3">

            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">

                {label}

            </p>

            <p className="mt-1 text-lg font-semibold tabular-nums text-white">

                {value}

            </p>

        </div>

    );

}

function BowlerSelectionCard({
    match,
    refreshMatch
}) {

    const [players, setPlayers] = useState([]);

    const [selectedBowler, setSelectedBowler] = useState(null);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState(false);

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

    //------------------------------------
    // Returns overs bowled by a bowler
    //------------------------------------

    const getOversBowled = (bowlerId) => {

        if (!innings?.bowling) {

            return 0;

        }

        const stats = innings.bowling.find(
            b => b.bowlerId === bowlerId
        );

        return stats?.overs ?? 0;

    };

    //------------------------------------
    // Last completed over bowler
    //------------------------------------

    const getLastCompletedOverBowler = () => {

        if (!inningsOvers?.length) {

            return null;

        }

        const completed = [...inningsOvers]
            .reverse()
            .find(over => over.legalDeliveries >= 6);

        return completed?.bowlerId ?? null;

    };

    const lastOverBowlerId =
        getLastCompletedOverBowler();

    const lastOverBowlerName =
        innings?.bowling?.find(
            b => b.bowlerId === lastOverBowlerId
        )?.bowlerName;

    //------------------------------------
    // Maximum overs reached?
    //------------------------------------

    const hasReachedQuota = (bowlerId) => {

        if (match.maxOversPerBowler <= 0) {

            return false;

        }

        return (
            getOversBowled(bowlerId) >=
            match.maxOversPerBowler
        );

    };

    //------------------------------------
    // Consecutive over restriction
    //------------------------------------

    const bowledPreviousOver = (bowlerId) => {

        return bowlerId === lastOverBowlerId;

    };

    //------------------------------------
    // Load eligible bowlers
    //------------------------------------

    const loadBowlers = async () => {

        try {

            setLoading(true);

            setError(false);

            //------------------------------------
            // Playing XI
            //------------------------------------

            const playingXI =
                await getPlayingXI(match.matchId);

            const bowlingPlayingXI =
                match.currentBowlingTeam === match.teamA.id
                    ? playingXI.teamAPlayers
                    : playingXI.teamBPlayers;

            //------------------------------------
            // Full Squad
            //------------------------------------

            const squad =
                await getTeamSquad(
                    match.currentBowlingTeam
                );

            //------------------------------------
            // Playing XI only
            //------------------------------------

            const playingPlayers =
                squad.filter(player =>
                    bowlingPlayingXI.includes(
                        player.userId
                    )
                );

            //------------------------------------
            // Only Bowlers & All-Rounders
            //------------------------------------

            const eligiblePlayers =
                playingPlayers.filter(player =>
                    player.role === "BOWLER" ||
                    player.role === "ALL_ROUNDER"
                );

            //------------------------------------
            // Sort bowlers first, all-rounders next
            //------------------------------------

            eligiblePlayers.sort((a, b) => {

                if (a.role === b.role) {

                    return a.name.localeCompare(b.name);

                }

                if (a.role === "BOWLER") {

                    return -1;

                }

                return 1;

            });

            setPlayers(eligiblePlayers);

        } catch (err) {

            console.error(err);

            setError(true);

            toast.error(
                "Failed to load bowling options."
            );

        } finally {

            setLoading(false);

        }

    };

    //------------------------------------
    // Load bowlers whenever innings changes
    //------------------------------------

    useEffect(() => {

        loadBowlers();

    }, [
        match.matchId,
        match.currentBowlingTeam,
        match.currentInnings
    ]);

    //------------------------------------
    // Select Bowler
    //------------------------------------

    const selectBowler = (player) => {

        //------------------------------------
        // Cannot bowl consecutive overs
        //------------------------------------

        if (bowledPreviousOver(player.userId)) {

            toast.error(
                "This bowler delivered the previous over."
            );

            return;

        }

        //------------------------------------
        // Maximum overs reached
        //------------------------------------

        if (hasReachedQuota(player.userId)) {

            toast.error(
                "This bowler has completed the maximum allowed overs."
            );

            return;

        }

        //------------------------------------
        // Select
        //------------------------------------

        setSelectedBowler(player);

    };

    //------------------------------------
    // Disabled?
    //------------------------------------

    const isDisabled = (player) => {

        return (
            bowledPreviousOver(player.userId) ||
            hasReachedQuota(player.userId)
        );

    };

    //------------------------------------
    // Disabled reason
    //------------------------------------

    const getDisabledReason = (player) => {

        if (bowledPreviousOver(player.userId)) {

            return "Previous Over";

        }

        if (hasReachedQuota(player.userId)) {

            return "Quota Completed";

        }

        return "";

    };

    //------------------------------------
    // Figures shown on each row (display only)
    //------------------------------------

    const bowlingInfo = (userId) => {

        const stats = innings?.bowling?.find(
            b => b.bowlerId === userId
        );

        const max =
            match.maxOversPerBowler > 0
                ? `/${match.maxOversPerBowler}`
                : "";

        return stats
            ? `${stats.overs}${max} ov · ${stats.runs}/${stats.wickets}`
            : `0${max} ov · yet to bowl`;

    };

    //------------------------------------
    // Confirm Bowler
    //------------------------------------

    const handleConfirm = async () => {

        if (saving) {

            return;

        }

        if (!selectedBowler) {

            toast.error(
                "Select a bowler."
            );

            return;

        }

        try {

            setSaving(true);

            await setBowler(
                match.matchId,
                {
                    bowlerId:
                        selectedBowler.userId
                }
            );

            toast.success(
                `${selectedBowler.name} will bowl this over.`
            );

            await refreshMatch();

        } catch (err) {

            console.error(err);

            toast.error(

                err.response?.data?.error ??

                "Failed to set bowler."

            );

        } finally {

            setSaving(false);

        }

    };

    //------------------------------------
    // Loading
    //------------------------------------

    if (loading) {

        return (

            <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

                <div className="h-8 w-56 animate-pulse rounded-lg bg-zinc-800" />

                <div className="grid grid-cols-3 gap-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-800" />
                    ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-800" />
                    ))}
                </div>

            </div>

        );

    }

    return (

        <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

            <div>

                <h2 className="text-2xl font-bold text-white">

                    Select Bowler

                </h2>

                <p className="mt-1 text-zinc-400">

                    Choose the bowler for

                    <span className="font-semibold text-white">

                        {" "}Over {completedOvers + 1}

                    </span>

                </p>

            </div>

            <div className="grid grid-cols-3 gap-2">

                <Stat label="Innings" value={match.currentInnings} />

                <Stat label="Over" value={`${completedOvers + 1} / ${match.overs}`} />

                <Stat label="Max / bowler" value={match.maxOversPerBowler} />

            </div>

            {
                lastOverBowlerId && (

                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">

                        <p className="text-sm text-yellow-300">

                            {lastOverBowlerName ? (
                                <>
                                    <span className="font-semibold">
                                        {prettyName(lastOverBowlerName)}
                                    </span>{" "}
                                    bowled the previous over and can't bowl again straight away.
                                </>
                            ) : (
                                "The bowler who delivered the previous completed over cannot bowl consecutively."
                            )}

                        </p>

                    </div>

                )
            }

            {
                error ? (

                    <div className="rounded-xl bg-zinc-800 p-6 text-center">

                        <p className="mb-4 text-red-400">
                            Couldn't load the bowling options.
                        </p>

                        <button
                            type="button"
                            onClick={loadBowlers}
                            className={`rounded-lg bg-zinc-700 px-5 py-2 font-medium transition hover:bg-zinc-600 ${focusRing}`}
                        >
                            Try again
                        </button>

                    </div>

                ) : players.length === 0 ? (

                    <div className="rounded-xl bg-zinc-800 p-6 text-center text-zinc-400">

                        No eligible bowlers available.

                    </div>

                ) : (

                    <div className="grid gap-3 sm:grid-cols-2">

                        {
                            players.map(player => (

                                <PlayerSelectionCard
                                    key={player.userId}
                                    player={player}
                                    selected={
                                        selectedBowler?.userId ===
                                        player.userId
                                    }
                                    disabled={
                                        isDisabled(player)
                                    }
                                    badge={
                                        selectedBowler?.userId ===
                                        player.userId
                                            ? "SELECTED"
                                            : isDisabled(player)
                                                ? getDisabledReason(player)
                                                : ""
                                    }
                                    subtitle={bowlingInfo(player.userId)}
                                    onClick={() =>
                                        selectBowler(player)
                                    }
                                />

                            ))
                        }

                    </div>

                )
            }

            <div className="sticky bottom-0 -mx-5 -mb-5 rounded-b-2xl border-t border-zinc-800 bg-zinc-900/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">

                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={
                        saving ||
                        !selectedBowler
                    }
                    className={`flex h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-green-500 text-lg font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 ${focusRing}`}
                >

                    {saving && <Spinner />}

                    {
                        saving
                            ? "Setting Bowler..."
                            : selectedBowler
                                ? `Confirm ${prettyName(selectedBowler.name)}`
                                : "Select a Bowler"
                    }

                </button>

            </div>

        </div>

    );

}

export default BowlerSelectionCard;
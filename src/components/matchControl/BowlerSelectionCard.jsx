import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PlayerSelectionCard from "./PlayerSelectionCard";

import {
    getPlayingXI,
    setBowler
} from "../../services/matchService";

import {
    getTeamSquad
} from "../../services/teamService";

function BowlerSelectionCard({
    match,
    refreshMatch
}) {

    const [players, setPlayers] = useState([]);

    const [selectedBowler, setSelectedBowler] = useState(null);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

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
    // Confirm Bowler
    //------------------------------------

    const handleConfirm = async () => {

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

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">

                Loading Bowling Team...

            </div>

        );

    }
        return (

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">

            <div>

                <h2 className="text-2xl font-bold">

                    Select Bowler

                </h2>

                <p className="text-zinc-400 mt-1">

                    Choose the bowler for

                    <span className="font-semibold text-white">

                        {" "}Over {completedOvers + 1}

                    </span>

                </p>

            </div>

            <div className="grid md:grid-cols-3 gap-4">

                <div className="rounded-xl bg-zinc-800 p-4">

                    <p className="text-sm text-zinc-400">

                        Current Innings

                    </p>

                    <p className="font-semibold text-lg mt-2">

                        {match.currentInnings}

                    </p>

                </div>

                <div className="rounded-xl bg-zinc-800 p-4">

                    <p className="text-sm text-zinc-400">

                        Over

                    </p>

                    <p className="font-semibold text-lg mt-2">

                        {completedOvers + 1} / {match.overs}

                    </p>

                </div>

                <div className="rounded-xl bg-zinc-800 p-4">

                    <p className="text-sm text-zinc-400">

                        Max Overs / Bowler

                    </p>

                    <p className="font-semibold text-lg mt-2">

                        {match.maxOversPerBowler}

                    </p>

                </div>

            </div>

            {
                lastOverBowlerId && (

                    <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4">

                        <p className="text-yellow-300 text-sm">

                            The bowler who delivered the previous completed over
                            cannot bowl consecutively.

                        </p>

                    </div>

                )
            }

            <div className="grid gap-3">
                                {
                    players.length === 0 ? (

                        <div className="rounded-xl bg-zinc-800 p-6 text-center text-zinc-400">

                            No eligible bowlers available.

                        </div>

                    ) : (

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
                                            : player.role
                                }
                                subtitle={`Overs: ${getOversBowled(player.userId)}`}
                                onClick={() =>
                                    selectBowler(player)
                                }
                            />

                        ))

                    )
                }

            </div>
                        <button
                onClick={handleConfirm}
                disabled={
                    saving ||
                    !selectedBowler
                }
                className="
                    w-full
                    rounded-xl
                    bg-green-600
                    hover:bg-green-700
                    disabled:bg-zinc-700
                    disabled:cursor-not-allowed
                    py-4
                    text-lg
                    font-semibold
                    transition
                "
            >

                {
                    saving
                        ? "Setting Bowler..."
                        : selectedBowler
                            ? `Confirm ${selectedBowler.name}`
                            : "Select a Bowler"
                }

            </button>

        </div>

    );

}

export default BowlerSelectionCard;

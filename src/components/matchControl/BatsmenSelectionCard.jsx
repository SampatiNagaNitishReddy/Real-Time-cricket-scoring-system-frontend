import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PlayerSelectionCard from "./PlayerSelectionCard";
import { Spinner } from "../auth/fields";

import {
    getPlayingXI,
    setBatsmen
} from "../../services/matchService";

import {
    getTeamSquad
} from "../../services/teamService";

const prettyName = (n = "") => n.replace(/_/g, " ");

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

function Slot({ label, player, striker = false, locked = false }) {

    return (

        <div
            className={`
                rounded-xl px-4 py-3
                ${player
                    ? striker
                        ? "bg-green-500/10 ring-1 ring-green-500/30"
                        : "bg-zinc-800"
                    : "border border-dashed border-zinc-700"
                }
            `}
        >

            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">

                {striker && player && (
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                )}

                {label}

                {locked && (
                    <span className="ml-auto rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] normal-case tracking-normal text-yellow-300">
                        Not out
                    </span>
                )}

            </p>

            <p className={`mt-1 truncate text-lg font-semibold ${player ? "text-white" : "text-zinc-600"}`}>

                {player ? prettyName(player.name) : "Not selected"}

            </p>

            {player && (
                <p className="truncate text-xs text-zinc-500">
                    {player.userId}
                </p>
            )}

        </div>

    );

}

function BatsmenSelectionCard({
    match,
    refreshMatch
}) {

    const [players, setPlayers] = useState([]);

    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const [survivingBatsman, setSurvivingBatsman] = useState(null);
    const innings =
        match.currentInnings === 1
            ? match.firstInnings
            : match.secondInnings;

    const survivingRole =
        innings?.strikerId
            ? "STRIKER"
            : innings?.nonStrikerId
                ? "NON_STRIKER"
                : null;

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState(false);

    const isOpeningPair =
        !innings?.strikerId &&
        !innings?.nonStrikerId;

    useEffect(() => {

        loadBattingPlayingXI();

    }, [
        match.matchId,
        match.currentBattingTeam,
        match.currentInnings
    ]);

    const loadBattingPlayingXI = async () => {

        try {

            setLoading(true);

            setError(false);

            // Fetch Playing XI
            const playingXI =
                await getPlayingXI(match.matchId);

            // Batting team's Playing XI
            const battingPlayingXI =
                match.currentBattingTeam === match.teamA.id
                    ? playingXI.teamAPlayers
                    : playingXI.teamBPlayers;

            // Full squad
            const squad =
                await getTeamSquad(
                    match.currentBattingTeam
                );

            // Filter Playing XI
            const availablePlayers =
                squad.filter(player =>
                    battingPlayingXI.includes(
                        player.userId
                    )
                );

            setPlayers(availablePlayers);

            //------------------------------------
            // Detect existing not-out batsman
            //------------------------------------

            const survivingBatsmanId =
                innings?.strikerId ??
                innings?.nonStrikerId ??
                null;

            if (!survivingBatsmanId) {

                setSurvivingBatsman(null);

                // Opening pair
                // Clear selection only if user hasn't started selecting
                if (selectedPlayers.length === 0) {

                    setSelectedPlayers([]);

                }

                return;

            }

            const player =
                availablePlayers.find(
                    p => p.userId === survivingBatsmanId
                );

            setSurvivingBatsman(player ?? null);

            // Pre-select existing batsman only once.
            setSelectedPlayers(prev => {

                if (prev.length > 0) {

                    return prev;

                }

                return player
                    ? [player]
                    : [];

            });

        } catch (err) {

            console.error(err);

            setError(true);

            toast.error(
                "Failed to load Playing XI."
            );

        } finally {

            setLoading(false);

        }

    };
    const togglePlayer = (player) => {

        // Check if already selected
        const alreadySelected =
            selectedPlayers.some(
                p => p.userId === player.userId
            );

        // Deselect player
        if (alreadySelected) {
            if (
                survivingBatsman &&
                survivingBatsman.userId === player.userId
            ) {

                toast.error(
                    "Existing not-out batsman must remain selected."
                );

                return;

            }

            setSelectedPlayers(prev =>
                prev.filter(
                    p => p.userId !== player.userId
                )
            );

            return;

        }

        // Maximum two batsmen
        if (selectedPlayers.length >= 2) {

            toast.error(
                "Only two batsmen can be selected."
            );

            return;

        }

        // Add player
        setSelectedPlayers(prev => [

            ...prev,

            player

        ]);

    };
    const swapBatsmen = () => {

        if (selectedPlayers.length !== 2) {

            return;

        }

        setSelectedPlayers([
            selectedPlayers[1],
            selectedPlayers[0]
        ]);

    };

    const validateSelection = () => {

        if (selectedPlayers.length !== 2) {

            toast.error(
                "Select exactly two batsmen."
            );

            return false;

        }

        if (
            survivingBatsman &&
            !selectedPlayers.some(
                p =>
                    p.userId ===
                    survivingBatsman.userId
            )
        ) {

            toast.error(
                "Existing not-out batsman must remain at the crease."
            );

            return false;

        }

        return true;

    };
    const handleConfirm = async () => {

        if (saving) {

            return;

        }

        if (!validateSelection()) {

            return;

        }

        try {

            setSaving(true);

            await setBatsmen(
                match.matchId,
                {
                    strikerId:
                        selectedPlayers[0].userId,

                    nonStrikerId:
                        selectedPlayers[1].userId
                }
            );

            toast.success(

                isOpeningPair
                    ? "Opening batsmen selected."
                    : "Batsmen updated successfully."

            );

            await refreshMatch();

        } catch (err) {

            console.error(err);

            toast.error(

                err.response?.data?.error ??

                "Failed to set batsmen."

            );

        } finally {

            setSaving(false);

        }

    };

    // --------------------------------------------------
    // Display helpers (nothing here is sent to the backend)
    // --------------------------------------------------

    const battingEntry = (userId) =>
        innings?.batting?.find(b => b.batsmanId === userId);

    const battingInfo = (userId) => {

        const entry = battingEntry(userId);

        if (!entry) return "Yet to bat";

        return `${entry.runs} (${entry.balls}) · ${entry.dismissal ?? "not out"}`;

    };

    const badgeFor = (player) => {

        if (selectedPlayers[0]?.userId === player.userId) return "STRIKER";

        if (selectedPlayers[1]?.userId === player.userId) return "NON-STRIKER";

        if (battingEntry(player.userId)?.dismissal) return "OUT";

        return "";

    };

    const isLocked = (player) =>
        Boolean(player) && survivingBatsman?.userId === player.userId;

    const hint =
        selectedPlayers.length === 2
            ? `Striker: ${prettyName(selectedPlayers[0].name)} · Non-striker: ${prettyName(selectedPlayers[1].name)}`
            : selectedPlayers.length === 1
                ? survivingBatsman
                    ? "Now pick the new batsman."
                    : "Now pick the non-striker."
                : "Pick the striker first, then the non-striker.";

    if (loading) {

        return (

            <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

                <div className="h-8 w-64 animate-pulse rounded-lg bg-zinc-800" />

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="h-20 animate-pulse rounded-xl bg-zinc-800" />
                    <div className="h-20 animate-pulse rounded-xl bg-zinc-800" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {[...Array(6)].map((_, i) => (
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

                    {
                        isOpeningPair
                            ? "Select Opening Batsmen"
                            : "Select New Batsman"
                    }

                </h2>

                <p className="mt-1 text-zinc-400">

                    First selected player will be the
                    <span className="font-semibold text-white">
                        {" "}Striker
                    </span>
                    {" "}and second selected player will be the
                    <span className="font-semibold text-white">
                        {" "}Non-Striker
                    </span>.

                </p>

            </div>

            {
                survivingBatsman && (

                    <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4">

                        <p className="text-sm text-yellow-300">

                            Current {survivingRole === "STRIKER"
                                ? "Striker"
                                : "Non-Striker"}

                        </p>

                        <p className="mt-1 text-lg font-semibold text-white">

                            {prettyName(survivingBatsman.name)}

                        </p>

                        <p className="mt-1 text-xs text-zinc-400">

                            Keep this player in the batting pair.

                        </p>

                    </div>

                )
            }

            <div className="grid gap-3 sm:grid-cols-2">

                <Slot
                    striker
                    label="Striker"
                    player={selectedPlayers[0]}
                    locked={isLocked(selectedPlayers[0])}
                />

                <Slot
                    label="Non-Striker"
                    player={selectedPlayers[1]}
                    locked={isLocked(selectedPlayers[1])}
                />

            </div>

            {
                selectedPlayers.length === 2 && (

                    <button
                        type="button"
                        onClick={swapBatsmen}
                        disabled={saving}
                        className={`w-full touch-manipulation rounded-xl border border-zinc-700 py-3 font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50 ${focusRing}`}
                    >

                        ⇄ Swap Striker & Non-Striker

                    </button>

                )
            }

            {
                error ? (

                    <div className="rounded-xl bg-zinc-800 p-6 text-center">

                        <p className="mb-4 text-red-400">
                            Couldn't load the Playing XI.
                        </p>

                        <button
                            type="button"
                            onClick={loadBattingPlayingXI}
                            className={`rounded-lg bg-zinc-700 px-5 py-2 font-medium transition hover:bg-zinc-600 ${focusRing}`}
                        >
                            Try again
                        </button>

                    </div>

                ) : players.length === 0 ? (

                    <div className="rounded-xl bg-zinc-800 p-6 text-center text-zinc-400">

                        No players found in the batting Playing XI.

                    </div>

                ) : (

                    <div className="grid gap-3 sm:grid-cols-2">

                        {
                            players.map(player => (

                                <PlayerSelectionCard
                                    key={player.userId}
                                    player={player}
                                    selected={
                                        selectedPlayers.some(
                                            p => p.userId === player.userId
                                        )
                                    }
                                    badge={badgeFor(player)}
                                    subtitle={battingInfo(player.userId)}
                                    onClick={togglePlayer}
                                />

                            ))
                        }

                    </div>

                )
            }

            <div className="sticky bottom-0 -mx-5 -mb-5 rounded-b-2xl border-t border-zinc-800 bg-zinc-900/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">

                <p
                    aria-live="polite"
                    className={`mb-3 min-h-5 truncate text-center text-sm ${selectedPlayers.length === 2 ? "font-medium text-white" : "text-zinc-500"}`}
                >

                    {hint}

                </p>

                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={
                        saving ||
                        selectedPlayers.length !== 2
                    }
                    className={`flex h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-green-500 text-lg font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 ${focusRing}`}
                >

                    {saving && <Spinner />}

                    {
                        saving
                            ? "Saving..."
                            : isOpeningPair
                                ? "Confirm Opening Pair"
                                : "Confirm Batsmen"
                    }

                </button>

            </div>

        </div>

    );

}

export default BatsmenSelectionCard;
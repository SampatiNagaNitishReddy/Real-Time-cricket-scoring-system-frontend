import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PlayerSelectionCard from "./PlayerSelectionCard";

import {
    getPlayingXI,
    setBatsmen
} from "../../services/matchService";

import {
    getTeamSquad
} from "../../services/teamService";

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
                    p => p.userId ===survivingBatsmanId
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
    if (loading) {

        return (

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">

                Loading Playing XI...

            </div>

        );

    }

    return (

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">

            <div>

                <h2 className="text-2xl font-bold">

                    {
                        isOpeningPair
                            ? "Select Opening Batsmen"
                            : "Select New Batsman"
                    }

                </h2>

                <p className="text-zinc-400 mt-1">

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

                    <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/40 p-4">

                        <p className="text-sm text-yellow-300">

                            Current {survivingRole === "STRIKER"
                                ? "Striker"
                                : "Non-Striker"}

                        </p>

                        <p className="font-semibold text-lg mt-1">

                            {survivingBatsman.name}

                        </p>

                        <p className="text-xs text-zinc-400 mt-1">

                            Keep this player in the batting pair.

                        </p>

                    </div>

                )
            }

            <div className="grid md:grid-cols-2 gap-4">

                <div className="rounded-xl bg-zinc-800 p-4">

                    <p className="text-sm text-zinc-400">

                        Striker

                    </p>

                    <p className="font-semibold text-lg mt-2">
                        {selectedPlayers[0]?.name ?? "Not Selected"}
                    </p>

                    {
                        selectedPlayers[0] && (
                            <p className="text-xs text-zinc-400">
                                {selectedPlayers[0].userId}
                            </p>
                        )
                    }

                </div>

                <div className="rounded-xl bg-zinc-800 p-4">

                    <p className="text-sm text-zinc-400">

                        Non-Striker

                    </p>

                    <p className="font-semibold text-lg mt-2">

                        {
                            selectedPlayers[1]?.name ??
                            "Not Selected"
                        }

                    </p>

                    {
                        selectedPlayers[1] && (
                            <p className="text-xs text-zinc-400">
                                {selectedPlayers[1].userId}
                            </p>
                        )
                    }


                </div>

            </div>

            {
                selectedPlayers.length === 2 && (

                    <button
                        onClick={swapBatsmen}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 font-semibold transition"
                    >

                        ⇄ Swap Striker & Non-Striker

                    </button>

                )
            }

            <div className="grid gap-3">

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
                            badge={
                                selectedPlayers[0]?.userId === player.userId
                                    ? "STRIKER"
                                    : selectedPlayers[1]?.userId === player.userId
                                        ? "NON-STRIKER"
                                        : ""
                            }
                            onClick={togglePlayer}
                        />

                    ))
                }

            </div>
            <button
                onClick={handleConfirm}
                disabled={
                    saving ||
                    selectedPlayers.length !== 2
                }
                className="w-full rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 py-4 text-lg font-semibold transition"
            >

                {
                    saving
                        ? "Saving..."
                        : isOpeningPair
                            ? "Confirm Opening Pair"
                            : "Confirm Batsmen"
                }

            </button>
        </div>

    );

}

export default BatsmenSelectionCard;
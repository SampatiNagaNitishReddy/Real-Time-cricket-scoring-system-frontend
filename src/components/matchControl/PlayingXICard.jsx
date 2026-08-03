import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import TeamPlayingXI from "./TeamPlayingXI";

import {
    createPlayingXI,
    getPlayingXI,
    updatePlayingXI
} from "../../services/matchService";

import { getTeamSquad } from "../../services/teamService";

function PlayingXICard({
    match,
    refreshMatch
}) {

    const [teamASquad, setTeamASquad] = useState([]);
    const [teamBSquad, setTeamBSquad] = useState([]);

    const [selectedTeamA, setSelectedTeamA] = useState([]);
    const [selectedTeamB, setSelectedTeamB] = useState([]);

    const [playingXIExists, setPlayingXIExists] = useState(false);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    useEffect(() => {

        loadData();

    }, []);

    const loadData = async () => {

        try {

            setLoading(true);

            const [teamAPlayers, teamBPlayers] =
                await Promise.all([

                    getTeamSquad(match.teamA.id),

                    getTeamSquad(match.teamB.id)

                ]);

            setTeamASquad(teamAPlayers);

            setTeamBSquad(teamBPlayers);

            try {

                const playingXI =
                    await getPlayingXI(match.matchId);

                setSelectedTeamA(
                    playingXI.teamAPlayers
                );

                setSelectedTeamB(
                    playingXI.teamBPlayers
                );

                setPlayingXIExists(true);

            } catch {

                setPlayingXIExists(false);

            }

        } catch (err) {

            console.error(err);

            toast.error("Failed to load squads.");

        } finally {

            setLoading(false);

        }

    };

    const toggleTeamA = (userId) => {

        setSelectedTeamA(prev => {

            if (prev.includes(userId)) {

                return prev.filter(id => id !== userId);

            }

            if (prev.length >= 11) {

                return prev;

            }

            return [...prev, userId];

        });

    };

    const toggleTeamB = (userId) => {

        setSelectedTeamB(prev => {

            if (prev.includes(userId)) {

                return prev.filter(id => id !== userId);

            }

            if (prev.length >= 11) {

                return prev;

            }

            return [...prev, userId];

        });

    };

    const handleSave = async () => {

        console.log("========== SAVE PLAYING XI ==========");

        console.log("selectedTeamA:", selectedTeamA);
        console.log("selectedTeamB:", selectedTeamB);

        if (selectedTeamA.length !== 11) {

            toast.error("Select exactly 11 players for Team A");
            return;

        }

        if (selectedTeamB.length !== 11) {

            toast.error("Select exactly 11 players for Team B");
            return;

        }

        try {

            setSaving(true);

            const payload = {
                teamAPlayers: selectedTeamA,
                teamBPlayers: selectedTeamB
            };

            console.log("Payload:");
            console.log(payload);

            console.log("playingXIExists:", playingXIExists);

            if (playingXIExists) {

                console.log("Calling updatePlayingXI...");

                await updatePlayingXI(
                    match.matchId,
                    payload
                );

                toast.success("Playing XI updated successfully.");

            } else {

                console.log("Calling createPlayingXI...");

                await createPlayingXI(
                    match.matchId,
                    payload
                );

                toast.success("Playing XI saved successfully.");

            }

            console.log("Refreshing match...");

            await refreshMatch();

            setPlayingXIExists(true);

        } catch (err) {

            console.error("SAVE ERROR");
            console.error(err);

            console.log("Message:", err.message);
            console.log("Response:", err.response);
            console.log("Response Data:", err.response?.data);

            toast.error(
                err.response?.data ||
                err.message ||
                "Failed to save Playing XI."
            );

        } finally {

            setSaving(false);

        }

    };

    if (loading) {

        return (

            <div className="bg-zinc-900 rounded-2xl p-6 text-center">

                Loading squads...

            </div>

        );

    }

    return (

        <div className="space-y-6">

            <h2 className="text-2xl font-bold">

                Select Playing XI

            </h2>

            <TeamPlayingXI
                teamName={match.teamA.name}
                players={teamASquad}
                selectedPlayers={selectedTeamA}
                onTogglePlayer={toggleTeamA}
            />

            <TeamPlayingXI
                teamName={match.teamB.name}
                players={teamBSquad}
                selectedPlayers={selectedTeamB}
                onTogglePlayer={toggleTeamB}
            />

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 rounded-xl py-4 text-lg font-semibold"
            >

                {
                    saving
                        ? "Saving..."
                        : playingXIExists
                            ? "Update Playing XI"
                            : "Save Playing XI"
                }

            </button>

        </div>

    );

}

export default PlayingXICard;
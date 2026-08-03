import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PlayerSearch from "../../components/user/PlayerSearch";
import { addPlayer, addMultiplePlayers, removePlayer, getTeamSquad } from "../../services/teamService";

function ManageTeamPage() {

    const navigate = useNavigate();

    const { teamId } = useParams();

    const [showAddPlayer, setShowAddPlayer] = useState(false);

    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const [showAddPlayers, setShowAddPlayers] = useState(false);

    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const [loading, setLoading] = useState(false);

    const [squad, setSquad] = useState([]);



    const handleAddPlayer = async () => {

        if (!selectedPlayer) return;

        try {

            setLoading(true);

            await addPlayer(
                teamId,
                selectedPlayer.userId
            );
            fetchSquad();
            alert("Player added successfully.");

            setShowAddPlayer(false);

            setSelectedPlayer(null);

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data ||
                "Failed to add player."
            );

        } finally {

            setLoading(false);

        }

    };
    const handleSelectPlayer = (player) => {

        if (selectedPlayers.some(p => p.userId === player.userId)) {
            return;
        }

        setSelectedPlayers(prev => [...prev, player]);
    };
    const removeSelectedPlayer = (userId) => {

        setSelectedPlayers(prev =>
            prev.filter(p => p.userId !== userId)
        );
    };
    const handleAddPlayers = async () => {

        try {

            const ids = selectedPlayers.map(p => p.userId);

            await addMultiplePlayers(teamId, ids);

            alert("Players added successfully.");

            setShowAddPlayers(false);
            setSelectedPlayers([]);

            
            fetchSquad();

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data?.error ||
                "Failed to add players."
            );

        }

    };
    const handleRemovePlayer = async (playerId) => {

        const confirmed = window.confirm(
            "Remove this player from the team?"
        );

        if (!confirmed) return;

        try {

            await removePlayer(teamId, playerId);

            alert("Player removed successfully.");

            fetchSquad();

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data?.error ||
                "Failed to remove player."
            );

        }

    };
    const fetchSquad = async () => {

        try {

            const data = await getTeamSquad(teamId);

            setSquad(data);

        } catch (err) {

            console.error(err);

            alert("Failed to load squad.");

        }

    };

    useEffect(() => {
        fetchSquad();
    }, []);
    return (

        <div className="min-h-screen bg-black text-white p-8">

            <div className="max-w-6xl mx-auto">

                {/* Back */}

                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-400 hover:text-blue-300 mb-8"
                >
                    ← Back
                </button>

                {/* Header */}

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">

                    <div className="flex items-center gap-6">

                        <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-5xl">
                            🛡️
                        </div>

                        <div>

                            <h1 className="text-4xl font-bold">
                                Manage Team
                            </h1>

                            <p className="text-zinc-400 mt-2">
                                Team ID : {teamId}
                            </p>

                            <p className="text-zinc-500 mt-1">
                                Team information will be loaded here.
                            </p>

                        </div>

                    </div>

                </div>

                {/* Quick Actions */}

                <h2 className="text-2xl font-semibold mt-10 mb-5">
                    Quick Actions
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

                    {/* Add Player */}

                    <button
                        onClick={() => setShowAddPlayer(true)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-blue-500 transition text-left"
                    >

                        <div className="text-4xl mb-4">
                            ➕
                        </div>

                        <h3 className="text-xl font-semibold">
                            Add Player
                        </h3>

                        <p className="text-zinc-400 mt-2">
                            Add a single player to this team.
                        </p>

                    </button>

                    {/* Add Multiple */}

                    <button
                        onClick={() => setShowAddPlayers(true)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-blue-500 transition text-left"
                    >
                        <div className="text-4xl mb-4">
                            👥
                        </div>

                        <h3 className="text-xl font-semibold">
                            Add Multiple
                        </h3>

                        <p className="text-zinc-400 mt-2">
                            Add multiple players together.
                        </p>
                    </button>

                    {/* Edit */}

                    <button
                        onClick={() =>
                            navigate(`/dashboard/teams/${teamId}/edit`)
                        }
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-blue-500 transition text-left"
                    >
                        <div className="text-4xl mb-4">
                            ✏️
                        </div>

                        <h3 className="text-xl font-semibold">
                            Edit Team
                        </h3>

                        <p className="text-zinc-400 mt-2">
                            Update team details.
                        </p>
                    </button>



                </div>

                {/* Squad */}
                <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-xl p-8">

                    <h2 className="text-2xl font-semibold mb-6">
                        Squad
                    </h2>

                    {squad.length === 0 ? (

                        <p className="text-zinc-400">
                            No players found.
                        </p>

                    ) : (

                        <div className="space-y-4">

                            {squad.map(player => (

                                <div
                                    key={player.userId}
                                    className="flex items-center justify-between bg-zinc-800 rounded-lg p-4"
                                >

                                    <div className="flex items-center gap-4">

                                        <img
                                            src={player.profileImage}
                                            alt=""
                                            className="w-12 h-12 rounded-full object-cover"
                                        />

                                        <div>

                                            <h3 className="font-semibold flex items-center gap-2">

                                                {player.name}

                                                {player.captain && (
                                                    <span className="text-yellow-400 text-sm">
                                                        (C)
                                                    </span>
                                                )}

                                                {player.viceCaptain && (
                                                    <span className="text-blue-400 text-sm">
                                                        (VC)
                                                    </span>
                                                )}

                                            </h3>

                                            <p className="text-zinc-400 text-sm">
                                                {player.role}
                                            </p>

                                        </div>

                                    </div>

                                    {!player.captain && !player.viceCaptain && (

                                        <button
                                            onClick={() => handleRemovePlayer(player.userId)}
                                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                                        >
                                            Remove
                                        </button>

                                    )}

                                </div>

                            ))}

                        </div>

                    )}

                </div>


            </div>

            {/* Add Player Modal */}

            {showAddPlayer && (

                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

                    <div className="bg-zinc-900 rounded-xl w-full max-w-xl p-6 border border-zinc-700">

                        <h2 className="text-2xl font-bold mb-6">
                            Add Player
                        </h2>

                        <PlayerSearch
                            label="Search Player"
                            selectedPlayer={selectedPlayer}
                            onSelect={setSelectedPlayer}
                        />

                        <div className="flex justify-end gap-3 mt-8">

                            <button
                                type="button"
                                onClick={() => {

                                    setShowAddPlayer(false);

                                    setSelectedPlayer(null);

                                }}
                                className="px-5 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={!selectedPlayer || loading}
                                onClick={handleAddPlayer}
                                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Adding..." : "Add Player"}
                            </button>

                        </div>

                    </div>

                </div>

            )}
            {/* Add Players Modal */}
            {
                showAddPlayers && (

                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

                        <div className="bg-zinc-900 rounded-xl w-full max-w-2xl p-6">

                            <h2 className="text-2xl font-bold mb-6">
                                Add Multiple Players
                            </h2>

                            <PlayerSearch
                                label="Search Players"
                                selectedPlayer={null}
                                onSelect={handleSelectPlayer}
                            />

                            {selectedPlayers.length > 0 && (

                                <div className="mt-6">

                                    <h3 className="font-semibold mb-3">
                                        Selected Players
                                    </h3>

                                    <div className="flex flex-wrap gap-3">

                                        {selectedPlayers.map(player => (

                                            <div
                                                key={player.userId}
                                                className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-lg"
                                            >

                                                <img
                                                    src={player.profileImage}
                                                    alt=""
                                                    className="w-8 h-8 rounded-full"
                                                />

                                                <span>
                                                    {player.name}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        removeSelectedPlayer(player.userId)
                                                    }
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    ✕
                                                </button>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            )}

                            <div className="flex justify-end gap-3 mt-8">

                                <button
                                    onClick={() => {

                                        setShowAddPlayers(false);
                                        setSelectedPlayers([]);

                                    }}
                                    className="px-5 py-2 rounded-lg bg-zinc-700"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleAddPlayers}
                                    disabled={selectedPlayers.length === 0}
                                    className="px-5 py-2 rounded-lg bg-blue-600 disabled:opacity-50"
                                >
                                    Add {selectedPlayers.length || ""} Player{selectedPlayers.length !== 1 ? "s" : ""}
                                </button>

                            </div>

                        </div>

                    </div>

                )}


        </div>

    );

}

export default ManageTeamPage;
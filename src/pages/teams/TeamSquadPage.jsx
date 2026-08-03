import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTeamSquad } from "../../services/teamService";

function TeamSquadPage() {

    const { teamId } = useParams();

    const navigate = useNavigate();

    const [players, setPlayers] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSquad();
    }, []);

    const fetchSquad = async () => {

        try {

            const data = await getTeamSquad(teamId);

            setPlayers(data);

        } catch (err) {

            console.error(err);

            alert("Failed to load squad.");

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                Loading Squad...
            </div>
        );

    }

    return (

        <div className="min-h-screen bg-black text-white p-8">

            <div className="max-w-5xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-400 hover:text-blue-300 mb-8"
                >
                    ← Back
                </button>

                <h1 className="text-4xl font-bold">
                    Team Squad
                </h1>

                <p className="text-zinc-400 mt-2 mb-8">
                    {players.length} Players
                </p>

                <div className="space-y-4">

                    {players.map(player => (

                        <div
                            key={player.userId}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between"
                        >

                            <div className="flex items-center gap-4">

                                <img
                                    src={player.profileImage}
                                    alt={player.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />

                                <div>

                                    <div className="flex items-center gap-3">

                                        <h2 className="text-xl font-semibold">
                                            {player.name}
                                        </h2>

                                        {player.captain &&
                                            <span className="bg-yellow-600 text-xs px-2 py-1 rounded">
                                                Captain
                                            </span>
                                        }

                                        {player.viceCaptain &&
                                            <span className="bg-blue-600 text-xs px-2 py-1 rounded">
                                                Vice Captain
                                            </span>
                                        }

                                    </div>

                                    <p className="text-zinc-400 mt-1">
                                        {player.userId}
                                    </p>

                                </div>

                            </div>

                            <span className="bg-zinc-800 px-4 py-2 rounded-lg">
                                {player.role.replace("_", " ")}
                            </span>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}

export default TeamSquadPage;
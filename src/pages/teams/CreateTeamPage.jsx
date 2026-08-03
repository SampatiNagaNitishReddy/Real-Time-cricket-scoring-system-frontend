import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PlayerSearch from "../../components/user/PlayerSearch";
import { createTeam } from "../../services/teamService";

function CreateTeamPage() {

    const navigate = useNavigate();

    const [name, setName] = useState("");

    const [captain, setCaptain] = useState(null);
    const [viceCaptain, setViceCaptain] = useState(null);

    const [teamLogo, setTeamLogo] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!captain) {
            alert("Please select a captain.");
            return;
        }

        if (!viceCaptain) {
            alert("Please select a vice captain.");
            return;
        }

        if (!teamLogo) {
            alert("Please select a team logo.");
            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append("name", name);
            formData.append("captain", captain.userId);
            formData.append("viceCaptain", viceCaptain.userId);
            formData.append("teamLogo", teamLogo);

            await createTeam(formData);

            alert("Team created successfully.");

            navigate("/dashboard/teams");

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data ||
                "Failed to create team."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-black text-white p-8">

            <div className="max-w-3xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-400 hover:text-blue-300 mb-6"
                >
                    ← Back
                </button>

                <h1 className="text-3xl font-bold mb-8">
                    Create Team
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 bg-zinc-900 rounded-xl p-8"
                >

                    {/* Team Name */}

                    <div>

                        <label className="block mb-2">
                            Team Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-800 rounded-lg px-4 py-3 outline-none"
                            placeholder="Enter Team Name"
                            required
                        />

                    </div>

                    {/* Captain */}

                    <PlayerSearch
                        label="Captain"
                        selectedPlayer={captain}
                        onSelect={setCaptain}
                        excludeIds={
                            viceCaptain
                                ? [viceCaptain.userId]
                                : []
                        }
                    />

                    {/* Vice Captain */}

                    <PlayerSearch
                        label="Vice Captain"
                        selectedPlayer={viceCaptain}
                        onSelect={setViceCaptain}
                        excludeIds={
                            captain
                                ? [captain.userId]
                                : []
                        }
                    />

                    {/* Team Logo */}

                    <div>

                        <label className="block mb-2">
                            Team Logo
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setTeamLogo(e.target.files[0])
                            }
                            className="block w-full text-sm"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-semibold disabled:opacity-60"
                    >
                        {loading
                            ? "Creating Team..."
                            : "Create Team"}
                    </button>

                </form>

            </div>

        </div>

    );

}

export default CreateTeamPage;
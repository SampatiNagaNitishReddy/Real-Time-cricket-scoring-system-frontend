import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PlayerSearch from "../../components/user/PlayerSearch";
import {
    updateTeam,
    getTeamDetails
} from "../../services/teamService";

function EditTeamPage() {

    const navigate = useNavigate();

    const { teamId } = useParams();

    const [name, setName] = useState("");

    const [captain, setCaptain] = useState(null);

    const [viceCaptain, setViceCaptain] = useState(null);

    const [teamLogo, setTeamLogo] = useState(null);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {

        try {

            const team = await getTeamDetails(teamId);

            setName(team.name);

            setCaptain({
                userId: team.captain,
                name: team.captainName,
            });

            setViceCaptain({
                userId: team.viceCaptain,
                name: team.viceCaptainName,
            });

        } catch (err) {

            console.error(err);

            alert("Failed to load team.");

            navigate(-1);

        } finally {

            setLoading(false);

        }

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            const formData = new FormData();

            formData.append("name", name);
            formData.append("captain", captain.userId);
            formData.append("viceCaptain", viceCaptain.userId);

            if (teamLogo) {
                formData.append("teamLogo", teamLogo);
            }

            await updateTeam(teamId, formData);

            alert("Team updated successfully.");

            navigate(-1);

        } catch (err) {

            console.error(err);

            alert(
                err.response?.data?.error ||
                "Failed to update team."
            );

        } finally {

            setSaving(false);

        }

    };

    if (loading) {

        return (

            <div className="min-h-screen bg-black text-white flex items-center justify-center">

                Loading team...

            </div>

        );

    }

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
                    Edit Team
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 bg-zinc-900 p-8 rounded-xl"
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
                            required
                        />

                    </div>

                    {/* Captain */}

                    <PlayerSearch
                        label="Captain"
                        selectedPlayer={captain}
                        onSelect={setCaptain}
                    />

                    {/* Vice Captain */}

                    <PlayerSearch
                        label="Vice Captain"
                        selectedPlayer={viceCaptain}
                        onSelect={setViceCaptain}
                    />

                    {/* Team Logo */}

                    <div>

                        <label className="block mb-2">
                            Team Logo (Optional)
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setTeamLogo(e.target.files[0])}
                            className="block w-full text-sm"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-semibold"
                    >
                        {saving ? "Updating..." : "Update Team"}
                    </button>

                </form>

            </div>

        </div>

    );

}

export default EditTeamPage;
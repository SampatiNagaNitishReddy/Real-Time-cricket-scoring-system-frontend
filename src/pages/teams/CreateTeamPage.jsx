import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import PlayerSearch from "../../components/user/PlayerSearch";
import { Field, Spinner } from "../../components/auth/fields";
import { createTeam } from "../../services/teamService";

// The backend may send a string, { error } or { message }
const errorMessage = (err, fallback) => {
    const data = err.response?.data;
    if (typeof data === "string" && data) return data;
    return data?.error || data?.message || fallback;
};

function Section({ title, description, children }) {
    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

            <h2 className="text-lg font-semibold text-white">{title}</h2>

            {description && (
                <p className="mt-1 text-sm text-zinc-400">{description}</p>
            )}

            <div className="mt-5">{children}</div>

        </section>
    );
}

function CreateTeamPage() {

    const navigate = useNavigate();

    const [name, setName] = useState("");

    const [captain, setCaptain] = useState(null);
    const [viceCaptain, setViceCaptain] = useState(null);

    const [teamLogo, setTeamLogo] = useState(null);
    const [preview, setPreview] = useState(null);

    const [loading, setLoading] = useState(false);

    // Release the preview URL when it changes or the page closes
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleLogo = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setTeamLogo(file);

        setPreview(URL.createObjectURL(file));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!captain) {
            toast.error("Please select a captain.");
            return;
        }

        if (!viceCaptain) {
            toast.error("Please select a vice captain.");
            return;
        }

        if (!teamLogo) {
            toast.error("Please select a team logo.");
            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append("name", name.trim());
            formData.append("captain", captain.userId);
            formData.append("viceCaptain", viceCaptain.userId);
            formData.append("teamLogo", teamLogo);

            await createTeam(formData);

            toast.success("Team created successfully");

            navigate("/dashboard/teams");

        } catch (err) {

            console.error(err);

            toast.error(errorMessage(err, "Failed to create team."));

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">

            <div className="mx-auto max-w-3xl">

                <Link
                    to="/dashboard/teams"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-white"
                >
                    <span aria-hidden="true">←</span> My teams
                </Link>

                <h1 className="text-3xl font-bold sm:text-4xl">
                    Create team
                </h1>

                <p className="mb-8 mt-2 text-zinc-400">
                    Give your team a name and a logo, then choose who leads it.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* Identity */}
                    <Section
                        title="Team identity"
                        description="How your team appears on match cards and scorecards."
                    >

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                            {/* Logo */}
                            <div className="flex items-center gap-4">

                                <label
                                    htmlFor="teamLogo"
                                    className="group relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-zinc-600 bg-zinc-800 transition focus-within:border-green-500 hover:border-green-500"
                                >
                                    <input
                                        id="teamLogo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogo}
                                        className="sr-only"
                                    />

                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Team logo preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center text-3xl">
                                            🛡️
                                        </span>
                                    )}

                                    <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-xs text-white opacity-0 transition group-hover:opacity-100">
                                        Change
                                    </span>
                                </label>

                                <div className="sm:hidden">
                                    <p className="font-medium text-white">Team logo</p>
                                    <label
                                        htmlFor="teamLogo"
                                        className="cursor-pointer text-sm font-medium text-green-400 hover:text-green-300"
                                    >
                                        {preview ? "Choose a different logo" : "Upload logo"}
                                    </label>
                                </div>

                            </div>

                            {/* Name */}
                            <div className="flex-1">

                                <Field
                                    label="Team name"
                                    id="teamName"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Royal Challengers"
                                    autoComplete="off"
                                    required
                                />

                                <p className="mt-2 hidden text-sm text-zinc-500 sm:block">
                                    Team logo (required):{" "}
                                    <label
                                        htmlFor="teamLogo"
                                        className="cursor-pointer font-medium text-green-400 hover:text-green-300"
                                    >
                                        {preview ? "choose a different one" : "upload one"}
                                    </label>
                                </p>

                            </div>

                        </div>

                    </Section>

                    {/* Leadership */}
                    <Section
                        title="Leadership"
                        description="Search for registered players. The captain and vice-captain must be different people."
                    >

                        <div className="-mb-6 grid gap-x-5 sm:grid-cols-2">

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

                            <PlayerSearch
                                label="Vice captain"
                                selectedPlayer={viceCaptain}
                                onSelect={setViceCaptain}
                                excludeIds={
                                    captain
                                        ? [captain.userId]
                                        : []
                                }
                            />

                        </div>

                    </Section>

                    {/* Actions */}
                    <div className="space-y-4">

                        <p className="text-center text-sm text-zinc-500">
                            You can add the rest of the squad from the Manage team page after creating the team.
                        </p>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">

                            <Link
                                to="/dashboard/teams"
                                className="rounded-lg border border-zinc-700 px-6 py-3 text-center font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading && <Spinner />}
                                {loading ? "Creating team..." : "Create team"}
                            </button>

                        </div>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default CreateTeamPage;